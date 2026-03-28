import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import {
  Experience,
  ExperienceDocument,
} from '@/features/api/experiences/schema/experiencie.schema';
import { IExperiencesRepository } from '@/features/api/experiences/repository/experiencie.interface.repository';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ObjectId } from 'bson';
import { plainToInstance } from 'class-transformer';
import { ExperienceError } from '@/features/api/experiences/messages/general.messages';

@Injectable()
export class ExperiencieRepository
  extends MongoDBRepository<ExperienceDocument>
  implements IExperiencesRepository
{
  constructor(
    @InjectModel(Experience.name)
    private readonly experiencieModel: Model<ExperienceDocument>,
  ) {
    super(experiencieModel);
  }

  async getAllExperiences(): Promise<ExperienceDocument[]> {
    const allExp: ExperienceDocument[] = await this.findAll();
    return allExp.map((exp: ExperienceDocument) => exp.toObject());
  }

  async getExperienceById(id: string): Promise<ExperienceDocument> {
    const experience = await this.experiencieModel.findById(id);
    return experience ? experience.toJSON() : null;
  }

  async experienceAlredyExist(company: string, id?: string): Promise<boolean> {
    /* if (!company) return false;

    let result: Experience;

    if (!id) {
      result = await this.experiencieModel.findOne({
        company: String(company),
      });
    } else {
      result = await this.experiencieModel.findOne({
        company: String(company),
        _id: { $ne: new ObjectId(id) },
      });
    }

    return !!result; */
    if (!company) return false;

    const query: FilterQuery<ExperienceDocument> = { company };

    if (id) {
      query._id = { $ne: new Types.ObjectId(id) };
    }

    const exp = await this.model.findOne(query).lean();
    return !!exp;
  }

  async createExperience(data: Experience): Promise<Experience> {
    const experience: Experience = plainToInstance(Experience, data);
    const expCreated: ExperienceDocument = await this.save(experience);

    if (!expCreated._id) {
      throw new InternalServerErrorException(
        ExperienceError.INTERNAL_SERVER_ERROR,
      );
    }

    return experience;
  }

  async updateExperience(id: string, data: Experience): Promise<boolean> {
    const experience: Experience = plainToInstance(Experience, data);

    const query = {
      $set: experience,
    };

    const expUpdated = await this.update(id, query);

    if (!expUpdated.acknowledged) {
      return null;
    }

    if (expUpdated.modifiedCount !== 1) {
      throw new InternalServerErrorException(
        ExperienceError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }
  async deleteExperience(id: string): Promise<boolean> {
    const expDeleted: { deletedCount?: number } = await this.remove(id);

    if (expDeleted.deletedCount !== 1) {
      throw new InternalServerErrorException(
        ExperienceError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }
}
