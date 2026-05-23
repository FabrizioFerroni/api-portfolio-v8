import { Injectable } from '@nestjs/common';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import {
  Experience,
  ExperienceDocument,
} from '@/features/api/experiences/schema/experiencie.schema';
import { ExperienceCount } from '../interface/experience-count.interface';

@Injectable()
export abstract class IExperiencesRepository extends MongoDBRepository<ExperienceDocument> {
  abstract getAllExperiences(
    take: number,
    skip: number,
    search?: string | null,
  ): Promise<[ExperienceDocument[], number]>;
  abstract getAllExperiencesWithoutPagination(): Promise<ExperienceDocument[]>;
  abstract getExperienceStats(): Promise<ExperienceCount>;
  abstract experienceAlredyExist(
    company: string,
    id?: string,
  ): Promise<boolean>;
  abstract getExperienceByDisplayOrder(
    displayOrder: number,
  ): Promise<ExperienceDocument | null>;
  abstract countExperiences(): Promise<number>;
  abstract getExperienceById(id: string): Promise<ExperienceDocument | null>;
  abstract createExperience(data: Experience): Promise<Experience>;
  abstract updateExperience(id: string, data: Experience): Promise<boolean>;
  abstract deleteExperience(id: string): Promise<boolean>;
  abstract decrementDisplayOrderFrom(deletedOrder: number): Promise<void>;
  abstract getLastDisplayOrder(): Promise<number>;
  abstract getLastCurrentPosition(): Promise<boolean>;
}
