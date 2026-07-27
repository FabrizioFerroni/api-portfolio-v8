import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { TestimonialService } from '../service/testimonial.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { Authorize } from '@/features/auth/decorators/authorized.decorators';
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';
import { testimonialStorage } from '../storage/testimonial.storage';
import { File } from '@/shared/decorators/file.decorator';
import { ImageUploadPipe } from '@/shared/pipes/image-upload.pipe';
import { CreateTestimonialDto } from '../dto/create-testimonial.dto';
import { CreateResponseDto } from '@/shared/utils/dtos/swagger/createresponse.dto';
import { UpdateTestimonialDto } from '../dto/update-testimonial.dto';
import { TestimonialCount } from '../interfaces/testimonial-count.interface';
import { TestimonialResponseDto } from '../dto/response/testimonial-response.dto';
import { ApiKeyLogin } from '@/features/auth/decorators/apikey.decorator';

@Controller('testimonials')
@ApiTags('Testimonios de clientes')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @Get()
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all testimonials for home',
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
  @ApiOperation({ summary: 'Get all testimonials for home' })
  @ApiSecurity('api-key')
  @ApiKeyLogin()
  async getAllTestimonialsHome(): Promise<TestimonialResponseDto[]> {
    return await this.testimonialService.getAllTestimonialsHome();
  }

  @Get('admin')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all testimonials',
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
  @ApiOperation({ summary: 'Get all testimonials' })
  @Authorize()
  @ApiBearerAuth()
  async getAllProjectsAdmin(@Query() param: PaginationDto) {
    return await this.testimonialService.getAllTestimonialsAdmin(param);
  }

  @Get('stats')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get stats of testimonials',
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
  @ApiOperation({ summary: 'Get stats of testimonials' })
  @Authorize()
  @ApiBearerAuth()
  async getCountSubscribers(): Promise<TestimonialCount> {
    return await this.testimonialService.countAllTestimonials();
  }

  @Get(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get testimonial by id',
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
    description: 'Testimonial not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get tesmtimonial by id' })
  @Authorize()
  @ApiBearerAuth()
  async getTestimonialById(@Param('id') id: string) {
    return await this.testimonialService.getTestimonialById(id);
  }

  @Post()
  @ApiOkResponse({
    type: CreateResponseDto,
    isArray: false,
    description: 'Create a new testimonial',
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
  @ApiOperation({ summary: 'Create a new testimonial' })
  @Authorize()
  @ApiBearerAuth()
  @File({ storage: testimonialStorage })
  async createProyect(
    @UploadedFile(
      ImageUploadPipe({
        maxSizeMB: 5,
        fileType: ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'],
        required: true,
      }),
    )
    file: Express.Multer.File,
    @Body() body: CreateTestimonialDto,
  ) {
    return await this.testimonialService.createTestimonial(body, file);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Update a testimonial by id',
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
    description: 'Testimonial not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Update testimonial by id' })
  @Authorize()
  @ApiBearerAuth()
  @File({ storage: testimonialStorage })
  async updateTestimonial(
    @Param('id') id: string,
    @Body() dto: UpdateTestimonialDto,
    @UploadedFile(
      ImageUploadPipe({
        maxSizeMB: 5,
        fileType: ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'],
        required: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return await this.testimonialService.updateTestimonial(id, dto, file);
  }

  @Delete(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Delete a testimonial by id',
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
    description: 'Testimonial not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Delete testimonial by id' })
  @Authorize()
  @ApiBearerAuth()
  async deleteTestimonial(@Param('id') id: string) {
    return await this.testimonialService.deleteTestimonial(id);
  }
}
