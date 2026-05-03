import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { join } from 'path';
import { Request, Response } from 'express';
import * as express from 'express';

export const setupSwagger = (app: INestApplication, entorno: string) => {
  if (entorno === 'production') {
    const swaggerPath = join(__dirname, '..', 'node_modules/swagger-ui-dist');
    app.use('/swagger-ui', express.static(swaggerPath));
  } else {
    app.use('/swagger-ui', express.static('node_modules/swagger-ui-dist'));
  }

  const configSwagger = new DocumentBuilder()
    .setTitle('Portfolio v8 - Backend')
    .setDescription(
      'Backend hecho con NestJS para guardar los proyectos y demas de mi portfolio',
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      description:
        'Ingresar token Bearer para el inicio de sesión del proyecto',
      name: 'Portfolio v8',
    })
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key', // el nombre real del header
      },
      'api-key', // nombre del esquema (referencia interna)
    )
    .build();

  if (entorno !== 'production') {
    const options: SwaggerCustomOptions = {
      customSiteTitle: 'Portfolio v8 - Backend',
    };

    const document = SwaggerModule.createDocument(app, configSwagger, {
      deepScanRoutes: true,
    });
    SwaggerModule.setup('/', app, document, options);
  } else {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get('/', (req: Request, res: Response) => {
      res.status(200).json({ mensaje: 'Bienvenido a la api de Portfolio v8' });
    });
  }
};
