import { Module } from '@nestjs/common';
import {
  ProjectTechnology,
  ProjectTechnologySchema,
} from './schema/project-technology.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectTechnologyService } from './service/project-technology.service';
import { ProjectTechnologyRepository } from './repository/project-technology.repository';
import { IProjectTechnologyRepository } from './repository/project-technology.interface.repository';
import { TransformDto } from '@/shared/utils';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectTechnology.name, schema: ProjectTechnologySchema },
    ]),
  ],
  providers: [
    ProjectTechnologyService,
    ProjectTechnologyRepository,
    {
      provide: IProjectTechnologyRepository,
      useClass: ProjectTechnologyRepository,
    },
    TransformDto,
  ],
  exports: [
    ProjectTechnologyService,
    ProjectTechnologyRepository,
    IProjectTechnologyRepository,
  ],
})
export class ProjectTechnologiesModule {}
