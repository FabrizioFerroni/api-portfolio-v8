import { configApp } from '@/config/app/config.app';

import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  JsonWebTokenError,
  JwtService,
  NotBeforeError,
  TokenExpiredError,
} from '@nestjs/jwt';
import { TransformDto } from '../utils';
import { UserDocument } from '@/features/api/user/schema/user.schema';
import { AuthResponseDto } from '@/features/auth/dtos/response-auth.dto';
import { LoginResponseAuth } from '@/features/auth/interface/login-response.interface';
import { PayloadDto } from '@/features/auth/dtos/payload.dto';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name, { timestamp: true });

  constructor(
    @Inject(TransformDto)
    private readonly transform: TransformDto<UserDocument, AuthResponseDto>,
    private jwtService: JwtService,
  ) {}

  generateJWTToken(
    payload: PayloadDto,
    user?: UserDocument,
  ): LoginResponseAuth | string {
    const userRes = this.transform.transformDtoObject(user, AuthResponseDto);

    return {
      user: userRes,
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: configApp().secret_jwt_refresh,
        expiresIn: '1h',
      }),
    };
  }

  verifyJWTToken(token: string, secret?: string) {
    return this.jwtService.verify(token, {
      secret,
    });
  }

  verifyTokenCatch(token: string, secret?: string): Record<string, string> {
    try {
      return this.verifyJWTToken(token, secret);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        // Manejo del error TokenExpiredError
        throw new BadRequestException('El token ha expirado.');
      } else if (error instanceof NotBeforeError) {
        // Manejo del error NotBeforeError
        throw new BadRequestException('El token aún no es válido.');
      } else if (error instanceof JsonWebTokenError) {
        // Manejo de otros errores relacionados con JWT
        throw new BadRequestException('Token inválido.');
      } else {
        // Manejo de otros posibles errores
        throw new BadRequestException('Error al verificar el token.');
      }
    }
  }

  refreshJWTToken(payload: PayloadDto) {
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: configApp().secret_jwt_refresh,
        expiresIn: '1h',
      }),
    };
  }
}
