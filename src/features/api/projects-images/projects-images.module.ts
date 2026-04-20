import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProjectImage,
  ProjectImageSchema,
} from './schema/project-image.schema';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { ProjectImageRepository } from './repository/project-image.repository';
import { IProjectImageRepository } from './repository/project-image.interface.repository';
import { TransformDto } from '@/shared/utils';
import { ProjectImageService } from './service/project-image.service';
import { ProjectImageController } from './controller/projects-images.controller';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectImage.name, schema: ProjectImageSchema },
    ]),
    MulterModule.register({
      dest: join(process.cwd(), 'uploads'),
    }),
  ],
  controllers: [ProjectImageController],
  providers: [
    ProjectImageService,
    ProjectImageRepository,
    {
      provide: IProjectImageRepository,
      useClass: ProjectImageRepository,
    },
    TransformDto,
  ],
  exports: [
    ProjectImageService,
    ProjectImageRepository,
    IProjectImageRepository,
  ],
})
export class ProjectImagesModule {}
