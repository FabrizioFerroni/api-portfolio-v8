import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProjectImageService } from '../service/project-image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImagesProjectsDto } from '../dto/UploadImagesProjectDto';
import { projectImageStorage } from '../storage/project-image.storage';
import { ImageUploadPipe } from '@/shared/pipes/image-upload.pipe';

@Controller('images')
@ApiTags('Tecnologias')
export class ProjectImageController {
  constructor(private readonly imagesService: ProjectImageService) {}

  @Get(':projectId')
  async getAllImagesForProject(@Param('projectId') projectId: string) {
    return await this.imagesService.getAllProjectImagesByProjectId(projectId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: projectImageStorage }))
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
  async deleteImageById(@Param('id') id: string) {
    return await this.imagesService.remove(id);
  }

  @Delete('all/:projectId')
  async deleteManyImages(@Param('projectId') projectId: string) {
    return await this.imagesService.removeAllByProject(projectId);
  }
}
