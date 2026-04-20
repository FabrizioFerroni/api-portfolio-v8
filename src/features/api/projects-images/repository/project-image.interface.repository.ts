import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import {
  ProjectImage,
  ProjectImageDocument,
} from '../schema/project-image.schema';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export abstract class IProjectImageRepository extends MongoDBRepository<ProjectImageDocument> {
  abstract getAllProjectsImages(): Promise<ProjectImageDocument[] | null>;
  abstract getProjectImgById(id: string): Promise<ProjectImageDocument | null>;
  abstract findByProjectIds(
    projectIds: Types.ObjectId[],
  ): Promise<ProjectImageDocument[]>;
  abstract getProjectImgsByProjectId(
    idProyect: string,
  ): Promise<ProjectImageDocument[] | null>;
  abstract uploadImageToProject(
    data: ProjectImage,
  ): Promise<ProjectImageDocument>;
  abstract insertMany(records: ProjectImage[]): Promise<ProjectImageDocument[]>;
  abstract deleteImageProject(id: string): Promise<boolean>;
  abstract deleteImageProjectMany(projectId: string): Promise<boolean>;
}
