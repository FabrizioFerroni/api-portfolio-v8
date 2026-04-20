import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeleteResult,
  FilterQuery,
  Model,
  Types,
  UpdateWriteOpResult,
} from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IProjectFeatureRepository } from './project-feature.interface.repository';
import { InsertOrUpdateProjectFeatDto } from '../dto/insert-update.dto';
import { FeatureError } from '../messages/project-feature.message';
import { MapperHelper } from '@/shared/utils/functions/mapper-response';
import {
  ProjectFeature,
  ProjectFeatureDocument,
} from '../schema/project-feature.schema';

const { ToList, ToOne } = MapperHelper;

@Injectable()
export class ProjectFeatureRepository
  extends MongoDBRepository<ProjectFeatureDocument>
  implements IProjectFeatureRepository
{
  constructor(
    @InjectModel(ProjectFeature.name)
    private readonly featureModel: Model<ProjectFeatureDocument>,
  ) {
    super(featureModel);
  }
  async getAllFeatures(): Promise<ProjectFeatureDocument[] | null> {
    const allFeatures = await this.findAll();
    return ToList(allFeatures);
  }

  async getFeatureById(id: string): Promise<ProjectFeatureDocument | null> {
    const feature = await this.featureModel.findById(id);

    if (!feature) {
      return null;
    }

    return ToOne<ProjectFeatureDocument, ProjectFeatureDocument>(feature);
  }

  async getFeatureByDescription(
    description: string,
  ): Promise<ProjectFeatureDocument | null> {
    const feature = await this.model.findOne({
      description: {
        $regex: `^${description}$`,
        $options: 'i',
      },
    });

    if (!feature) {
      return null;
    }

    return ToOne<ProjectFeatureDocument, ProjectFeatureDocument>(feature);
  }

  async findByProjectIds(
    projectIds: Types.ObjectId[],
  ): Promise<ProjectFeatureDocument[]> {
    return await this.featureModel
      .find({ projectId: { $in: projectIds } })
      .exec();
  }

  async featureAlreadyExist(
    description: string,
    projectId: string,
    id?: string,
  ): Promise<boolean> {
    if (!description) return false;

    const query: FilterQuery<ProjectFeatureDocument> = { description };

    if (id) {
      query._id = {
        $ne: new Types.ObjectId(id),
        projectId: new Types.ObjectId(projectId),
      };
    }

    const feat = await this.model.findOne(query);

    return !!feat;
  }

  async insertOrUpdateFeature(
    data: InsertOrUpdateProjectFeatDto,
    id?: string,
  ): Promise<ProjectFeatureDocument | boolean> {
    if (id !== '' && id !== undefined && id !== null) {
      return this.updateFeature(id, data);
    } else {
      return this.insertFeature(data);
    }
  }

  private async insertFeature(
    data: InsertOrUpdateProjectFeatDto,
  ): Promise<ProjectFeatureDocument> {
    const feature: ProjectFeature = plainToInstance(ProjectFeature, data);
    const newFeature: ProjectFeatureDocument = await this.save(feature);

    if (!newFeature._id) {
      throw new InternalServerErrorException(
        FeatureError.INTERNAL_SERVER_ERROR,
      );
    }

    return newFeature;
  }

  private async updateFeature(
    id: string,
    data: InsertOrUpdateProjectFeatDto,
  ): Promise<boolean> {
    const feature: ProjectFeature = plainToInstance(ProjectFeature, data);

    const query = {
      $set: feature,
    };

    const featureUpdated = await this.featureModel.updateOne(
      { _id: id },
      query,
    );

    if (!featureUpdated.acknowledged) {
      return false;
    }

    if (featureUpdated.modifiedCount !== 1) {
      throw new InternalServerErrorException(
        FeatureError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }

  async deleteFeature(id: string): Promise<boolean> {
    const featureDeleted = await this.featureModel.deleteOne({ _id: id });

    if (featureDeleted.deletedCount !== 1) {
      throw new InternalServerErrorException(
        FeatureError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }
}
