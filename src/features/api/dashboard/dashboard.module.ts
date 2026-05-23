import { CoreModule } from '@/core/core.module';
import { TransformDto } from '@/shared/utils';
import { Module } from '@nestjs/common';
import { DashboardService } from './service/dashboard.service';
import { DashboardRepository } from './repository/dashboard.repository';
import { IDashboardRepository } from './repository/dashboard.interface.repository';
import { SubscribersModule } from '../subscribers/subscribers.module';
import { ProjectModule } from '../projects/projects.module';
import { AuditsModule } from '../audits/audits.module';
import { ContactsModule } from '../contacts/contacts.module';
import { DashboardController } from './controller/dashboard.controller';

@Module({
  imports: [
    CoreModule,
    SubscribersModule,
    ProjectModule,
    AuditsModule,
    ContactsModule,
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    DashboardRepository,
    {
      provide: IDashboardRepository,
      useClass: DashboardRepository,
    },
    TransformDto,
  ],
  exports: [DashboardService, DashboardRepository, IDashboardRepository],
})
export class DashboardModule {}
