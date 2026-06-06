import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ExperienceService } from '@/features/api/experiences/service/experience.service';
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
import { OkResponseDto } from '@utils/dtos/swagger/okresponse.dto';
import { ErrorResponseDto } from '@utils/dtos/swagger/errorresponse.dto';
import { CreateResponseDto } from '@utils/dtos/swagger/createresponse.dto';
import { CreateNewExperienceDto } from '@/features/api/experiences/dtos/create.dto';
import { UpdateExperienceDto } from '@/features/api/experiences/dtos/update.dto';
import { Authorize } from '@/features/auth/decorators/authorized.decorators';
import { ApiKeyLogin } from '@/features/auth/decorators/apikey.decorator';
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';

@Controller('experiences')
@ApiTags('Experiencias laborales')
/* @ApiBearerAuth()
@Authorize() */
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get()
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all experiences',
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
  @ApiOperation({ summary: 'Get all experiences' })
  @ApiSecurity('api-key')
  @ApiBearerAuth()
  async getAllExperiencesPaginated(@Query() param: PaginationDto) {
    return await this.experienceService.getAllExperiences(param);
  }

  @Get('all')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all experiences',
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
  @ApiOperation({ summary: 'Get all experiences' })
  @ApiSecurity('api-key')
  @ApiKeyLogin()
  async getAllExperiencesWithoutPagination() {
    return await this.experienceService.getAllExperiencesWithoutPagination();
  }

  @Get('count')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get stadistic for a experiences',
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
  @ApiOperation({ summary: 'Get stadistic for a experiences' })
  async countExperiences() {
    return await this.experienceService.countAllExperiences();
  }

  @Get(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get experience by id',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Experience not found',
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
  @ApiOperation({ summary: 'Get experience by id' })
  @Authorize()
  @ApiBearerAuth()
  async getExperienceById(@Param('id') id: string) {
    return await this.experienceService.getExperienceById(id);
  }

  @Post()
  @ApiCreatedResponse({
    type: CreateResponseDto,
    isArray: false,
    description: 'Create a new experience',
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
  @ApiOperation({ summary: 'Create a new experience' })
  @Authorize()
  @ApiBearerAuth()
  createExperience(@Body() dto: CreateNewExperienceDto) {
    return this.experienceService.createNewExp(dto);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Update a experience with id',
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
    description: 'Experience not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Update an experience by id' })
  @Authorize()
  @ApiBearerAuth()
  async updateExperience(
    @Param('id') id: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.experienceService.updateExp(id, dto);
  }

  @Patch(':id/move-up')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Move up experience display order',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request / Already at top',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Experience not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Move up the display order of an experience' })
  @Authorize()
  @ApiBearerAuth()
  async moveUpDisplayOrder(@Param('id') id: string) {
    return this.experienceService.moveUpDisplayOrder(id);
  }

  @Patch(':id/move-down')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Move down experience display order',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Bad Request / Already at bottom',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Experience not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Move down the display order of an experience' })
  @Authorize()
  @ApiBearerAuth()
  async moveDownDisplayOrder(@Param('id') id: string) {
    return this.experienceService.moveDownDisplayOrder(id);
  }

  @Delete(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Delete a experience with id',
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
    description: 'Experience not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Delete an experience by id' })
  @Authorize()
  @ApiBearerAuth()
  async deleteExperience(@Param('id') id: string) {
    return await this.experienceService.deleteExperience(id);
  }
}
