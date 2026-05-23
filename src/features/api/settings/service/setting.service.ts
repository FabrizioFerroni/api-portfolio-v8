import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ISettingRepository } from '../repository/setting.interface.repository';
import { TransformDto } from '@/shared/utils';
import { Setting, SettingDocument } from '../schema/setting.schema';
import { SettingResponseDto } from '../dto/response/setting-response.dto';
import { UpdateSettingDto } from '../dto/update-settings.dto';

@Injectable()
export class SettingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SettingService.name);
  private cache: SettingDocument | null = null;

  constructor(
    private readonly settingRepository: ISettingRepository,
    @Inject(TransformDto)
    private readonly transform: TransformDto<
      SettingDocument,
      SettingResponseDto
    >,
  ) {}

  transformObject(data: SettingDocument) {
    return this.transform.transformDtoObject(data, SettingResponseDto);
  }

  async onApplicationBootstrap(): Promise<void> {
    let settings = await this.settingRepository.get();

    if (!settings) {
      this.logger.warn('No settings found. Creating default configuration...');
      settings = await this.settingRepository.upsert({
        frontUrl: 'http://localhost:4200',
        maintenanceMode: false,
        createdAt: new Date(),
      });

      this.logger.log('Default settings created.');
    }

    this.cache = settings;
    this.logger.log('Settings loaded into memory.');
  }

  getCache(): SettingResponseDto {
    return this.transformObject(this.cache);
  }

  async update(data: UpdateSettingDto): Promise<SettingResponseDto> {
    const settingToEdit: Partial<Setting> = {
      frontUrl: data.frontUrl,
      maintenanceMode: data.maintenanceMode,
      updatedAt: new Date(),
    };

    const updated = await this.settingRepository.upsert(settingToEdit);
    this.cache = updated;
    return this.transformObject(updated);
  }
}
