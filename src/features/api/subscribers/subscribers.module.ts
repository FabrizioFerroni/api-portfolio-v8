import { Module } from '@nestjs/common';
import { SubscriberService } from './service/subscriber.service';
import { SubscriberController } from './controller/subscriber.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscriber, SubscriberSchema } from './schema/subscriber.schema';
import { CoreModule } from '@/core/core.module';
import { SubscriberRepository } from './repository/subscriber.repository';
import { ISubscriberRepository } from './repository/subscriber.interface.repository';
import { TransformDto } from '@/shared/utils';

@Module({
  imports: [
    CoreModule,
    MongooseModule.forFeature([
      { name: Subscriber.name, schema: SubscriberSchema },
    ]),
  ],
  controllers: [SubscriberController],
  providers: [
    SubscriberService,
    SubscriberRepository,
    {
      provide: ISubscriberRepository,
      useClass: SubscriberRepository,
    },
    TransformDto,
  ],
  exports: [SubscriberService, SubscriberRepository, ISubscriberRepository],
})
export class SubscribersModule {}
