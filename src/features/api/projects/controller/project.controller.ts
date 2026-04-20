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
import { ApiTags } from '@nestjs/swagger';
import { ProjectService } from '../service/project.service';
import { ImageUploadPipe } from '@/shared/pipes/image-upload.pipe';
import { CreateNewProjectDto } from '../dto/create-project.dto';
import { projectImageStorage } from '../../projects-images/storage/project-image.storage';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { File } from '@/shared/decorators/file.decorator';

@Controller('projects')
@ApiTags('Projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getAllProjects() {
    return await this.projectService.getAllProyects();
  }

  @Get(':slug')
  async getProductBySlug(@Param('slug') slug: string) {
    return await this.projectService.getProjectBySlug(slug);
  }

  @Get('p/:id')
  async getProjectById(@Param('id') id: string) {
    return await this.projectService.getProjectById(id);
  }

  @Post()
  // @UseInterceptors(FileInterceptor('file', { storage: projectImageStorage }))
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
  // @UseInterceptors(FileInterceptor('file', { storage: projectImageStorage }))
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
  async deleteProject(@Param('id') id: string) {
    return await this.projectService.removeProj(id);
  }
}
