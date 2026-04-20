import { TransformDto } from '@/shared/utils';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ProjectFeature,
  ProjectFeatureDocument,
} from '../schema/project-feature.schema';
import { ProjectFeatureResponseDto } from '../dto/response/project-feature.response.dto';
import { IProjectFeatureRepository } from '../repository/project-feature.interface.repository';
import { FeatureError, FeaturesOk } from '../messages/project-feature.message';
import { InsertOrUpdateProjectFeatDto } from '../dto/insert-update.dto';
import { Types } from 'mongoose';

@Injectable()
export class ProjectFeatureService {
  constructor(
    private readonly featRepository: IProjectFeatureRepository,
    @Inject(TransformDto)
    private readonly transformDto: TransformDto<
      ProjectFeatureDocument,
      ProjectFeatureResponseDto
    >,
  ) {}

  transformArray(data: ProjectFeatureDocument[]): ProjectFeatureResponseDto[] {
    return this.transformDto.transformDtoArray(data, ProjectFeatureResponseDto);
  }

  transformObject(data: ProjectFeatureDocument): ProjectFeatureResponseDto {
    return this.transformDto.transformDtoObject(
      data,
      ProjectFeatureResponseDto,
    );
  }

  async getAllFeatures(): Promise<ProjectFeatureResponseDto[] | null> {
    const features: ProjectFeatureDocument[] =
      await this.featRepository.getAllFeatures();
    return this.transformArray(features);
  }

  async getFeatureById(id: string): Promise<ProjectFeatureResponseDto | null> {
    const feature: ProjectFeatureDocument =
      await this.featRepository.getFeatureById(id);

    if (!feature) {
      throw new NotFoundException(FeatureError.FEATURE_NOT_FOUND);
    }

    return this.transformObject(feature);
  }

  async getFeatureByDescription(
    description: string,
  ): Promise<ProjectFeatureResponseDto | null> {
    const feature: ProjectFeatureDocument =
      await this.featRepository.getFeatureByDescription(description);

    if (!feature) {
      throw new NotFoundException(FeatureError.FEATURE_NOT_FOUND);
    }

    return this.transformObject(feature);
  }

  async createNewFeat(data: InsertOrUpdateProjectFeatDto): Promise<boolean> {
    const featureAlreadyExist = await this.featRepository.featureAlreadyExist(
      data.description,
      data.projectId.toHexString(),
    );

    if (featureAlreadyExist) {
      throw new BadRequestException(FeatureError.FEATURE_ALREADY_EXIST);
    }

    const newFeat = {};

    for (const feat in data) {
      if (data[feat] ?? false) newFeat[feat] = data[feat];
    }

    const result: boolean | ProjectFeatureDocument =
      await this.featRepository.insertOrUpdateFeature(
        newFeat as ProjectFeature,
      );

    if (!result || typeof result === 'boolean') {
      throw new BadRequestException(FeatureError.FEATURE_ERROR);
    }

    return true;
  }

  async createNewFeatAuto(
    data: InsertOrUpdateProjectFeatDto,
  ): Promise<Types.ObjectId> {
    const featureAlreadyExist = await this.featRepository.featureAlreadyExist(
      data.description,
      data.projectId.toHexString(),
    );

    if (featureAlreadyExist) {
      throw new BadRequestException(FeatureError.FEATURE_ALREADY_EXIST);
    }

    const newFeat = {};

    for (const feat in data) {
      if (data[feat] ?? false) newFeat[feat] = data[feat];
    }

    const result: boolean | ProjectFeatureDocument =
      await this.featRepository.insertOrUpdateFeature(
        newFeat as ProjectFeature,
      );

    if (!result || typeof result === 'boolean') {
      throw new BadRequestException(FeatureError.FEATURE_ERROR);
    }

    return result._id as Types.ObjectId;
  }

  async updateFeat(
    id: string,
    data: InsertOrUpdateProjectFeatDto,
  ): Promise<string> {
    const feature: ProjectFeatureDocument =
      await this.featRepository.getFeatureById(id);

    if (!feature) {
      throw new NotFoundException(FeatureError.FEATURE_NOT_FOUND);
    }

    const featureAlreadyExist = await this.featRepository.featureAlreadyExist(
      data.description,
      data.projectId.toHexString(),
      id,
    );

    if (featureAlreadyExist) {
      throw new BadRequestException(FeatureError.FEATURE_ALREADY_EXIST);
    }

    const featToEdit: Partial<ProjectFeature> = {};

    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        featToEdit[key] = data[key];
      }
    }

    featToEdit.updatedAt = new Date();

    const result: boolean | ProjectFeatureDocument =
      await this.featRepository.insertOrUpdateFeature(
        featToEdit as ProjectFeature,
        id,
      );

    if (!result || typeof result !== 'boolean') {
      throw new BadRequestException(FeatureError.FEATURE_ERROR);
    }

    return FeaturesOk.FEATURE_UPDATED;
  }

  async deleteFeat(id: string): Promise<string> {
    const feature: ProjectFeatureDocument =
      await this.featRepository.getFeatureById(id);

    if (!feature) {
      throw new NotFoundException(FeatureError.FEATURE_NOT_FOUND);
    }

    const featDeleted = await this.featRepository.deleteFeature(id);

    if (!featDeleted) {
      throw new BadRequestException(FeatureError.FEATURE_ERROR);
    }

    return FeaturesOk.FEATURE_REMOVED;
  }
}
