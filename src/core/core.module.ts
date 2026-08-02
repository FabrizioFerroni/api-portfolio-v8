import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PaginationService } from './services/pagination.service';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [HttpModule, MailModule],
  providers: [PaginationService],
  exports: [PaginationService, MailModule],
})
export class CoreModule {}
