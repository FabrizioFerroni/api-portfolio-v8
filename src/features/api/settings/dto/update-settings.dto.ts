import { configApp } from '@/config/app/config.app';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({
    protocols: configApp().env === 'prod' ? ['https'] : ['http', 'https'],
    require_tld: configApp().env === 'prod' ? true : false,
  })
  @ApiProperty({ example: 'https://google.com' })
  frontUrl: string;

  @IsNotEmpty()
  @IsBoolean()
  @IsDefined()
  @ApiProperty({ example: false })
  maintenanceMode: boolean;
}
