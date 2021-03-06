import { Collection } from '@bluejay/collection';
import * as Lodash from 'lodash';
import * as stringify from 'stringify-object';
import { ISequelizeService } from '../interfaces/sequelize-service';
import { ISession } from '../interfaces/session';
import { TAllOptions } from '../types/all-options';
import { TContext } from '../types/context';
import { TFilters } from '../types/filters';
import { TFiltersMap } from '../types/filters-map';
import { TFindOptions } from '../types/find-options';
import { TOptionsMap } from '../types/options-map';
import { TSafeOptions } from '../types/safe-options';
import { Context } from './context';

export class Session<W extends {}, R extends W, C extends {}, O extends TSafeOptions = TAllOptions<R, C, keyof R, keyof C>> extends Collection<Partial<R> & Partial<C>> implements ISession<W, R, C, O> {
  private readonly context: TContext<any>;
  private readonly options: TOptionsMap<O>;
  private readonly service: ISequelizeService<W, R, C>;
  private readonly filters: TFiltersMap<R>;

  public constructor(
    objects: (Partial<R> & Partial<C>)[],
    options: O,
    service: ISequelizeService<W, R, C>,
    filters?: TFilters<R>
  ) {
    super(objects);
    this.context = options.context || new Context({});
    this.options = <TOptionsMap<O>>new Map(Lodash.toPairs(options));
    this.service = service;
    this.filters = <TFiltersMap<R>>new Map(Lodash.toPairs(filters || { [this.service.getPrimaryKeyField()]: null }));
  }

  public getOptions() {
    return this.options;
  }

  public getContext<T extends {}>(): TContext<T> {
    return this.context;
  }

  public getOption<K extends keyof O>(key: K): O[K] {
    return this.options.get(key);
  }

  public setOption<K extends keyof O>(key: K, value: O[K]): this {
    this.options.set(key, value);
    return this;
  }

  public hasOption(key: keyof O): boolean {
    return this.options.has(key);
  }

  public unsetOption(key: keyof O): this {
    this.options.delete(key);
    return this;
  }

  public getSafeOptions<TR extends {} = R, TC extends {} = C>(overrides: Partial<TAllOptions<TR, TC, keyof TR, keyof TC>> = {}): TSafeOptions {
    const options: TSafeOptions = {};

    for (const key of <(keyof O)[]>['transaction', 'context', 'skipHooks', 'useMaster']) {
      options[key as keyof TSafeOptions] = this.options.get(key);
    }

    return Object.assign(options, overrides);
  }

  public getFilters(): TFiltersMap<R> {
    return this.filters;
  }

  public getRawFilters(): TFilters<R> {
    return <any>Lodash.fromPairs(Array.from(this.getFilters()));
  }

  public hasFilters(): boolean {
    return Object.keys(this.getRawFilters()).length > 0;
  }

  public hasFilter(key: keyof R): boolean {
    return this.filters.has(key);
  }

  public isIdentified(): boolean {
    if (!this.size()) {
      return false;
    }

    const primaryKeyField = this.service.getPrimaryKeyField();
    let oneIdentified = false;
    let allIdentified = true;

    for (const object of this.getObjects()) {
      if (primaryKeyField in object) {
        oneIdentified = true;
      } else if (oneIdentified) {
        throw new Error(`Inconsistent non identified object in session : ${stringify(object)}.`);
      } else {
        allIdentified = false;
        break;
      }
    }

    return allIdentified;
  }

  public async fetch<KR extends keyof R, KC extends keyof C>(options: TFindOptions<R, C, KR, KC>): Promise<void> {
    this.service.warn(!this.hasFilters() && !('limit' in options), `Fetching entire table.`);

    const primaryKeyField = this.service.getPrimaryKeyField();

    const newObjects = await this.service.find(this.getRawFilters(), options);

    if (this.isIdentified()) {
      for (const object of this) {
        const newObject = newObjects.findByProperties(<any>{ [primaryKeyField]: object[primaryKeyField] });
        if (!newObject) {
          throw new Error(`Unable to find matching object with primary key ${object[primaryKeyField]}.`);
        }
        Object.assign(object, newObject); // Refresh existing object
      }
    } else {
      this.setObjects(newObjects.toArray());
    }
  }

  public async ensureProperties<KR extends keyof R, KC extends keyof C>(options: TFindOptions<R, C, KR, KC>): Promise<void> {
    const select = options.select || [];
    const computedProperties = options.compute || [];

    let allSet = true;

    for (const object of this.getObjects()) {
      for (const prop of select) {
        if (!(prop in object)) {
          allSet = false;
          break;
        }
      }

      for (const prop of computedProperties) {
        if (!(prop in object)) {
          allSet = false;
          break;
        }
      }
    }

    if (!this.size() || !allSet) {
      await this.fetch(options);
    }
  }

  public async ensureIdentified(options: TSafeOptions = {}): Promise<void> {
    return await this.ensureProperties(Object.assign(options, { select: [this.service.getPrimaryKeyField()] }));
  }

  protected getService() {
    return this.service;
  }
}