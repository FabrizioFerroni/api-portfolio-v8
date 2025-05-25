import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { configApp } from './config/app/config.app';
import { setupSwagger } from './config/swagger/config.swagger.app';
import { configStrings } from './config/app/config.string';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  /* const app = await NestFactory.create(AppModule); */
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const hostCors = configApp().frontHost;
  const hostMethods = configApp().hostMethod;
  const hostallowedHeaders = configApp().hostAllowedHeader;
  const hostCredentials = configApp().hostCredentials;
  const entorno = configApp().env;
  const apiPort = configApp().apiPort;
  const apiHost = configApp().apiHost;
  const tz = configApp().tz;

  app.enableCors({
    origin: hostCors,
    credentials: hostCredentials,
    methods: hostMethods,
    allowedHeaders: hostallowedHeaders,
  });

  app.set('trust proxy', true);

  /* app.useGlobalFilters(new CustomExceptionFilter()); */

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

  await app.listen(apiPort, () => {
    if (entorno === 'development') {
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
