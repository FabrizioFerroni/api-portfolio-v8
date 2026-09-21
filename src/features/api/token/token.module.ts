import { TransformDto } from '@/shared/utils';
import { TokenForgotService } from './service/token.service';
import { TokenRepository } from './repository/token.repository';
import { ITokenRepository } from './repository/token.interface.repository';
import { configApp } from '@/config/app/config.app';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from './schema/token.schema';
import { TokenCleanupTask } from './task/token-cleanup.task';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: configApp().secret_jwt,
          signOptions: {
            expiresIn: '10m',
          },
        };
      },
    }),
  ],
  providers: [
    TokenForgotService,
    {
      provide: ITokenRepository,
      useClass: TokenRepository,
    },
    TransformDto,
    TokenCleanupTask,
  ],
  exports: [TokenForgotService, TransformDto],
})
export class TokenModule {}
