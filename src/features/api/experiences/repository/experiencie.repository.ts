import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import {
  Experience,
  ExperienceDocument,
} from '@/features/api/experiences/schema/experiencie.schema';
import { IExperiencesRepository } from '@/features/api/experiences/repository/experiencie.interface.repository';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions, Types } from 'mongoose';
import { ObjectId } from 'bson';
import { plainToInstance } from 'class-transformer';
import { ExperienceError } from '@/features/api/experiences/messages/general.messages';
import { ExperienceCount } from '../interface/experience-count.interface';

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

  async getAllExperiences(
    take: number,
    skip: number,
    search?: string | null,
  ): Promise<[ExperienceDocument[], number]> {
    const options: QueryOptions = {};

    if (typeof skip === 'number') options.skip = skip;
    if (typeof take === 'number') options.limit = take;

    const filter: FilterQuery<ExperienceDocument> = {};

    if (search) {
      const regex = new RegExp(search, 'i');

      filter.$or = [
        { company: regex },
        { position: regex },
        { description: regex },
      ];
    }

    const allExperiences: ExperienceDocument[] = await this.findAll(filter, {
      ...options,
      sort: { displayOrder: 1 },
    });

    const plainExperiences = allExperiences.map((exp) => exp.toObject());

    const total = await this.model.countDocuments(filter);

    return [plainExperiences, total];
  }

  async getAllExperiencesWithoutPagination(): Promise<ExperienceDocument[]> {
    const allExp: ExperienceDocument[] = await this.findAll({
      sort: { displayOrder: 1 },
    });
    return allExp.map((exp: ExperienceDocument) => exp.toObject());
  }

  async getExperienceStats(): Promise<ExperienceCount> {
    const [total, currentPosition, [skillsResult]] = await Promise.all([
      this.model.countDocuments({}),
      this.model.countDocuments({ currentPosition: true }),
      this.model.aggregate([
        { $group: { _id: null, total: { $sum: { $size: '$skills' } } } },
      ]),
    ]);

    return { total, currentPosition, skills: skillsResult?.total ?? 0 };
  }

  async getExperienceByDisplayOrder(
    displayOrder: number,
  ): Promise<ExperienceDocument | null> {
    return this.experiencieModel
      .findOne({ displayOrder })
      .sort({ displayOrder: 1 })
      .exec();
  }

  async countExperiences(): Promise<number> {
    return this.experiencieModel
      .countDocuments()
      .sort({ displayOrder: 1 })
      .exec();
  }

  async getExperienceById(id: string): Promise<ExperienceDocument> {
    const experience = await this.experiencieModel.findById(id);
    return experience ? experience.toJSON() : null;
  }

  async experienceAlredyExist(company: string, id?: string): Promise<boolean> {
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

  async decrementDisplayOrderFrom(deletedOrder: number): Promise<void> {
    await this.experiencieModel.updateMany(
      { displayOrder: { $gt: deletedOrder } },
      { $inc: { displayOrder: -1 } },
    );
  }

  async getLastDisplayOrder(): Promise<number> {
    const last = await this.experiencieModel
      .findOne()
      .sort({ displayOrder: -1 })
      .select('displayOrder')
      .lean();

    return last?.displayOrder ?? 0;
  }

  async getLastCurrentPosition(): Promise<boolean> {
    const current = await this.experiencieModel
      .findOne({ currentPosition: true })
      .select('currentPosition')
      .lean();

    return !!current;
  }
}
