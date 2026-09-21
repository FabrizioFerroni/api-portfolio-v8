import { TransformDto } from '@/shared/utils';
import { TokenResponseDto } from '../dto/response/response.tokens.dto';
import { TokenDocument } from '../schema/token.schema';
import { UserDocument } from '../../user/schema/user.schema';
import { AuthResponseDto } from '@/features/auth/dtos/response-auth.dto';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ITokenRepository } from '../repository/token.interface.repository';
import {
  JsonWebTokenError,
  JwtService,
  NotBeforeError,
  TokenExpiredError,
} from '@nestjs/jwt';
import { CreateTokenDto } from '../dto/create-token.dto';
import { TokenMessagesError } from '../error/error-messages';
import { UpdateTokenDto } from '../dto/update-token.dto';
import { configApp } from '@/config/app/config.app';
import { PayloadDto } from '@/features/auth/dtos/payload.dto';

@Injectable()
export class TokenForgotService {
  private readonly logger = new Logger(TokenForgotService.name, {
    timestamp: true,
  });

  constructor(
    @Inject(TransformDto)
    private readonly transform: TransformDto<UserDocument, AuthResponseDto>,
    private readonly transformToken: TransformDto<
      TokenDocument,
      TokenResponseDto
    >,
    private jwtService: JwtService,
    private readonly tokenRepository: ITokenRepository,
  ) {}

  async saveToken(data: CreateTokenDto) {
    const { token, email, token_id, isUsed } = data;
    const newToken: Partial<TokenDocument> = {
      token: token,
      email: email,
      tokenId: token_id,
      isUsed: isUsed,
    };

    return this.tokenRepository.saveToken(newToken as TokenDocument);
  }

  async findByTokenId(tokenId: string) {
    const token = await this.tokenRepository.findByTokenId(tokenId);

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    return this.transformToken.transformDtoObject(token, TokenResponseDto);
  }

  async findByTokenIdRaw(tokenId: string) {
    const token = await this.tokenRepository.findByTokenId(tokenId);

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    return token;
  }

  async updateToken(id: string, data: UpdateTokenDto) {
    const token = await this.tokenRepository.findById(id);

    if (!token) {
      throw new NotFoundException(TokenMessagesError.TOKEN_NOT_FOUND);
    }

    const tokenToUpdate: Partial<TokenDocument> = {};

    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        tokenToUpdate[key] = data[key];
      }
    }

    const userUpdated = await this.tokenRepository.updateToken(
      id,
      tokenToUpdate as TokenDocument,
    );

    if (!userUpdated) {
      return TokenMessagesError.TOKEN_ERROR;
    }

    return TokenMessagesError.TOKEN_UPDATED;
  }

  generateJWTToken(payload: PayloadDto, expireIn?: string) {
    if (!configApp().secret_jwt_register) {
      this.logger.error('Secret JWT not set');
      throw new InternalServerErrorException(
        TokenMessagesError.INTERNAL_SERVER_ERROR,
      );
    }

    return this.jwtService.sign(payload, {
      expiresIn: expireIn,
      secret: configApp().secret_jwt_register,
    });
  }

  verifyJWTToken(token: string, secret?: string) {
    return this.jwtService.verify(token, {
      secret: secret,
    });
  }

  verifyTokenCatch(token: string, secret?: string): Record<string, string> {
    try {
      return this.verifyJWTToken(token, secret);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new BadRequestException('El token ha expirado.');
      } else if (error instanceof JsonWebTokenError) {
        throw new BadRequestException('Token inválido.');
      } else if (error instanceof NotBeforeError) {
        throw new BadRequestException('El token aún no es válido.');
      } else {
        throw new BadRequestException('Error al verificar el token.');
      }
    }
  }

  TOKEN_TTL_MS = 60 * 60 * 1000;

  async deleteExpiredOrUsed(): Promise<number> {
    const expirationLimit = new Date(Date.now() - this.TOKEN_TTL_MS);

    return this.tokenRepository.deleteExpiredOrUsed(expirationLimit);
  }
}
