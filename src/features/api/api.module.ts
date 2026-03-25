import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuditsModule } from './audits/audits.module';
import { ContactsModule } from './contacts/contacts.module';
import { SubscribersModule } from './subscribers/subscribers.module';

@Module({
  imports: [AuditsModule, ContactsModule, SubscribersModule, UserModule],
  exports: [AuditsModule, ContactsModule, SubscribersModule, UserModule],
})
export class ApiModule {}
