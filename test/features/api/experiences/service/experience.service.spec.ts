import { CreateNewExperienceDto } from '@/features/api/experiences/dtos/create.dto';
import { ExperienceResponseDto } from '@/features/api/experiences/dtos/response/response.dto';
import { UpdateExperienceDto } from '@/features/api/experiences/dtos/update.dto';
import {
  ExperienceError,
  ExperienceMessages,
} from '@/features/api/experiences/messages/general.messages';
import { IExperiencesRepository } from '@/features/api/experiences/repository/experiencie.interface.repository';
import {
  Experience,
  ExperienceDocument,
} from '@/features/api/experiences/schema/experiencie.schema';
import { ExperienceService } from '@/features/api/experiences/service/experience.service';
import { TransformDto } from '@/shared/utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'bson';

const id = new ObjectId();

const makeExpDoc = (): ExperienceDocument =>
  ({
    _id: id,
    company: 'Acme Corp',
    position: 'Developer',
    startsDate: new Date('2022-01-01'),
    endsDate: new Date('2025-01-01'),
    currentPosition: false,
    description: 'Developed full stack app with angular, nestjs and postgresql',
    skills: ['angular', 'nestjs', 'postgresql'],
    displayOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as ExperienceDocument;

const makeResponseDto = (): ExperienceResponseDto =>
  ({
    _id: id.toString(),
    company: 'Acme Corp',
    position: 'developer',
    startsDate: new Date('2022-01-01'),
    endsDate: new Date('2025-01-01'),
    currentPosition: false,
    description: 'Developed full stack app with angular, nestjs and postgresql',
    displayOrder: 0,
    skills: ['angular', 'nestjs', 'postgresql'],
  }) as ExperienceResponseDto;

describe('ExperienceService', () => {
  let service: ExperienceService;

  const mockRepo: Partial<jest.Mocked<IExperiencesRepository>> = {
    getAllExperiences: jest.fn(),
    getExperienceById: jest.fn(),
    experienceAlredyExist: jest.fn(),
    createExperience: jest.fn(),
    updateExperience: jest.fn(),
    deleteExperience: jest.fn(),
  };

  const mockTransformDto = {
    transformDtoArray: jest.fn(),
    transformDtoObject: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperienceService,
        { provide: IExperiencesRepository, useValue: mockRepo },
        { provide: TransformDto, useValue: mockTransformDto },
      ],
    }).compile();

    service = module.get<ExperienceService>(ExperienceService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── getAllExperiences ───────────────────────────────────────────────────────
  describe('getAllExperiences', () => {
    it('should return a transformed array of experiences', async () => {
      const docs = [makeExpDoc()];
      const dtos = [makeResponseDto()];

      mockRepo.getAllExperiences.mockResolvedValue(docs);
      mockTransformDto.transformDtoArray.mockReturnValue(dtos);

      const result = await service.getAllExperiences();

      expect(mockRepo.getAllExperiences).toHaveBeenCalledTimes(1);
      expect(mockTransformDto.transformDtoArray).toHaveBeenCalledWith(
        docs,
        ExperienceResponseDto,
      );
      expect(result).toEqual(dtos);
    });
  });

  // ─── getExperienceById ──────────────────────────────────────────────────────
  describe('getExperienceById', () => {
    it('should return a transformed experience when it exists', async () => {
      const doc = makeExpDoc();
      const dto = makeResponseDto();

      mockRepo.getExperienceById.mockResolvedValue(doc);
      mockTransformDto.transformDtoObject.mockReturnValue(dto);

      const result = await service.getExperienceById('some-id');

      expect(mockRepo.getExperienceById).toHaveBeenCalledWith('some-id');
      expect(result).toEqual(dto);
    });

    it('should throw NotFoundException when experience does not exist', async () => {
      mockRepo.getExperienceById.mockResolvedValue(null);

      await expect(service.getExperienceById('bad-id')).rejects.toThrow(
        new NotFoundException(ExperienceError.EXPERIENCE_NOT_FOUND),
      );
    });
  });

  // ─── createNewExp ───────────────────────────────────────────────────────────
  describe('createNewExp', () => {
    const dto: CreateNewExperienceDto = {
      company: 'Acme Corp',
      position: 'Developer',
      startsDate: new Date('2022-01-01'),
      endsDate: new Date('2025-12-31'),
      currentPosition: false,
      description:
        'Developed full stack app with angular, nestjs and postgresql',
      skills: ['angular', 'nestjs', 'postgresql'],
    } as CreateNewExperienceDto;

    it('should create and return success message', async () => {
      mockRepo.experienceAlredyExist.mockResolvedValue(false);
      mockRepo.createExperience.mockResolvedValue(makeExpDoc() as Experience);

      const result = await service.createNewExp(dto);

      expect(mockRepo.experienceAlredyExist).toHaveBeenCalledWith(dto.company);
      expect(mockRepo.createExperience).toHaveBeenCalled();
      expect(result).toBe(ExperienceMessages.EXPERIENCE_CREATED);
    });

    it('should throw BadRequestException when company already exists', async () => {
      mockRepo.experienceAlredyExist.mockResolvedValue(true);

      await expect(service.createNewExp(dto)).rejects.toThrow(
        new BadRequestException(ExperienceError.EXPERIENCE_ALREADY_EXIST),
      );
      expect(mockRepo.createExperience).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when repo returns falsy on create', async () => {
      mockRepo.experienceAlredyExist.mockResolvedValue(false);
      mockRepo.createExperience.mockResolvedValue(null as Experience);

      await expect(service.createNewExp(dto)).rejects.toThrow(
        new BadRequestException(ExperienceError.EXPERIENCE_ERROR),
      );
    });

    it('should omit null/undefined fields from the payload sent to repo', async () => {
      const dtoWithNulls = {
        company: 'Acme',
        role: null,
        startDate: undefined,
      } as any;

      mockRepo.experienceAlredyExist.mockResolvedValue(false);
      mockRepo.createExperience.mockResolvedValue(
        makeExpDoc() as unknown as Experience,
      );

      await service.createNewExp(dtoWithNulls);

      const sentPayload = mockRepo.createExperience.mock.calls[0][0];
      expect(sentPayload).not.toHaveProperty('role');
      expect(sentPayload).not.toHaveProperty('startDate');
      expect(sentPayload).toHaveProperty('company', 'Acme');
    });
  });

  // ─── updateExp ──────────────────────────────────────────────────────────────
  describe('updateExp', () => {
    const dto: UpdateExperienceDto = {
      company: 'New Corp',
    } as UpdateExperienceDto;

    it('should update and return success message', async () => {
      mockRepo.getExperienceById.mockResolvedValue(makeExpDoc());
      mockRepo.experienceAlredyExist.mockResolvedValue(false);
      mockRepo.updateExperience.mockResolvedValue(true);

      const result = await service.updateExp(id.toString(), dto);

      expect(result).toBe(ExperienceMessages.EXPERIENCE_UPDATED);
    });

    it('should throw BadRequestException when company name already taken by another doc', async () => {
      mockRepo.getExperienceById.mockResolvedValue(makeExpDoc());
      mockRepo.experienceAlredyExist.mockResolvedValue(true);

      await expect(service.updateExp(id.toString(), dto)).rejects.toThrow(
        new BadRequestException(ExperienceError.EXPERIENCE_ALREADY_EXIST),
      );
    });

    it('should throw NotFoundException when experience does not exist', async () => {
      mockRepo.getExperienceById.mockResolvedValue(null);
      mockRepo.experienceAlredyExist.mockResolvedValue(false);

      await expect(service.updateExp('bad-id', dto)).rejects.toThrow(
        new NotFoundException(ExperienceError.EXPERIENCE_NOT_FOUND),
      );
    });

    it('should throw BadRequestException when repo returns false on update', async () => {
      mockRepo.getExperienceById.mockResolvedValue(makeExpDoc());
      mockRepo.experienceAlredyExist.mockResolvedValue(false);
      mockRepo.updateExperience.mockResolvedValue(false);

      await expect(service.updateExp(id.toString(), dto)).rejects.toThrow(
        new BadRequestException(ExperienceError.EXPERIENCE_ERROR),
      );
    });
  });

  // ─── deleteExperience ───────────────────────────────────────────────────────
  describe('deleteExperience', () => {
    it('should delete and return success message', async () => {
      mockRepo.getExperienceById.mockResolvedValue(makeExpDoc());
      mockRepo.deleteExperience.mockResolvedValue(true);

      const result = await service.deleteExperience(id.toString());

      expect(result).toBe(ExperienceMessages.EXPERIENCE_REMOVED);
    });

    it('should throw NotFoundException when experience does not exist', async () => {
      mockRepo.getExperienceById.mockResolvedValue(null);

      await expect(service.deleteExperience('bad-id')).rejects.toThrow(
        new NotFoundException(ExperienceError.EXPERIENCE_NOT_FOUND),
      );
      expect(mockRepo.deleteExperience).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when repo returns false on delete', async () => {
      mockRepo.getExperienceById.mockResolvedValue(makeExpDoc());
      mockRepo.deleteExperience.mockResolvedValue(false);

      await expect(service.deleteExperience(id.toString())).rejects.toThrow(
        new BadRequestException(ExperienceError.EXPERIENCE_ERROR),
      );
    });
  });
});
