import { Module } from '@nestjs/common';
import { configApp } from '../app/config.app';
import BDFileLogs from '../logger/BDFileLog';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: `mongodb://${configApp().database.username}:${configApp().database.password}@${configApp().database.host}:${configApp().database.port}/${configApp().database.database}`,
        retryAttempts: 5,
        verboseRetryLog: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
