import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuditsModule } from './audits/audits.module';
import { ContactsModule } from './contacts/contacts.module';

@Module({
  imports: [AuditsModule, ContactsModule, UserModule],
  exports: [AuditsModule, ContactsModule, UserModule],
})
export class ApiModule {}
