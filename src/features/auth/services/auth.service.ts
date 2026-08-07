import { TransformDto } from '@/shared/utils';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthResponseDto } from '../dtos/response-auth.dto';
import { User, UserDocument } from '@/features/api/user/schema/user.schema';
import { UserService } from '@/features/api/user/service/user.service';
import { UserRepository } from '@/features/api/user/repository/user.repository';
import { configApp } from '@/config/app/config.app';
import { JwtService } from '@nestjs/jwt';
import { AuthMessagesError } from '../errors/error-messages';
import { LoginDto } from '../dtos/login.dto';
import { UpdateUserDto } from '@/features/api/user/dto/update-user.dto';
import { TokenDto } from '../dtos/token.dto';
import { validatePassword } from '@/shared/utils/functions/validate-passwords';
import { RefreshtokenDto } from '../dtos/refresh-token.dto';
import { TokenService } from '@/shared/services/token.service';
import { PayloadDto } from '../dtos/payload.dto';

@Injectable()
export class AuthService {
  private failedLoginAttempts = new Map<string, number>();
  private password_failures: number = configApp().max_pass_failures;

  constructor(
    private readonly userRepository: UserRepository,
    @Inject(TransformDto)
    private readonly transform: TransformDto<UserDocument, AuthResponseDto>,
    private readonly tokenService: TokenService,
  ) {}

  transformArray(data: UserDocument[]): AuthResponseDto[] {
    return this.transform.transformDtoArray(data, AuthResponseDto);
  }

  transformObject(data: UserDocument): AuthResponseDto {
    return this.transform.transformDtoObject(data, AuthResponseDto);
  }

  validateApiKey(apiKey: string): boolean {
    const apikeyEnv: string = configApp().apiKey;
    return apikeyEnv === apiKey;
  }

  async handleFailedLogin(email: string, id: string) {
    const attempts = this.failedLoginAttempts.get(email) || 0;
    this.failedLoginAttempts.set(email, attempts + 1);

    if (attempts + 1 >= this.password_failures) {
      await this.saveUser(id, false);

      this.handleSuccessfulLogin(email);
      throw new BadRequestException(AuthMessagesError.USER_BLOCKED);
    }
  }

  async handleSuccessfulLogin(email: string) {
    this.failedLoginAttempts.delete(email);
  }

  async login(dto: LoginDto) {
    if (dto.email !== null) dto.email = dto.email.toLowerCase();
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new NotFoundException(AuthMessagesError.USER_NOT_FOUND);
    }

    if (!user.active) {
      throw new BadRequestException(AuthMessagesError.USER_IS_NOT_ACTIVE);
    }

    const passwordIsValid = await validatePassword(dto.password, user.password);

    if (!passwordIsValid) {
      await this.handleFailedLogin(dto.email, user._id.toString());
      throw new BadRequestException(
        AuthMessagesError.PASSWORD_OR_EMAIL_INVALID,
      );
    }

    await this.handleSuccessfulLogin(dto.email);

    return this.transform.transformDtoObject(user, AuthResponseDto);
  }

  /**
   * Refreshes an access token using a refresh token.
   *
   * @param token - The refresh token to be used for token refresh.
   * @throws UnauthorizedException - If the provided refresh token is invalid.
   * @returns A new access token if the refresh token is valid.
   */
  async refresh({ token }: RefreshtokenDto) {
    const tokenOld = this.tokenService.verifyTokenCatch<TokenDto>(
      token,
      configApp().secret_jwt_refresh,
    );

    if (!tokenOld)
      throw new UnauthorizedException(AuthMessagesError.TOKEN_INVALID);

    const user = await this.userRepository.findOneUserById(tokenOld.id);
    if (!user || !user.active) {
      throw new UnauthorizedException(AuthMessagesError.TOKEN_INVALID);
    }
    if (tokenOld.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException(AuthMessagesError.SESSION_REVOKED);
    }

    const payload: PayloadDto = {
      email: tokenOld.email,
      id: tokenOld.id,
      tokenVersion: user.tokenVersion,
      rememberMe: tokenOld.rememberMe,
    };

    const refreshExpiresIn = tokenOld.rememberMe ? '30d' : '1h';
    const newToken = this.tokenService.refreshJWTToken(
      payload,
      refreshExpiresIn,
    );

    return newToken;
  }

  generateJWTTokenAuth(user: UserDocument, rememberMe: boolean) {
    if (!user.active) {
      throw new BadRequestException(AuthMessagesError.USER_IS_NOT_ACTIVE);
    }
    const payload: TokenDto = {
      email: user.email,
      id: user._id.toString(),
      tokenVersion: user.tokenVersion,
      rememberMe,
    };

    const refreshExpiresIn = rememberMe ? '30d' : '1h';
    return this.tokenService.generateJWTToken(payload, refreshExpiresIn, user);
  }

  async saveUser(id: string, active: boolean) {
    const partialUpdate: Partial<UpdateUserDto> = {
      active: active,
    };

    return await this.userRepository.updateUser(id, partialUpdate as User);
  }

  async invalidateTokens(userId: string) {
    await this.userRepository.incrementTokenVersion(userId);
  }
}
