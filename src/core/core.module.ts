import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PaginationService } from './services/pagination.service';
import { DecryptCredentialService } from './services/decrypt-credential.service';
import { DecriptHeaderBodyMiddleware } from './middlewares/decriptheaderbody.middleware';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [HttpModule, MailModule],
  providers: [
    PaginationService,
    DecryptCredentialService,
    DecriptHeaderBodyMiddleware,
  ],
  exports: [
    PaginationService,
    MailModule,
    DecryptCredentialService,
    DecriptHeaderBodyMiddleware,
  ],
})
export class CoreModule {}
