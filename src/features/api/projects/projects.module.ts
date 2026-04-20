import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schema/project.schema';
import { ProjectTechnologiesModule } from '../projects-technologies/projects-technologies.module';
import { ProjectImagesModule } from '../projects-images/projects-images.module';
import { ProjectFeaturesModule } from '../projects-features/projects-features.module';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { ProjectRepository } from './repository/project.repository';
import { IProjectRepository } from './repository/project.interface.repository';
import { TransformDto } from '@/shared/utils';
import { ProjectService } from './service/project.service';
import { ProjectController } from './controller/project.controller';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    ProjectTechnologiesModule,
    ProjectImagesModule,
    ProjectFeaturesModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [ProjectController],
  providers: [
    ProjectService,
    ProjectRepository,
    {
      provide: IProjectRepository,
      useClass: ProjectRepository,
    },
    TransformDto,
  ],
  exports: [ProjectService, IProjectRepository, ProjectRepository],
})
export class ProjectModule {}
