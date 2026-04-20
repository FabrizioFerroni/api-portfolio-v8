import { Module } from '@nestjs/common';
import {
  ProjectFeature,
  ProjectFeatureSchema,
} from './schema/project-feature.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectFeatureRepository } from './repository/project-feature.repository';
import { IProjectFeatureRepository } from './repository/project-feature.interface.repository';
import { TransformDto } from '@/shared/utils';
import { ProjectFeatureService } from './service/project-feature.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectFeature.name, schema: ProjectFeatureSchema },
    ]),
  ],
  providers: [
    ProjectFeatureService,
    ProjectFeatureRepository,
    {
      provide: IProjectFeatureRepository,
      useClass: ProjectFeatureRepository,
    },
    TransformDto,
  ],
  exports: [
    ProjectFeatureService,
    IProjectFeatureRepository,
    ProjectFeatureRepository,
  ],
})
export class ProjectFeaturesModule {}
