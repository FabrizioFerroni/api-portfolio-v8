import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PaginationService } from './services/pagination.service';
import { MailModule } from './mail/mail.module';
import { GeoLookupService } from './mail/service/geo-lookup.service';

@Module({
  imports: [HttpModule, MailModule],
  providers: [PaginationService, GeoLookupService],
  exports: [PaginationService, GeoLookupService, MailModule],
})
export class CoreModule {}
