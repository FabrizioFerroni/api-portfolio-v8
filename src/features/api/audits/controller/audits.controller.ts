import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuditService } from '../service/audit.service';
import { Authorize } from '@/features/auth/decorators/authorized.decorators';

@Controller('audits')
@ApiTags('Auditorias')
@Authorize()
@ApiBearerAuth()
export class AuditsController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all audits',
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
  @ApiOperation({ summary: 'Get all audits' })
  async getAllAudits() {
    return await this.auditService.getAllAudits();
  }

  @Get(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get audit by id',
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
    description: 'Audit not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get audit by id' })
  async findOne(@Param('id') id: string) {
    return await this.auditService.findOne(id);
  }
}
