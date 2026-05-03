import { configApp } from '@/config/app/config.app';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private readonly authService: AuthService) {
    super({ header: 'x-api-key', prefix: '' }, false);
  }

  async validate(apikey: string): Promise<boolean> {
    const isValid = await this.authService.validateApiKey(apikey);
    if (!isValid) {
      throw new UnauthorizedException(
        'API Key inválida o no proporcionada. Verifica tus credenciales.',
      );
    }
    return true;
  }
}
