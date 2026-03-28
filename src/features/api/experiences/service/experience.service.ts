import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IExperiencesRepository } from '@/features/api/experiences/repository/experiencie.interface.repository';
import { TransformDto } from '@/shared/utils';
import {
  Experience,
  ExperienceDocument,
} from '@/features/api/experiences/schema/experiencie.schema';
import { ExperienceResponseDto } from '@/features/api/experiences/dtos/response/response.dto';
import {
  ExperienceError,
  ExperienceMessages,
} from '@/features/api/experiences/messages/general.messages';
import { CreateNewExperienceDto } from '@/features/api/experiences/dtos/create.dto';
import { UpdateExperienceDto } from '@/features/api/experiences/dtos/update.dto';

@Injectable()
export class ExperienceService {
  constructor(
    private readonly expRepository: IExperiencesRepository,
    @Inject(TransformDto)
    private readonly transformDto: TransformDto<
      ExperienceDocument,
      ExperienceResponseDto
    >,
  ) {}

  transformArray(data: ExperienceDocument[]): ExperienceResponseDto[] {
    return this.transformDto.transformDtoArray(data, ExperienceResponseDto);
  }

  transformObject(data: ExperienceDocument): ExperienceResponseDto {
    return this.transformDto.transformDtoObject(data, ExperienceResponseDto);
  }

  async getAllExperiences(): Promise<ExperienceResponseDto[]> {
    const experiences: ExperienceDocument[] =
      await this.expRepository.getAllExperiences();
    return this.transformArray(experiences);
  }

  async getExperienceById(id: string): Promise<ExperienceResponseDto> {
    const experience: ExperienceDocument =
      await this.expRepository.getExperienceById(id);

    if (!experience) {
      throw new NotFoundException(ExperienceError.EXPERIENCE_NOT_FOUND);
    }

    return this.transformObject(experience);
  }

  async createNewExp(dto: CreateNewExperienceDto): Promise<string> {
    const expAlreadyExist: boolean =
      await this.expRepository.experienceAlredyExist(dto.company);

    if (expAlreadyExist) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ALREADY_EXIST);
    }

    const newExp = {};

    for (const exp in dto) {
      if (dto[exp] ?? false) newExp[exp] = dto[exp];
    }

    const result: Experience = await this.expRepository.createExperience(
      newExp as Experience,
    );

    if (!result) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ERROR);
    }

    return ExperienceMessages.EXPERIENCE_CREATED;
  }

  async updateExp(id: string, dto: UpdateExperienceDto): Promise<string> {
    const experience: ExperienceDocument =
      await this.expRepository.getExperienceById(id);

    if (!experience) {
      throw new NotFoundException(ExperienceError.EXPERIENCE_NOT_FOUND);
    }
    const expAlreadyExist: boolean =
      await this.expRepository.experienceAlredyExist(dto.company, id);

    if (expAlreadyExist) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ALREADY_EXIST);
    }

    const expToEdit: Partial<Experience> = {};

    for (const key in dto) {
      if (dto[key] !== undefined && dto[key] !== null) {
        expToEdit[key] = dto[key];
      }
    }

    expToEdit.updatedAt = new Date();

    const expUpdated: boolean = await this.expRepository.updateExperience(
      id,
      expToEdit as Experience,
    );

    if (!expUpdated) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ERROR);
    }

    return ExperienceMessages.EXPERIENCE_UPDATED;
  }

  async deleteExperience(id: string): Promise<string> {
    const experience: ExperienceDocument =
      await this.expRepository.getExperienceById(id);

    if (!experience) {
      throw new NotFoundException(ExperienceError.EXPERIENCE_NOT_FOUND);
    }

    const expDeleted: boolean = await this.expRepository.deleteExperience(id);

    if (!expDeleted) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ERROR);
    }

    return ExperienceMessages.EXPERIENCE_REMOVED;
  }
}
