import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuditsModule } from './audits/audits.module';
import { ContactsModule } from './contacts/contacts.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { ExperienceModule } from '@/features/api/experiences/experience.module';
import { ProjectModule } from './projects/projects.module';
import { SettingsModule } from './settings/settings.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    AuditsModule,
    ContactsModule,
    SubscribersModule,
    ExperienceModule,
    UserModule,
    ProjectModule,
    SettingsModule,
    DashboardModule,
  ],
  exports: [
    AuditsModule,
    ContactsModule,
    SubscribersModule,
    ExperienceModule,
    UserModule,
    ProjectModule,
    SettingsModule,
    DashboardModule,
  ],
})
export class ApiModule {}
