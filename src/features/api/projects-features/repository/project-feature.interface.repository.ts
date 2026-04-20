import { Injectable } from '@nestjs/common';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { ProjectFeatureDocument } from '../schema/project-feature.schema';
import { InsertOrUpdateProjectFeatDto } from '../dto/insert-update.dto';
import { Types } from 'mongoose';
@Injectable()
export abstract class IProjectFeatureRepository extends MongoDBRepository<ProjectFeatureDocument> {
  abstract getAllFeatures(): Promise<ProjectFeatureDocument[] | null>;
  abstract getFeatureById(id: string): Promise<ProjectFeatureDocument | null>;
  abstract getFeatureByDescription(
    description: string,
  ): Promise<ProjectFeatureDocument | null>;
  abstract findByProjectIds(
    projectIds: Types.ObjectId[],
  ): Promise<ProjectFeatureDocument[]>;
  abstract featureAlreadyExist(
    description: string,
    projectId: string,
    id?: string,
  ): Promise<boolean>;
  abstract insertOrUpdateFeature(
    data: InsertOrUpdateProjectFeatDto,
    id?: string,
  ): Promise<ProjectFeatureDocument | boolean>;
  abstract deleteFeature(id: string): Promise<boolean>;
}
