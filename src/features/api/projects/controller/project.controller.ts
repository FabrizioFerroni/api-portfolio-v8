import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProjectService } from '../service/project.service';
import { ImageUploadPipe } from '@/shared/pipes/image-upload.pipe';
import { CreateNewProjectDto } from '../dto/create-project.dto';
import { projectImageStorage } from '../../projects-images/storage/project-image.storage';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { File } from '@/shared/decorators/file.decorator';
import { Authorize } from '@/features/auth/decorators/authorized.decorators';
import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { CreateResponseDto } from '@/shared/utils/dtos/swagger/createresponse.dto';
import { ApiKeyLogin } from '@/features/auth/decorators/apikey.decorator';

@Controller('projects')
@ApiTags('Projectos Personales')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get all projects',
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
  @ApiOperation({ summary: 'Get all projects' })
  @ApiSecurity('api-key')
  @ApiKeyLogin()
  async getAllProjects() {
    return await this.projectService.getAllProyects();
  }

  @Get(':slug')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get project by id',
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
  @ApiOperation({ summary: 'Get project by slug' })
  @ApiSecurity('api-key')
  @ApiKeyLogin()
  async getProductBySlug(@Param('slug') slug: string) {
    return await this.projectService.getProjectBySlug(slug);
  }

  @Get('p/:id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Get project by id',
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
  @ApiOperation({ summary: 'Get project by id' })
  @Authorize()
  @ApiBearerAuth()
  async getProjectById(@Param('id') id: string) {
    return await this.projectService.getProjectById(id);
  }

  @Post()
  @ApiOkResponse({
    type: CreateResponseDto,
    isArray: false,
    description: 'Create a new project',
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
  @ApiOperation({ summary: 'Create a new project' })
  @Authorize()
  @ApiBearerAuth()
  @File({ storage: projectImageStorage })
  async createProyect(
    @UploadedFile(
      ImageUploadPipe({
        maxSizeMB: 5,
        fileType: ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'],
        required: true,
      }),
    )
    file: Express.Multer.File,
    @Body() body: CreateNewProjectDto,
  ) {
    return await this.projectService.createNewProject(body, file);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: OkResponseDto,
    isArray: false,
    description: 'Update a project by id',
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
  @ApiOperation({ summary: 'Update project by id' })
  @Authorize()
  @ApiBearerAuth()
  @File({ storage: projectImageStorage })
  async updateProject(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @UploadedFile(
      ImageUploadPipe({
        maxSizeMB: 5,
        fileType: ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'],
        required: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return await this.projectService.updateProject(id, dto, file);
  }

  @Delete(':id')
  @ApiOkResponse({
    type: OkResponseDto,
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
  @ApiOperation({ summary: 'Delete project by id' })
  @Authorize()
  @ApiBearerAuth()
  async deleteProject(@Param('id') id: string) {
    return await this.projectService.removeProj(id);
  }
}
