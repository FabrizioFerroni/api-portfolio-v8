import {
  FilterQuery,
  QueryOptions,
  UpdateQuery,
  UpdateWriteOpResult,
  Document,
  Types,
  PipelineStage,
} from 'mongoose';

export interface MongoDBInterfaceRepository<T> {
  save(entity: Partial<T>): Promise<T>;
  saveMany(data: Partial<T>[]): Promise<T[]>;
  findOneById(id: string | Types.ObjectId): Promise<T | null>;
  findAll(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]>;
  remove(id: string | Types.ObjectId): Promise<{ deletedCount?: number }>;
  findWithRelations(pipeline?: PipelineStage[], options?: object): Promise<T[]>;
  update(
    id: string | Types.ObjectId,
    query: UpdateQuery<T>,
  ): Promise<UpdateWriteOpResult>;
  findQueryPersonalized(query: FilterQuery<T>): Promise<T | null>;
}
