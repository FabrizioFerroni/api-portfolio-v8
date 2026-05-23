import { Controller, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DashboardService } from '../service/dashboard.service';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { Authorize } from '@/features/auth/decorators/authorized.decorators';

@Controller('dashboard')
@ApiTags('Tablero')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all dashboard stats',
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
  @ApiOperation({ summary: 'Get all dashboard stats' })
  /*@Authorize()
    @ApiBearerAuth()*/
  async getAllDashboardStats() {
    return await this.dashboardService.getStats();
  }
}
