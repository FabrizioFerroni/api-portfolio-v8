import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuditsModule } from './audits/audits.module';

@Module({
  imports: [AuditsModule, UserModule],
  exports: [AuditsModule, UserModule],
})
export class ApiModule {}
