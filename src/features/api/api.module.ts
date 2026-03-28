import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuditsModule } from './audits/audits.module';
import { ContactsModule } from './contacts/contacts.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { ExperienceModule } from '@/features/api/experiences/experience.module';

@Module({
  imports: [
    AuditsModule,
    ContactsModule,
    SubscribersModule,
    ExperienceModule,
    UserModule,
  ],
  exports: [
    AuditsModule,
    ContactsModule,
    SubscribersModule,
    ExperienceModule,
    UserModule,
  ],
})
export class ApiModule {}
