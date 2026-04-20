import { Injectable } from '@nestjs/common';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { ProjectTechnologyDocument } from '../schema/project-technology.schema';
import { InsertOrUpdateProjectTecDto } from '../dto/insert-update.dto';
import { Types } from 'mongoose';

@Injectable()
export abstract class IProjectTechnologyRepository extends MongoDBRepository<ProjectTechnologyDocument> {
  abstract getAllTechnologies(): Promise<ProjectTechnologyDocument[] | null>;
  abstract getTechnologyById(
    id: string,
  ): Promise<ProjectTechnologyDocument | null>;
  abstract findByProjectIds(
    projectIds: Types.ObjectId[],
  ): Promise<ProjectTechnologyDocument[]>;
  abstract getTechnologyByName(
    name: string,
  ): Promise<ProjectTechnologyDocument | null>;
  abstract technologyAlredyExist(
    name: string,
    projectId: string,
    id?: string,
  ): Promise<boolean>;
  abstract insertOrUpdateTechnology(
    data: InsertOrUpdateProjectTecDto,
    id?: string,
  ): Promise<ProjectTechnologyDocument | boolean>;
  abstract deleteTechnology(id: string): Promise<boolean>;
}
