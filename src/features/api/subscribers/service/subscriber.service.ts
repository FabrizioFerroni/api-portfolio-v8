import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ISubscriberRepository } from '../repository/subscriber.interface.repository';
import { TransformDto } from '@/shared/utils';
import { SubscriberResponseDto } from '../dto/response/subscriber.response.dto';
import { Subscriber, SubscriberDocument } from '../schema/subscriber.schema';
import { PaginationService } from '@/core/services/pagination.service';
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';
import { DefaultPageSize } from '@/shared/utils/constants/querying';
import { PaginationMeta } from '@/core/interfaces/pagination-meta.interface';
import { CreateSubcriberDto } from '../dto/create-subcriber.dto';
import { SubscriberError, SubscriberOk } from '../messages/subscriber.messages';
import { UpdateSubscriberDto } from '../dto/update-subcriber.dto';
import { configApp } from '@/config/app/config.app';
import { SubscriberCount } from '../interfaces/subscriber-count.interface';

@Injectable()
export class SubscriberService {
  private readonly logger: Logger = new Logger(SubscriberService.name, {
    timestamp: true,
  });

  constructor(
    private readonly subscriberRepo: ISubscriberRepository,
    @Inject(TransformDto)
    private readonly transform: TransformDto<
      SubscriberDocument,
      SubscriberResponseDto
    >,
    private readonly paginationService: PaginationService,
  ) {}

  transformArray(data: SubscriberDocument[]) {
    return this.transform.transformDtoArray(data, SubscriberResponseDto);
  }

  transformObject(data: SubscriberDocument) {
    return this.transform.transformDtoObject(data, SubscriberResponseDto);
  }

  async getAllSubscribers(
    param: PaginationDto,
  ): Promise<{ subscribers: SubscriberResponseDto[]; meta: PaginationMeta }> {
    const { page, limit, search } = param;

    const take: number = limit ?? DefaultPageSize.SUBSCRIBERS; // Default page size
    const skip: number = this.paginationService.calculateOffset(limit, page);

    const [data, count] = await this.subscriberRepo.findAllSubscribers(
      skip,
      take,
      search,
    );

    const subscribers: SubscriberResponseDto[] = this.transformArray(data);

    const meta: PaginationMeta = this.paginationService.createMeta(
      limit,
      page,
      count,
    );

    return { subscribers, meta };
  }

  async countAllSubscriber(): Promise<SubscriberCount> {
    const countSub: SubscriberCount =
      await this.subscriberRepo.getSubscriberStats();

    return countSub;
  }

  async getSubscriberById(id: string): Promise<SubscriberResponseDto> {
    const subscriber = await this.subscriberRepo.findById(id);
    if (!subscriber) {
      throw new NotFoundException(`Subscriber with ID ${id} not found`);
    }
    return this.transformObject(subscriber);
  }

  async getSubscriberByEmail(email: string): Promise<SubscriberResponseDto> {
    const subscriber = await this.subscriberRepo.findByEmail(email);
    if (!subscriber) {
      throw new NotFoundException(`Subscriber with email ${email} not found`);
    }
    return this.transformObject(subscriber);
  }

  async getSubscriberBySource(source: string): Promise<SubscriberResponseDto> {
    const subscriber = await this.subscriberRepo.findBySource(source);
    if (!subscriber) {
      throw new NotFoundException(`Subscriber with source ${source} not found`);
    }
    return this.transformObject(subscriber);
  }

  async getSubscriberByEmailAndSource(
    email: string,
    source: string,
  ): Promise<SubscriberResponseDto> {
    const subscriber = await this.subscriberRepo.findByEmailAndSource(
      email,
      source,
    );
    if (!subscriber) {
      throw new NotFoundException(
        `Subscriber with email ${email} and source ${source} not found`,
      );
    }
    return this.transformObject(subscriber);
  }

  async getSubscribersByStatus(
    status: string,
    param: PaginationDto,
  ): Promise<{ subscribers: SubscriberResponseDto[]; meta: PaginationMeta }> {
    const { page, limit } = param;

    const take = limit ?? DefaultPageSize.SUBSCRIBERS;
    const skip = this.paginationService.calculateOffset(limit, page);

    const [data, count] = await this.subscriberRepo.findByStatus(
      Boolean(status),
      skip,
      take,
    );

    const subscribers: SubscriberResponseDto[] = this.transformArray(data);

    const meta = this.paginationService.createMeta(limit, page, count);

    return { subscribers, meta };
  }

  async createSubscriber(data: CreateSubcriberDto): Promise<string> {
    const subscriptionAlredyExist: boolean =
      await this.subscriberRepo.subscriptionAlredyExist(data.email);

    if (subscriptionAlredyExist) {
      throw new BadRequestException(SubscriberError.SUBSCRIBER_ALREADY_EXIST);
    }
    const newSubscriber = {};

    for (const key in data) {
      if (data[key] ?? false) newSubscriber[key] = data[key];
    }

    const createSubOS: boolean = await this.createSubOnOS(data);

    if (!createSubOS) {
      throw new BadRequestException(SubscriberError.SUBSCRIBER_ERROR);
    }

    const result: Subscriber = await this.subscriberRepo.createSubscriber(
      newSubscriber as SubscriberDocument,
    );

    if (!result) {
      throw new BadRequestException(SubscriberError.SUBSCRIBER_ERROR);
    }

    return SubscriberOk.SUBSCRIBER_CREATED;
  }

  private async createSubOnOS(data: CreateSubcriberDto): Promise<boolean> {
    if (configApp().env === 'test') {
      return true;
    }

    const { name, email } = data;
    // Logic to create subscriber on external service. n8n or any other service that you want to integrate with.
    return true;
  }

  async updateSubscriber(
    id: string,
    data: UpdateSubscriberDto,
  ): Promise<string> {
    const subscriptionAlredyExist: boolean =
      await this.subscriberRepo.subscriptionAlredyExist(data.email, id);

    if (subscriptionAlredyExist) {
      throw new BadRequestException(SubscriberError.SUBSCRIBER_ALREADY_EXIST);
    }

    const subscriber: SubscriberDocument =
      await this.subscriberRepo.findById(id);

    if (!subscriber) {
      throw new NotFoundException(
        `Subscriber with ID ${id} not found for update`,
      );
    }

    const subscriberToUpdate: Partial<SubscriberDocument> = {};

    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        subscriberToUpdate[key] = data[key];
      }
    }

    const result: boolean = await this.subscriberRepo.updateSubscriber(
      id,
      subscriberToUpdate,
    );

    if (!result) {
      throw new BadRequestException(SubscriberError.SUBSCRIBER_ERROR);
    }

    return SubscriberOk.SUBSCRIBER_UPDATED;
  }

  async unsubscribeSubscriber(email: string): Promise<string> {
    const subscriber: SubscriberDocument =
      await this.subscriberRepo.findByEmail(email);

    if (!subscriber) {
      throw new NotFoundException(
        `Subscriber with email ${email} not found for unsubscribe`,
      );
    }

    if (!subscriber.status) {
      throw new BadRequestException(SubscriberError.SUBSCRIBER_ALREADY_UNSUB);
    }

    const subscriberToUpdate: Partial<SubscriberDocument> = {};

    subscriberToUpdate.status = false;

    const result: boolean = await this.subscriberRepo.updateSubscriber(
      subscriber._id.toString(),
      subscriberToUpdate,
    );

    if (!result) {
      throw new BadRequestException(SubscriberError.SUBSCRIBER_ERROR);
    }

    return SubscriberOk.SUBSCRIBER_UNSUBSCRIBED;
  }

  async deleteSubscriber(email: string): Promise<string> {
    const subscriber: SubscriberDocument =
      await this.subscriberRepo.findByEmail(email);

    if (!subscriber) {
      throw new NotFoundException(
        `Subscriber with email ${email} not found for delete`,
      );
    }

    const subscriberDeleted: boolean =
      await this.subscriberRepo.deleteSubscriber(email);

    if (!subscriberDeleted) {
      throw new BadRequestException(SubscriberError.SUBSCRIBER_ERROR);
    }

    return SubscriberOk.SUBSCRIBER_DELETED;
  }

  async countSubscribers(): Promise<number> {
    return await this.subscriberRepo.countSubscribers();
  }
}
