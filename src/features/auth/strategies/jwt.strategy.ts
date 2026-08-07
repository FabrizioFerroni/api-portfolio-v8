import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenDto } from '../dtos/token.dto';
import { configApp } from '@/config/app/config.app';
import { UserRepository } from '@/features/api/user/repository/user.repository';
import { AuthMessagesError } from '../errors/error-messages';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configApp().secret_jwt,
      ignoreExpiration: false,
    });
  }

  async validate(payload: TokenDto) {
    const user = await this.userRepository.findOneUserById(payload.id);
    if (!user || !user.active) {
      throw new UnauthorizedException(AuthMessagesError.TOKEN_INVALID);
    }

    if (payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException(AuthMessagesError.SESSION_REVOKED);
    }
    return payload;
  }
}
