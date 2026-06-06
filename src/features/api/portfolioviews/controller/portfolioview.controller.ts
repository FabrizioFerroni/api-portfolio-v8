import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PortfolioViewService } from '../service/portfolioview.service';
import { ApiKeyLogin } from '@/features/auth/decorators/apikey.decorator';
import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { AnalyticsRange } from '../enum/analitycrange.enum';
import { Authorize } from '@/features/auth/decorators/authorized.decorators';

@Controller('analytics')
@ApiTags('Analiticas del portfolio')
export class PortfolioViewController {
  constructor(private readonly portfolioViewService: PortfolioViewService) {}

  @Get(':range')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get analitycs by filter',
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
  @ApiOperation({ summary: 'Get analitycs by filter' })
  @ApiParam({
    name: 'range',
    enum: AnalyticsRange,
    required: true,
  })
  @Authorize()
  @ApiBearerAuth()
  async getAllPortfolioViews(
    @Param('range', new ParseEnumPipe(AnalyticsRange)) range: AnalyticsRange,
  ) {
    return await this.portfolioViewService.getAnalytics(range);
  }

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Registra una visita al portfolio' })
  @ApiNoContentResponse({ description: 'Visita registrada correctamente' })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  /*@ApiSecurity('api-key')
  @ApiKeyLogin()*/
  async trackView(): Promise<void> {
    await this.portfolioViewService.trackView();
  }
}
