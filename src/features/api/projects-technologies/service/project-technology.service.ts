import { TransformDto } from '@/shared/utils';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ProjectTechnology,
  ProjectTechnologyDocument,
} from '../schema/project-technology.schema';
import { ProjectTechnologieResponseDto } from '../dto/response/project-technologies.response.dto';
import { IProjectTechnologyRepository } from '../repository/project-technology.interface.repository';
import {
  TechnologiesError,
  TechnologiesOk,
} from '../messages/project-technologies.messages';
import { InsertOrUpdateProjectTecDto } from '../dto/insert-update.dto';
import { Types } from 'mongoose';

@Injectable()
export class ProjectTechnologyService {
  constructor(
    private readonly techRepository: IProjectTechnologyRepository,
    @Inject(TransformDto)
    private readonly transformDto: TransformDto<
      ProjectTechnologyDocument,
      ProjectTechnologieResponseDto
    >,
  ) {}

  transformArray(
    data: ProjectTechnologyDocument[],
  ): ProjectTechnologieResponseDto[] {
    return this.transformDto.transformDtoArray(
      data,
      ProjectTechnologieResponseDto,
    );
  }

  transformObject(
    data: ProjectTechnologyDocument,
  ): ProjectTechnologieResponseDto {
    return this.transformDto.transformDtoObject(
      data,
      ProjectTechnologieResponseDto,
    );
  }

  async getAllTechnologies(): Promise<ProjectTechnologieResponseDto[] | null> {
    const technologies: ProjectTechnologyDocument[] =
      await this.techRepository.getAllTechnologies();
    return this.transformArray(technologies);
  }

  async getOneById(id: string): Promise<ProjectTechnologieResponseDto | null> {
    const technology: ProjectTechnologyDocument =
      await this.techRepository.getTechnologyById(id);

    if (!technology) {
      throw new NotFoundException(TechnologiesError.TECHNOLOGIES_NOT_FOUND);
    }

    return this.transformObject(technology);
  }

  async countByCategory(category: string): Promise<number> {
    return this.techRepository.countByCategory(category);
  }

  async getOneByName(name: string) {
    const technology: ProjectTechnologyDocument =
      await this.techRepository.getTechnologyByName(name);

    if (!technology) {
      throw new NotFoundException(TechnologiesError.TECHNOLOGIES_NOT_FOUND);
    }

    return this.transformObject(technology);
  }

  async createNewTech(dto: InsertOrUpdateProjectTecDto): Promise<boolean> {
    const techAlreadyExist: boolean =
      await this.techRepository.technologyAlredyExist(
        dto.name,
        dto.projectId.toHexString(),
      );

    if (techAlreadyExist) {
      throw new BadRequestException(
        TechnologiesError.TECHNOLOGIES_ALREADY_EXIST,
      );
    }

    const newTech = {};

    for (const tech in dto) {
      if (dto[tech] ?? false) newTech[tech] = dto[tech];
    }

    const result: boolean | ProjectTechnologyDocument =
      await this.techRepository.insertOrUpdateTechnology(
        newTech as ProjectTechnology,
      );

    if (!result) {
      throw new BadRequestException(TechnologiesError.TECHNOLOGIES_ERROR);
    }

    return true;
  }

  async createNewTechAuto(
    dto: InsertOrUpdateProjectTecDto,
  ): Promise<Types.ObjectId> {
    const techAlreadyExist: boolean =
      await this.techRepository.technologyAlredyExist(
        dto.name,
        dto.projectId.toHexString(),
      );

    if (techAlreadyExist) {
      throw new BadRequestException(
        TechnologiesError.TECHNOLOGIES_ALREADY_EXIST,
      );
    }

    const newTech = {};

    for (const tech in dto) {
      if (dto[tech] ?? false) newTech[tech] = dto[tech];
    }

    const result: boolean | ProjectTechnologyDocument =
      await this.techRepository.insertOrUpdateTechnology(
        newTech as ProjectTechnology,
      );

    if (!result || typeof result === 'boolean') {
      throw new BadRequestException(TechnologiesError.TECHNOLOGIES_ERROR);
    }

    return result._id as Types.ObjectId;
  }

  async updateTechnology(
    id: string,
    dto: InsertOrUpdateProjectTecDto,
  ): Promise<string> {
    const technology = await this.techRepository.getTechnologyById(id);

    if (!technology) {
      throw new NotFoundException(TechnologiesError.TECHNOLOGIES_NOT_FOUND);
    }

    const techAlreadyExist: boolean =
      await this.techRepository.technologyAlredyExist(
        dto.name,
        dto.projectId.toHexString(),
        id,
      );

    if (techAlreadyExist) {
      throw new BadRequestException(
        TechnologiesError.TECHNOLOGIES_ALREADY_EXIST,
      );
    }

    const techToEdit: Partial<ProjectTechnology> = {};

    for (const key in dto) {
      if (dto[key] !== undefined && dto[key] !== null) {
        techToEdit[key] = dto[key];
      }
    }

    techToEdit.updatedAt = new Date();

    const techUpdated: boolean | ProjectTechnologyDocument =
      await this.techRepository.insertOrUpdateTechnology(
        techToEdit as ProjectTechnology,
        id,
      );

    if (!techUpdated) {
      throw new BadRequestException(TechnologiesError.TECHNOLOGIES_ERROR);
    }

    return TechnologiesOk.TECHNOLOGY_UPDATED;
  }

  async deleteTechnology(id: string): Promise<string> {
    const technology = await this.techRepository.getTechnologyById(id);

    if (!technology) {
      throw new NotFoundException(TechnologiesError.TECHNOLOGIES_NOT_FOUND);
    }

    const techDeleted = await this.techRepository.deleteTechnology(id);

    if (!techDeleted) {
      throw new BadRequestException(TechnologiesError.TECHNOLOGIES_ERROR);
    }

    return TechnologiesOk.TECHNOLOGY_REMOVED;
  }
}
