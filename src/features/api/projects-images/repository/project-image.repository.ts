import { MapperHelper } from '@/shared/utils/functions/mapper-response';
import {
  ProjectImage,
  ProjectImageDocument,
} from '../schema/project-image.schema';
import { DeleteResult, FilterQuery, Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IProjectImageRepository } from './project-image.interface.repository';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ImagesError } from '../messages/project-images.messages';

const { ToList, ToOne } = MapperHelper;

@Injectable()
export class ProjectImageRepository
  extends MongoDBRepository<ProjectImageDocument>
  implements IProjectImageRepository
{
  constructor(
    @InjectModel(ProjectImage.name)
    private readonly imageModel: Model<ProjectImageDocument>,
  ) {
    super(imageModel);
  }

  async getAllProjectsImages(): Promise<ProjectImageDocument[] | null> {
    const allImages = await this.findAll();
    return ToList(allImages);
  }

  async getProjectImgById(id: string): Promise<ProjectImageDocument | null> {
    const image = await this.imageModel.findById(id);
    return image
      ? ToOne<ProjectImageDocument, ProjectImageDocument>(image)
      : null;
  }

  async countAll(): Promise<number> {
    return this.imageModel.countDocuments().exec();
  }

  async getProjectImgsByProjectId(
    idProyect: string,
  ): Promise<ProjectImageDocument[] | null> {
    const query: FilterQuery<ProjectImageDocument> = {
      projectId: new Types.ObjectId(idProyect),
    };

    const allImages = await this.findAll(query);
    return ToList(allImages);
  }

  async findByProjectIds(
    projectIds: Types.ObjectId[],
  ): Promise<ProjectImageDocument[]> {
    return this.imageModel.find({ projectId: { $in: projectIds } }).exec();
  }

  async uploadImageToProject(
    data: ProjectImage,
  ): Promise<ProjectImageDocument> {
    const newImage: ProjectImageDocument = await this.save(data);

    if (!newImage._id) {
      throw new InternalServerErrorException(ImagesError.INTERNAL_SERVER_ERROR);
    }

    return newImage;
  }

  async insertMany(records: ProjectImage[]): Promise<ProjectImageDocument[]> {
    const newImage: ProjectImageDocument[] = await this.saveMany(records);

    const hasInvalidDocument: boolean = newImage.some((img) => !img._id);

    if (hasInvalidDocument) {
      throw new InternalServerErrorException(ImagesError.INTERNAL_SERVER_ERROR);
    }

    return newImage;
  }

  async deleteImageProject(id: string): Promise<boolean> {
    const imageDeleted: DeleteResult = await this.imageModel.deleteOne({
      _id: id,
    });

    if (imageDeleted.deletedCount !== 1) {
      throw new InternalServerErrorException(ImagesError.INTERNAL_SERVER_ERROR);
    }

    return true;
  }

  async deleteImageProjectMany(projectId: string): Promise<boolean> {
    const imagesDeleted = await this.imageModel.deleteMany({
      projectId: new Types.ObjectId(projectId),
    });

    if (!imagesDeleted.acknowledged && imagesDeleted.deletedCount === 0) {
      throw new InternalServerErrorException(ImagesError.INTERNAL_SERVER_ERROR);
    }

    return true;
  }
}
