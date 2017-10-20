import { TFilters } from '../types/filters';
import { TFindOptions } from '../types/find-options';
import { Collection } from '@bluejay/collection';
import { TFindOneOptions } from '../types/find-one-options';
import { TFindByPrimaryKeyOptions } from '../types/find-by-primary-key-options';
import { TUpdateOptions } from '../types/update-options';
import { TValues } from '../types/values';
import { TUpdateByPrimaryKeyOptions } from '../types/update-by-primary-key-options';
import { TDeleteOptions } from '../types/delete-options';
import { TCountOptions } from '../types/count-options';
import { TReplaceOneOptions } from '../types/replace-one-options';

export interface ISequelizeService<A, CP> {
  getPrimaryKeyField(): keyof A;
  create(object: A): Promise<A>;
  createMany(objects: A[]): Promise<Collection<A>>;
  find(filters: TFilters<A>, options?: TFindOptions<A, CP>): Promise<Collection<A & CP>>;
  warn(condition: boolean, message: string, data?: object): void;
  findOne(filters: TFilters<A>, options?: TFindOneOptions<A, CP>): Promise<A & CP>;
  findByPrimaryKey(pk: string | number, options?: TFindByPrimaryKeyOptions<A, CP>): Promise<A & CP>;
  findByPrimaryKeys(pks: string[] | number[], options?: TFindByPrimaryKeyOptions<A, CP>): Promise<Collection<A & CP>>;
  update(filters: TFilters<A>, values: TValues<A>, options?: TUpdateOptions<A>): Promise<number>;
  updateByPrimaryKey(pk: string | number, values: TValues<A>, options?: TUpdateByPrimaryKeyOptions<A>): Promise<number>;
  delete(filters: TFilters<A>, options?: TDeleteOptions<A>): Promise<number>;
  count(filters: TFilters<A>, options?: TCountOptions<A>): Promise<number>;
  replaceOne(filters: TFilters<A>, values: A, options?: TReplaceOneOptions<A, CP>): Promise<A & CP>;
}