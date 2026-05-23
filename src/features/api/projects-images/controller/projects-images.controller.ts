import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
} from '@nestjs/common';
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
import { ProjectImageService } from '../service/project-image.service';
import { UploadImagesProjectsDto } from '../dto/UploadImagesProjectDto';
import { projectImageStorage } from '../storage/project-image.storage';
import { ImageUploadPipe } from '@/shared/pipes/image-upload.pipe';
import { Authorize } from '@/features/auth/decorators/authorized.decorators';
import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { File } from '@/shared/decorators/file.decorator';
import { CreateResponseDto } from '@/shared/utils/dtos/swagger/createresponse.dto';
import { ApiKeyLogin } from '@/features/auth/decorators/apikey.decorator';

@Controller('images')
@ApiTags('Imagenes de los proyectos')
export class ProjectImageController {
  constructor(private readonly imagesService: ProjectImageService) {}

  @Get(':projectId')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all project image by projectid',
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
    description: 'Project not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get all project images by projectid' })
  @ApiSecurity('api-key')
  @ApiKeyLogin()
  async getAllImagesForProject(@Param('projectId') projectId: string) {
    return await this.imagesService.getAllProjectImagesByProjectId(projectId);
  }

  @Get('admin/:projectId')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all project image by projectid',
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
    description: 'Project not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Get all project images by projectid' })
  @Authorize()
  @ApiBearerAuth()
  async getAllImagesForProjectAdmin(@Param('projectId') projectId: string) {
    return await this.imagesService.getAllProjectImagesByProjectId(projectId);
  }

  @Post()
  @ApiOkResponse({
    type: CreateResponseDto,
    isArray: false,
    description: 'Delete a project by id',
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
    description: 'Project not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Upload image a project' })
  @File({ storage: projectImageStorage })
  @Authorize()
  @ApiBearerAuth()
  async postImages(
    @UploadedFile(
      ImageUploadPipe({
        maxSizeMB: 5,
        fileType: ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'],
      }),
    )
    file: Express.Multer.File,
    @Body() body: UploadImagesProjectsDto,
  ) {
    return this.imagesService.uploadProjectImage(body, file);
  }

  @Delete(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Delete a project image by projectid',
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
    description: 'Project image not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Delete project image by projectid' })
  @Authorize()
  @ApiBearerAuth()
  async deleteImageById(@Param('id') id: string) {
    return await this.imagesService.remove(id);
  }

  @Delete('all/:projectId')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Delete all project images by projectid',
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
    description: 'Project not found',
  })
  @ApiInternalServerErrorResponse({
    type: ErrorResponseDto,
    isArray: false,
    description: 'Internal Server Error',
  })
  @ApiOperation({ summary: 'Delete all project images by projectid' })
  @Authorize()
  @ApiBearerAuth()
  async deleteManyImages(@Param('projectId') projectId: string) {
    return await this.imagesService.removeAllByProject(projectId);
  }
}
