import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schema/session.schema';
import { TransformDto } from '@/shared/utils';
import { SessionRepository } from './repository/session.repository';
import { ISessionRepository } from './repository/session.interface.repository';
import { SessionService } from './service/session.service';
import { SessionController } from './controller/session.controller';
import { CoreModule } from '@/core/core.module';

@Module({
  controllers: [SessionController],
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    CoreModule,
  ],
  providers: [
    SessionRepository,
    SessionService,
    {
      provide: ISessionRepository,
      useClass: SessionRepository,
    },
    TransformDto,
  ],
  exports: [SessionService, SessionRepository, ISessionRepository],
})
export class SessionModule {}
