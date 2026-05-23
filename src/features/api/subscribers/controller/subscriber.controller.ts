import { Authorize } from '@/features/auth/decorators/authorized.decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SubscriberService } from '../service/subscriber.service';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';
import { CreateResponseDto } from '@/shared/utils/dtos/swagger/createresponse.dto';
import { CreateSubcriberDto } from '../dto/create-subcriber.dto';
import { SubscriberResponseDto } from '@/features/api/subscribers/dto/response/subscriber.response.dto';
import { PaginationMeta } from '@/core/interfaces/pagination-meta.interface';
import { ApiKeyLogin } from '@/features/auth/decorators/apikey.decorator';
import { SubscriberCount } from '../interfaces/subscriber-count.interface';

@Controller('subscribers')
@ApiTags('Subscriptores')
/* @ApiBearerAuth()
@Authorize() */
export class SubscriberController {
  constructor(private readonly subscriberService: SubscriberService) {}

  @Get()
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all subscriptors',
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
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiOperation({ summary: 'Get all subscriptors' })
  @Authorize()
  @ApiBearerAuth()
  async getAllSubscribers(
    @Query() param: PaginationDto,
  ): Promise<{ subscribers: SubscriberResponseDto[]; meta: PaginationMeta }> {
    return this.subscriberService.getAllSubscribers(param);
  }

  @Get('count')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all subscriptors',
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
  @ApiOperation({ summary: 'Get count of all subscriptors' })
  @Authorize()
  @ApiBearerAuth()
  async getCountSubscribers(): Promise<SubscriberCount> {
    return await this.subscriberService.countAllSubscriber();
  }

  @Get(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get subscriptor by id',
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
    description: 'Subscriptor not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get subscriptor by id' })
  @Authorize()
  @ApiBearerAuth()
  async getSubscriberById(
    @Param('id') id: string,
  ): Promise<SubscriberResponseDto> {
    return this.subscriberService.getSubscriberById(id);
  }

  @Get('email/:email')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get subscriptor by email',
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
    description: 'Subscriptor not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get subscriptor by email' })
  @Authorize()
  @ApiBearerAuth()
  async getSubscriberByEmail(
    @Param('email') email: string,
  ): Promise<SubscriberResponseDto> {
    return this.subscriberService.getSubscriberByEmail(email);
  }

  @Get('source/:source')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get subscriptor by source',
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
    description: 'Subscriptor not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get subscriptor by source' })
  @Authorize()
  @ApiBearerAuth()
  async getSubscriberBySource(
    @Param('source') source: string,
  ): Promise<SubscriberResponseDto> {
    return this.subscriberService.getSubscriberBySource(source);
  }

  @Get('email/:email/source/:source')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get subscriptor by email and source',
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
    description: 'Subscriptor not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get subscriptor by email and source' })
  @Authorize()
  @ApiBearerAuth()
  async getSubscriberByEmailAndSource(
    @Param('email') email: string,
    @Param('source') source: string,
  ): Promise<SubscriberResponseDto> {
    return this.subscriberService.getSubscriberByEmailAndSource(email, source);
  }

  @Get('status/:status')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get subscriptors by status',
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
    description: 'Subscriptors not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiOperation({ summary: 'Get subscriptors by status' })
  @Authorize()
  @ApiBearerAuth()
  async getSubscribersByStatus(
    @Param('status') status: string,
    @Query() param: PaginationDto,
  ): Promise<{ subscribers: SubscriberResponseDto[]; meta: PaginationMeta }> {
    return this.subscriberService.getSubscribersByStatus(status, param);
  }

  @Post()
  @ApiCreatedResponse({
    type: CreateResponseDto,
    isArray: false,
    description: 'Create a new subscriptor',
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
  @ApiOperation({ summary: 'Create a new subscriptor' })
  @ApiSecurity('api-key')
  @ApiKeyLogin()
  async createSubscriber(@Body() data: CreateSubcriberDto): Promise<string> {
    return await this.subscriberService.createSubscriber(data);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Update a subscriptor by id',
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
    description: 'Subscriptor not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Update a subscriptor by id' })
  @Authorize()
  @ApiBearerAuth()
  async updateSubscriber(
    @Param('id') id: string,
    @Body() data: CreateSubcriberDto,
  ): Promise<string> {
    return await this.subscriberService.updateSubscriber(id, data);
  }

  @Get('unsubscribe/:email')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Unsubscribe a subscriptor by email',
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
    description: 'Subscriptor not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Unsubscribe a subscriptor by email' })
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('api-key')
  @ApiKeyLogin()
  async unsubscribe(@Param('email') email: string): Promise<string> {
    return this.subscriberService.unsubscribeSubscriber(email);
  }

  @Delete(':email')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Delete a subscriptor by email',
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
    description: 'Subscriptor not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Delete a subscriptor by email' })
  @Authorize()
  @ApiBearerAuth()
  async deleteSubscriber(@Param('email') email: string): Promise<string> {
    return this.subscriberService.deleteSubscriber(email);
  }
}
