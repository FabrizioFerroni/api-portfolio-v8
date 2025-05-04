import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PaginationService } from './services/pagination.service';
import { DecryptCredentialService } from './services/decrypt-credential.service';
import { DecriptHeaderBodyMiddleware } from './middlewares/decriptheaderbody.middleware';

@Module({
  imports: [HttpModule],
  providers: [
    PaginationService,
    DecryptCredentialService,
    DecriptHeaderBodyMiddleware,
  ],
  exports: [
    PaginationService,
    DecryptCredentialService,
    DecriptHeaderBodyMiddleware,
  ],
})
export class CoreModule {}
