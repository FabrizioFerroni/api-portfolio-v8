import { Injectable } from '@nestjs/common';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import {
  Experience,
  ExperienceDocument,
} from '@/features/api/experiences/schema/experiencie.schema';

@Injectable()
export abstract class IExperiencesRepository extends MongoDBRepository<ExperienceDocument> {
  abstract getAllExperiences(): Promise<ExperienceDocument[]>;
  abstract experienceAlredyExist(
    company: string,
    id?: string,
  ): Promise<boolean>;
  abstract getExperienceById(id: string): Promise<ExperienceDocument | null>;
  abstract createExperience(data: Experience): Promise<Experience>;
  abstract updateExperience(id: string, data: Experience): Promise<boolean>;
  abstract deleteExperience(id: string): Promise<boolean>;
}
