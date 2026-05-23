import { TransformDto } from '@/shared/utils';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Setting, SettingSchema } from './schema/setting.schema';
import { SettingService } from './service/setting.service';
import { SettingRepository } from './repository/setting.repository';
import { ISettingRepository } from './repository/setting.interface.repository';
import { SettingController } from './controller/setting.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
  ],
  controllers: [SettingController],
  providers: [
    SettingService,
    SettingRepository,
    {
      provide: ISettingRepository,
      useClass: SettingRepository,
    },

    TransformDto,
  ],
  exports: [SettingService, SettingRepository, ISettingRepository],
})
export class SettingsModule {}
