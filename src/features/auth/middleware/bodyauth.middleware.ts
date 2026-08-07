import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { DecryptCredentialsService } from '../services/decryptcredentials.service';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class BodyAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly decryptCredentialService: DecryptCredentialsService,
  ) {}

  use(req: Request, res: Response, next: () => void) {
    const headersBasic = req.headers['basic'];

    if (!headersBasic) {
      return res.status(400).json({
        message: 'Header basic is required',
      });
    }

    const credentialsClean = this.decryptCredentialService.main<LoginDto>(
      headersBasic as string,
    );

    req.body = { ...req.body, ...credentialsClean };

    next();
  }
}
