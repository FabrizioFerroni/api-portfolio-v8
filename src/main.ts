import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { configApp } from './config/app/config.app';
import { setupSwagger } from './config/swagger/config.swagger.app';
import { configStrings } from './config/app/config.string';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const hostCors = configApp().frontHost;
  const hostMethods = configApp().hostMethod;
  const hostallowedHeaders = configApp().hostAllowedHeader;
  const hostCredentials = configApp().hostCredentials;
  const entorno = configApp().env;
  const apiPort = configApp().apiPort;
  const apiHost = configApp().apiHost;
  const tz = configApp().tz;
  app.use(cookieParser());

  app.enableCors({
    origin: hostCors,
    credentials: hostCredentials,
    methods: hostMethods,
    allowedHeaders: hostallowedHeaders,
  });

  /* const trustProxyByEnv: Record<string, number | boolean> = {
    development: 1,
    staging: 4,
    production: 3,
  }; */

  app.use((req, res, next) => {
    console.log('XFF:', req.headers['x-forwarded-for']);
    next();
  });

  const trustProxyByEnv: Record<string, string[] | boolean> = {
    development: false,
    staging: ['192.168.0.26', '10.0.1.0/24', 'loopback'],
    production: ['192.168.0.26', '10.0.1.0/24', 'loopback'],
  };
  app.set('trust proxy', trustProxyByEnv[process.env.NODE_ENV] ?? false);

  // app.set('trust proxy', trustProxyByEnv[process.env.NODE_ENV] ?? false);

  app.use((req, res, next) => {
    req.timezone = tz;
    res.removeHeader('X-Powered-By');
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
      },
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/file',
  });

  app.setGlobalPrefix(configStrings().apiVersion, {
    exclude: [
      { path: 'estado', method: RequestMethod.ALL },
      { path: 'estado/*path', method: RequestMethod.ALL },
      { path: 'auth', method: RequestMethod.ALL },
      { path: 'auth/*path', method: RequestMethod.ALL },
      { path: 'file', method: RequestMethod.ALL },
      { path: 'file/*path', method: RequestMethod.ALL },
    ],
  });

  setupSwagger(app, entorno);

  app.enableShutdownHooks();

  await app.listen(apiPort, () => {
    if (entorno === 'development' || entorno === 'staging') {
      console.log(
        `🚀 Application is running in ${entorno} environment on: ${apiHost}:${apiPort}`,
      );
    } else {
      console.log(
        `🚀 Application is running in ${entorno} environment on: ${apiHost}`,
      );
    }
  });
}
bootstrap();
