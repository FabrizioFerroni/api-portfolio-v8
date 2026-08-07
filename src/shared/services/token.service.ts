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
import { TokenDto } from '@/features/auth/dtos/token.dto';
import { AuthMessagesError } from '@/features/auth/errors/error-messages';

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
    refreshExpiresIn: string,
    user?: UserDocument,
  ): LoginResponseAuth {
    const userRes = this.transform.transformDtoObject(user, AuthResponseDto);

    return {
      user: userRes,
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: configApp().secret_jwt_refresh,
        expiresIn: refreshExpiresIn,
      }),
    };
  }

  verifyJWTToken<T extends object = TokenDto>(
    token: string,
    secret?: string,
  ): T {
    return this.jwtService.verify<T>(token, {
      secret,
    });
  }

  verifyTokenCatch<T extends object = TokenDto>(
    token: string,
    secret?: string,
  ): T {
    try {
      return this.verifyJWTToken<T>(token, secret);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        // Manejo del error TokenExpiredError
        throw new BadRequestException(AuthMessagesError.TOKEN_EXPIRED);
      } else if (error instanceof NotBeforeError) {
        // Manejo del error NotBeforeError
        throw new BadRequestException(AuthMessagesError.TOKEN_INVALID);
      } else if (error instanceof JsonWebTokenError) {
        // Manejo de otros errores relacionados con JWT
        throw new BadRequestException(AuthMessagesError.TOKEN_INVALID);
      } else {
        // Manejo de otros posibles errores
        throw new BadRequestException(AuthMessagesError.TOKEN_INVALID);
      }
    }
  }

  refreshJWTToken(payload: PayloadDto, refreshExpiresIn: string) {
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: configApp().secret_jwt_refresh,
        expiresIn: refreshExpiresIn,
      }),
    };
  }
}
