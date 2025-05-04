import { Module } from '@nestjs/common';
import { configApp } from '@/config/app/config.app';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { TerminusModule } from '@nestjs/terminus';
import { StatusController } from './controllers/status.controller';
import { TerminusFileLogger } from '@/config/logger/HealthFileLog';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [StatusController],
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'json',
      logger: TerminusFileLogger,
      gracefulShutdownTimeoutMs: 1000,
    }),
    HttpModule,
    MulterModule.registerAsync({
      useFactory: async () => ({
        storage: diskStorage({
          destination: (req, file, cb) => {
            cb(null, configApp().filesDest);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + file.originalname;
            cb(null, uniqueSuffix);
          },
        }),
      }),
    }),
  ],
  exports: [MulterModule],
})
export class SharedModule {
  constructor() {
    if (!fs.existsSync(configApp().filesDest)) {
      fs.mkdirSync(configApp().filesDest, { recursive: true });
    }
  }
}
