import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './config/database/database.module';
import { AuthModule } from './features/auth/auth.module';
import { ApiModule } from './features/api/api.module';
import { configApp } from './config/app/config.app';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './config/interceptors/response.interceptor';
import { CustomExceptionFilter } from './core/filters/exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`${process.cwd()}/.env.${process.env.NODE_ENV}.local`],
      load: [configApp],
    }),

    EventEmitterModule.forRoot({
      verboseMemoryLeak: true,
      maxListeners: 1,
      ignoreErrors: false,
    }),

    ServeStaticModule.forRootAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => [
        {
          rootPath: join(__dirname, '..', 'swagger-static'),
          serveRoot: configApp().env === 'development' ? '/' : '/swagger',
        },
      ],
    }),

    ThrottlerModule.forRootAsync({
      useFactory: async () => [
        {
          ttl: configApp().ttl,
          limit: configApp().limit,
        },
      ],
    }),

    CoreModule,
    SharedModule,
    DatabaseModule,
    AuthModule,
    ApiModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
