import { TUpdateOptions } from '../../types/update-options';
import { Session } from './session';
import { TFilters } from '../../types/filters';
import { TValues } from '../../types/values';
import { ISequelizeService } from '../../interfaces/sequelize-service';
import * as Lodash from 'lodash';
import { TValuesMap } from '../../types/values-map';

export class UpdateSession<A> extends Session<A, TUpdateOptions<A>> {
  private values: TValuesMap<A>;

  public constructor(filters: TFilters<A>, values: TValues<A>, options: TUpdateOptions<A>, service: ISequelizeService<A>) {
    super([], options, service, filters);
    this.values = <TValuesMap<A>>new Map(Lodash.toPairs(values));
  }

  public getValues() {
    return this.values;
  }

  public hasValue(key: keyof A) {
    return this.values.has(key);
  }

  public getValue<T extends Partial<A>[keyof A]>(key: keyof A): T {
    return <T>this.values.get(key);
  }

  public setValue(key: keyof A, value: Partial<A>[keyof A]) {
    this.values.set(key, value);
  }
}