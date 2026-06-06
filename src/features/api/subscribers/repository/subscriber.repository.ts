import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Subscriber, SubscriberDocument } from '../schema/subscriber.schema';
import { ISubscriberRepository } from './subscriber.interface.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  QueryOptions,
  UpdateWriteOpResult,
} from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SubscriberError } from '../messages/subscriber.messages';
import { ObjectId } from 'bson';
import { SubscriberCount } from '../interfaces/subscriber-count.interface';
import {
  getCurrentMonthRange,
  getPreviousMonthRange,
} from '@/shared/utils/functions/date.utils';

@Injectable()
export class SubscriberRepository
  extends MongoDBRepository<SubscriberDocument>
  implements ISubscriberRepository
{
  constructor(
    @InjectModel(Subscriber.name)
    private readonly subscriberModel: Model<SubscriberDocument>,
  ) {
    super(subscriberModel);
  }

  async findByEmail(email: string): Promise<SubscriberDocument | null> {
    const subscriber = await this.subscriberModel.findOne({ email });
    return subscriber ? subscriber.toJSON() : null;
  }

  async findBySource(source: string): Promise<SubscriberDocument | null> {
    const subscriber = await this.subscriberModel.findOne({ source });
    return subscriber ? subscriber.toJSON() : null;
  }

  async findByEmailAndSource(
    email: string,
    source: string,
  ): Promise<SubscriberDocument | null> {
    const subscriber = await this.subscriberModel.findOne({ email, source });
    return subscriber ? subscriber.toJSON() : null;
  }

  async findAllSubscribers(
    skip: number,
    take: number,
    search?: string | null,
  ): Promise<[SubscriberDocument[], number]> {
    const options: QueryOptions = {};

    if (typeof skip === 'number') options.skip = skip;
    if (typeof take === 'number') options.limit = take;

    const filter: FilterQuery<SubscriberDocument> = search?.trim()
      ? search.includes('@')
        ? { email: { $regex: search.trim(), $options: 'i' } }
        : { name: { $regex: search.trim(), $options: 'i' } }
      : {};

    const allSubscribers: SubscriberDocument[] = await this.findAll(
      filter,
      options,
    );

    const plainSubscribers: any[] = allSubscribers.map(
      (subscriber: SubscriberDocument) => subscriber.toObject(),
    );

    const total: number = await this.model.countDocuments(filter);

    return [plainSubscribers, total];
  }

  async getSubscriberStats(): Promise<SubscriberCount> {
    const [total, active] = await Promise.all([
      this.model.countDocuments({}),
      this.model.countDocuments({ status: true }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
    };
  }

  async countThisMonth(): Promise<number> {
    const { start, end } = getCurrentMonthRange();
    return this.subscriberModel
      .countDocuments({
        createdAt: { $gte: start, $lt: end },
      })
      .exec();
  }

  async countPreviousMonth(): Promise<number> {
    const { start, end } = getPreviousMonthRange();
    return this.subscriberModel
      .countDocuments({
        createdAt: { $gte: start, $lt: end },
      })
      .exec();
  }

  async createSubscriber(data: SubscriberDocument): Promise<Subscriber> {
    const subscriber: Subscriber = plainToInstance(Subscriber, data);
    const subscriberCreated: SubscriberDocument = await this.save(subscriber);

    if (!subscriberCreated._id) {
      throw new InternalServerErrorException(
        SubscriberError.INTERNAL_SERVER_ERROR,
      );
    }

    return subscriber;
  }

  async updateSubscriber(
    id: string,
    data: Partial<SubscriberDocument>,
  ): Promise<boolean> {
    const subscriber: Subscriber = plainToInstance(Subscriber, data);

    const query = {
      $set: subscriber,
    };

    const subscriberUpdated: UpdateWriteOpResult =
      await this.subscriberModel.updateOne({ _id: id }, query);

    if (!subscriberUpdated.acknowledged) {
      return false;
    }

    if (subscriberUpdated.modifiedCount !== 1) {
      throw new InternalServerErrorException(
        SubscriberError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }

  async deleteSubscriber(email: string): Promise<boolean> {
    const subscriberDeleted = await this.subscriberModel.deleteOne({ email });

    if (subscriberDeleted.deletedCount !== 1) {
      throw new InternalServerErrorException(
        SubscriberError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }

  async countSubscribers(): Promise<number> {
    return this.subscriberModel.countDocuments({});
  }

  async findById(id: string): Promise<SubscriberDocument | null> {
    const subscriber = await this.subscriberModel.findById(id);
    return subscriber ? subscriber.toJSON() : null;
  }

  async findByEmailAndStatus(
    email: string,
    status: boolean,
  ): Promise<SubscriberDocument | null> {
    const subscriber = await this.subscriberModel.findOne({
      email,
      status: true,
    });
    return subscriber ? subscriber.toJSON() : null;
  }
  async findByStatus(
    status: boolean,
    skip: number,
    take: number,
  ): Promise<[SubscriberDocument[], number]> {
    const options: QueryOptions = {};
    if (typeof skip === 'number') options.skip = skip;
    if (typeof take === 'number') options.limit = take;

    const allSubscribers = await this.findAll({ status }, options);

    const plainSubscribers = allSubscribers.map((subscriber) =>
      subscriber.toObject(),
    );

    const total = await this.model.countDocuments({ status });

    return [plainSubscribers, total];
  }

  async subscriptionAlredyExist(email: string, id?: string): Promise<boolean> {
    let result: Subscriber;

    if (!id) {
      result = await this.subscriberModel.findOne({ email: String(email) });
    } else {
      result = await this.subscriberModel.findOne({
        email: email,
        _id: { $ne: new ObjectId(id) },
      });
    }

    return !!result;
  }
}
