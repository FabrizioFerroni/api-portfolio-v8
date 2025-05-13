import { configApp } from '@/config/app/config.app';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../api/user/user.module';
import { UserRepository } from '../api/user/repository/user.repository';
import { IUserRepository } from '../api/user/repository/user.interface.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../api/user/schema/user.schema';
import { AuthService } from './services/auth.service';
import { TransformDto } from '@/shared/utils';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './controller/auth.controller';
import { BodyloginMiddleware } from './middleware/bodylogin.middleware';
import { DecryptCredentialService } from '@/core/services/decrypt-credential.service';
import { DecryptCredentialsService } from './services/decryptcredentials.service';
import { SharedModule } from '@/shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule,
    PassportModule,
    SharedModule,
  ],
  controllers: [AuthController],
  providers: [
    DecryptCredentialsService,
    AuthService,
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    TransformDto,
    JwtStrategy,
    LocalStrategy,
    ApiKeyStrategy,
  ],
  exports: [],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BodyloginMiddleware)
      .forRoutes({ path: 'auth/login', method: RequestMethod.POST });
  }
}
