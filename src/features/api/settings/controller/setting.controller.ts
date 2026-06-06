import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SettingService } from '../service/setting.service';
import { Authorize } from '@/features/auth/decorators/authorized.decorators';
import { Body, Controller, Get, Patch } from '@nestjs/common';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { ApiKeyLogin } from '@/features/auth/decorators/apikey.decorator';
import { UpdateSettingDto } from '../dto/update-settings.dto';

@Controller('setting')
@ApiTags('Configuracion del portfolio')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get setting front',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get setting front' })
  @ApiSecurity('api-key')
  @ApiKeyLogin()
  async getSettingFront() {
    return await this.settingService.getCache();
  }

  @Get('admin')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get setting admin',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get setting admin' })
  @Authorize()
  @ApiBearerAuth()
  async getSettingAdmin() {
    return await this.settingService.getCache();
  }

  @Patch('')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Update a setting',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Setting not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Update setting data' })
  @Authorize()
  @ApiBearerAuth()
  async updateSetting(@Body() dto: UpdateSettingDto) {
    return await this.settingService.update(dto);
  }
}
