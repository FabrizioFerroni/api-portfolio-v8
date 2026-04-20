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
import {
  ProjectTechnology,
  ProjectTechnologyDocument,
} from '../schema/project-technology.schema';
import { IProjectTechnologyRepository } from './project-technology.interface.repository';
import { InsertOrUpdateProjectTecDto } from '../dto/insert-update.dto';
import { TechnologiesError } from '../messages/project-technologies.messages';
import { MapperHelper } from '@/shared/utils/functions/mapper-response';

const { ToList, ToOne } = MapperHelper;

@Injectable()
export class ProjectTechnologyRepository
  extends MongoDBRepository<ProjectTechnologyDocument>
  implements IProjectTechnologyRepository
{
  constructor(
    @InjectModel(ProjectTechnology.name)
    private readonly technologyModel: Model<ProjectTechnologyDocument>,
  ) {
    super(technologyModel);
  }
  async findByProjectIds(
    projectIds: Types.ObjectId[],
  ): Promise<ProjectTechnologyDocument[]> {
    return await this.technologyModel
      .find({ projectId: { $in: projectIds } })
      .exec();
  }

  async getAllTechnologies(): Promise<ProjectTechnologyDocument[] | null> {
    const allTechnologies: ProjectTechnologyDocument[] = await this.findAll();
    return ToList(allTechnologies);
  }

  async getTechnologyById(
    id: string,
  ): Promise<ProjectTechnologyDocument | null> {
    const technology = await this.technologyModel.findById(id);
    return technology
      ? ToOne<ProjectTechnologyDocument, ProjectTechnologyDocument>(technology)
      : null;
  }

  async getTechnologyByName(
    name: string,
  ): Promise<ProjectTechnologyDocument | null> {
    const technology = await this.model.findOne({
      name: { $regex: `^${name}$`, $options: 'i' },
    });

    return technology
      ? ToOne<ProjectTechnologyDocument, ProjectTechnologyDocument>(technology)
      : null;
  }

  async technologyAlredyExist(
    name: string,
    projectId: string,
    id?: string,
  ): Promise<boolean> {
    if (!name) return false;

    const query: FilterQuery<ProjectTechnologyDocument> = {
      name,
      projectId: new Types.ObjectId(projectId),
    };

    if (id) {
      query._id = { $ne: new Types.ObjectId(id) };
    }

    const tech = await this.model.findOne(query).lean();

    return !!tech;
  }

  async insertOrUpdateTechnology(
    data: InsertOrUpdateProjectTecDto,
    id?: string,
  ): Promise<ProjectTechnologyDocument | boolean> {
    if (id !== '' && id !== undefined && id !== null) {
      return await this.updateTechnology(id, data);
    } else {
      return await this.insertTechnology(data);
    }
  }

  private async insertTechnology(
    data: InsertOrUpdateProjectTecDto,
  ): Promise<ProjectTechnologyDocument> {
    const technology: ProjectTechnology = plainToInstance(
      ProjectTechnology,
      data,
    );
    const newTechnology: ProjectTechnologyDocument =
      await this.save(technology);

    if (!newTechnology._id) {
      throw new InternalServerErrorException(
        TechnologiesError.INTERNAL_SERVER_ERROR,
      );
    }

    return newTechnology;
  }

  private async updateTechnology(
    id: string,
    data: InsertOrUpdateProjectTecDto,
  ): Promise<boolean> {
    const technology: ProjectTechnology = plainToInstance(
      ProjectTechnology,
      data,
    );

    const query = {
      $set: technology,
    };

    const technologyUpdate: UpdateWriteOpResult =
      await this.technologyModel.updateOne({ _id: id }, query);

    if (!technologyUpdate.acknowledged) {
      return false;
    }

    if (technologyUpdate.modifiedCount !== 1) {
      throw new InternalServerErrorException(
        TechnologiesError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }

  async deleteTechnology(id: string): Promise<boolean> {
    const technologyDeleted: DeleteResult =
      await this.technologyModel.deleteOne({ _id: id });

    if (technologyDeleted.deletedCount !== 1) {
      throw new InternalServerErrorException(
        TechnologiesError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }
}
