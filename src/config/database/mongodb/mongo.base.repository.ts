import {
  Model,
  Types,
  Document,
  FilterQuery,
  QueryOptions,
  UpdateQuery,
  PipelineStage,
} from 'mongoose';
import { MongoDBInterfaceRepository } from './mongo.base.interface';
import { ObjectId } from 'bson';

type Plain<T> = Omit<T, keyof Document>;

export abstract class MongoDBRepository<T extends Document>
  implements MongoDBInterfaceRepository<T>
{
  protected constructor(protected readonly model: Model<T>) {}

  async findQueryPersonalized(query: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(query).exec();
  }

  async findWithRelations(
    pipeline: PipelineStage[] = [],
    options: object = {},
  ): Promise<T[]> {
    return this.model.aggregate(pipeline).option(options).exec();
  }

  async save(entity: Partial<T>): Promise<T> {
    const created = new this.model(entity);
    const saved = await created.save();
    return saved.toObject() as T;
  }

  async saveMany(data: Partial<T>[]): Promise<T[]> {
    const inserted = await this.model.insertMany(data);
    return inserted.map((doc) => doc.toObject() as T);
  }

  async findOneById(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findAll(
    filter: FilterQuery<T> = {},
    options?: QueryOptions,
  ): Promise<T[]> {
    return this.model.find(filter, null, options).exec();
  }

  async remove(
    id: string | Types.ObjectId,
  ): Promise<{ deletedCount?: number }> {
    const result = await this.model.deleteOne({ _id: id });
    return { deletedCount: result.deletedCount };
  }

  async update(
    id: string | Types.ObjectId,
    query: UpdateQuery<T>,
  ): Promise<any> {
    return this.model.updateOne({ _id: id }, query).exec();
  }
}
