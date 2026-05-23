import { Injectable } from '@nestjs/common';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Subscriber, SubscriberDocument } from '../schema/subscriber.schema';
import { SubscriberCount } from '../interfaces/subscriber-count.interface';

@Injectable()
export abstract class ISubscriberRepository extends MongoDBRepository<SubscriberDocument> {
  abstract findByEmail(email: string): Promise<SubscriberDocument | null>;
  abstract findBySource(source: string): Promise<SubscriberDocument | null>;
  abstract findByEmailAndSource(
    email: string,
    source: string,
  ): Promise<SubscriberDocument | null>;
  abstract findAllSubscribers(
    skip: number,
    take: number,
    search?: string | null,
  ): Promise<[SubscriberDocument[], number]>;
  abstract getSubscriberStats(): Promise<SubscriberCount>;
  abstract createSubscriber(data: SubscriberDocument): Promise<Subscriber>;
  abstract updateSubscriber(
    id: string,
    data: Partial<SubscriberDocument>,
  ): Promise<boolean>;
  abstract deleteSubscriber(email: string): Promise<boolean>;
  abstract countSubscribers(): Promise<number>;
  abstract findById(id: string): Promise<SubscriberDocument | null>;
  abstract findByEmailAndStatus(
    email: string,
    status: boolean,
  ): Promise<SubscriberDocument | null>;
  abstract findByStatus(
    status: boolean,
    skip: number,
    take: number,
  ): Promise<[SubscriberDocument[], number]>;
  abstract subscriptionAlredyExist(
    email: string,
    id?: string,
  ): Promise<boolean>;
}
