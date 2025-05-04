import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  QueryRunner,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface MySQLInterfaceRepository<T> {
  create(data: DeepPartial<T>): T;
  createMany(data: DeepPartial<T>[]): T[];
  save(data: DeepPartial<T>): Promise<T>;
  saveMany(data: DeepPartial<T>[]): Promise<T[]>;
  findOneById(id: string): Promise<T>;
  findByCondition(filterCondition: FindOneOptions<T>): Promise<T>;
  findAll(options?: FindManyOptions<T>): Promise<T[] | T>;
  findBorrado(options?: FindOptionsWhere<T>): Promise<T>;
  findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]>;
  remove(data: T): Promise<T>;
  softRemove(data: T): Promise<T>;
  softDelete(data: string): Promise<UpdateResult>;
  delete(id: string): Promise<DeleteResult>;
  restore(id: string): Promise<UpdateResult>;
  update(id: string, data: QueryDeepPartialEntity<T>): Promise<UpdateResult>;
  findWithRelations(relations: FindManyOptions<T>): Promise<T[]>;
  preload(entityLike: DeepPartial<T>): Promise<T>;
  query(query: string, parameters?: any[]): Promise<any>;
  queryBuilder(
    alias: string,
    queryRunner: QueryRunner,
  ): Promise<SelectQueryBuilder<T>>;
  exists(options: FindManyOptions<T>): Promise<boolean>;
}
