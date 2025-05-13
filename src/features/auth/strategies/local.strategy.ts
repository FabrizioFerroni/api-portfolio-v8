import { AuthResponseDto } from './../dtos/response-auth.dto';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string) {
    const dto: LoginDto = {
      email,
      password,
    };

    const user: AuthResponseDto = await this.authService.login(dto);

    if (!user) {
      throw new UnauthorizedException('Not Allowed');
    }

    return user;
  }
}
