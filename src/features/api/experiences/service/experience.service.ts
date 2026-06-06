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
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';
import { DefaultPageSize } from '@/shared/utils/constants/querying';
import { PaginationService } from '@/core/services/pagination.service';
import { PaginationMeta } from '@/core/interfaces/pagination-meta.interface';
import { ExperienceCount } from '../interface/experience-count.interface';

@Injectable()
export class ExperienceService {
  constructor(
    private readonly expRepository: IExperiencesRepository,
    @Inject(TransformDto)
    private readonly transformDto: TransformDto<
      ExperienceDocument,
      ExperienceResponseDto
    >,
    private readonly paginationService: PaginationService,
  ) {}

  transformArray(data: ExperienceDocument[]): ExperienceResponseDto[] {
    return this.transformDto.transformDtoArray(data, ExperienceResponseDto);
  }

  transformObject(data: ExperienceDocument): ExperienceResponseDto {
    return this.transformDto.transformDtoObject(data, ExperienceResponseDto);
  }

  async getAllExperiences(
    param: PaginationDto,
  ): Promise<{ experiences: ExperienceResponseDto[]; meta: PaginationMeta }> {
    const { page, limit, search } = param;

    const take = limit ?? DefaultPageSize.EXPERIENCES;
    const skip = this.paginationService.calculateOffset(limit, page);

    const [data, count] = await this.expRepository.getAllExperiences(
      take,
      skip,
      search,
    );

    const experiences: ExperienceResponseDto[] = this.transformArray(data);

    const meta = this.paginationService.createMeta(limit, page, count);

    const response = { experiences, meta };

    return response;
  }

  async getAllExperiencesWithoutPagination(): Promise<ExperienceResponseDto[]> {
    const experiences: ExperienceDocument[] =
      await this.expRepository.getAllExperiencesWithoutPagination();
    return this.transformArray(experiences);
  }

  async countAllExperiences(): Promise<ExperienceCount> {
    const countExperiences: ExperienceCount =
      await this.expRepository.getExperienceStats();

    return countExperiences;
  }

  /*async moveUpDisplayOrder(id: string) {
    const experience: ExperienceDocument =
      await this.expRepository.getExperienceById(id);

    if (!experience) {
      throw new NotFoundException(ExperienceError.EXPERIENCE_NOT_FOUND);
    }

    const totalExperiences = await this.expRepository.countExperiences();
    if (totalExperiences <= 1) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ONLY_ONE);
    }

    // Buscar el vecino con displayOrder inmediatamente superior
    const neighbor: ExperienceDocument =
      await this.expRepository.getExperienceByDisplayOrder(
        experience.displayOrder + 1,
      );

    if (!neighbor) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ALREADY_AT_TOP);
    }

    const [updatedCurrent, updatedNeighbor] = await Promise.all([
      this.expRepository.updateExperience(id, {
        displayOrder: neighbor.displayOrder,
        updatedAt: new Date(),
      } as Experience),
      this.expRepository.updateExperience(neighbor.id, {
        displayOrder: experience.displayOrder,
        updatedAt: new Date(),
      } as Experience),
    ]);

    if (!updatedCurrent || !updatedNeighbor) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ERROR);
    }

    return ExperienceMessages.EXPERIENCE_MOVED_UP;
  }

  async moveDownDisplayOrder(id: string) {
    const experience: ExperienceDocument =
      await this.expRepository.getExperienceById(id);

    if (!experience) {
      throw new NotFoundException(ExperienceError.EXPERIENCE_NOT_FOUND);
    }

    console.log(
      `displayOrder original antes de moveDown: ${experience.displayOrder}`,
    );
    const totalExperiences = await this.expRepository.countExperiences();
    if (totalExperiences <= 1) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ONLY_ONE);
    }

    console.log(
      `displayOrder original antes de moveDown: ${experience.displayOrder}`,
    );

    const neighbor: ExperienceDocument =
      await this.expRepository.getExperienceByDisplayOrder(
        experience.displayOrder - 1,
      );

    console.log(
      `displayOrder original neighbor de moveDown: ${neighbor.displayOrder}`,
    );

    if (!neighbor) {
      throw new BadRequestException(
        ExperienceError.EXPERIENCE_ALREADY_AT_BOTTOM,
      );
    }

    // Swap
    const [updatedCurrent, updatedNeighbor] = await Promise.all([
      this.expRepository.updateExperience(id, {
        displayOrder: neighbor.displayOrder,
        updatedAt: new Date(),
      } as Experience),
      this.expRepository.updateExperience(neighbor.id, {
        displayOrder: experience.displayOrder,
        updatedAt: new Date(),
      } as Experience),
    ]);

    if (!updatedCurrent || !updatedNeighbor) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ERROR);
    }

    return ExperienceMessages.EXPERIENCE_MOVED_DOWN;
  }*/

  async moveUpDisplayOrder(id: string) {
    const experience: ExperienceDocument =
      await this.expRepository.getExperienceById(id);

    if (!experience) {
      throw new NotFoundException(ExperienceError.EXPERIENCE_NOT_FOUND);
    }

    const totalExperiences = await this.expRepository.countExperiences();
    if (totalExperiences <= 1) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ONLY_ONE);
    }

    // displayOrder menor = más arriba, si es 0 ya está en el tope
    const neighbor: ExperienceDocument =
      await this.expRepository.getExperienceByDisplayOrder(
        experience.displayOrder - 1,
      );

    if (!neighbor) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ALREADY_AT_TOP);
    }

    const [updatedCurrent, updatedNeighbor] = await Promise.all([
      this.expRepository.updateExperience(id, {
        displayOrder: neighbor.displayOrder,
        updatedAt: new Date(),
      } as Experience),
      this.expRepository.updateExperience(neighbor.id, {
        displayOrder: experience.displayOrder,
        updatedAt: new Date(),
      } as Experience),
    ]);

    if (!updatedCurrent || !updatedNeighbor) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ERROR);
    }

    return ExperienceMessages.EXPERIENCE_MOVED_UP;
  }

  async moveDownDisplayOrder(id: string) {
    const experience: ExperienceDocument =
      await this.expRepository.getExperienceById(id);

    if (!experience) {
      throw new NotFoundException(ExperienceError.EXPERIENCE_NOT_FOUND);
    }

    const totalExperiences = await this.expRepository.countExperiences();
    if (totalExperiences <= 1) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ONLY_ONE);
    }

    // displayOrder mayor = más abajo
    const neighbor: ExperienceDocument =
      await this.expRepository.getExperienceByDisplayOrder(
        experience.displayOrder + 1,
      );

    if (!neighbor) {
      throw new BadRequestException(
        ExperienceError.EXPERIENCE_ALREADY_AT_BOTTOM,
      );
    }

    const [updatedCurrent, updatedNeighbor] = await Promise.all([
      this.expRepository.updateExperience(id, {
        displayOrder: neighbor.displayOrder,
        updatedAt: new Date(),
      } as Experience),
      this.expRepository.updateExperience(neighbor.id, {
        displayOrder: experience.displayOrder,
        updatedAt: new Date(),
      } as Experience),
    ]);

    if (!updatedCurrent || !updatedNeighbor) {
      throw new BadRequestException(ExperienceError.EXPERIENCE_ERROR);
    }

    return ExperienceMessages.EXPERIENCE_MOVED_DOWN;
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

    const lastDisplayOrder = await this.expRepository.getLastDisplayOrder();
    newExp['displayOrder'] = lastDisplayOrder + 1;

    if (dto.currentPosition) {
      const haveCurrentPosition =
        await this.expRepository.getLastCurrentPosition();

      if (haveCurrentPosition) {
        throw new BadRequestException(
          'Ya hay una posición actual, no se puede trabajar en dos al mismo tiempo',
        );
      }
    } else {
      if (!dto.endsDate) {
        throw new BadRequestException(
          'Debes seleccionar una fecha de fin, ya que no pertenece a una posición actual',
        );
      }
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
    expToEdit.displayOrder = experience.displayOrder;

    if (dto.currentPosition) {
      const haveCurrentPosition =
        await this.expRepository.getLastCurrentPosition();

      if (haveCurrentPosition) {
        throw new BadRequestException(
          'Ya hay una posición actual, no se puede trabajar en dos al mismo tiempo',
        );
      }
    } else {
      if (!dto.endsDate) {
        throw new BadRequestException(
          'Debes seleccionar una fecha de fin, ya que no pertenece a una posición actual',
        );
      }
    }

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

    await this.expRepository.decrementDisplayOrderFrom(experience.displayOrder);

    return ExperienceMessages.EXPERIENCE_REMOVED;
  }
}
