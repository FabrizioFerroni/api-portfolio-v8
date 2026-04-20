import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TransformDto } from '@/shared/utils';
import { ProjectFeatureService } from '@/features/api/projects-features/service/project-feature.service';
import { IProjectFeatureRepository } from '@/features/api/projects-features/repository/project-feature.interface.repository';
import { ProjectFeatureResponseDto } from '@/features/api/projects-features/dto/response/project-feature.response.dto';
import {
  FeatureError,
  FeaturesOk,
} from '@/features/api/projects-features/messages/project-feature.message';

const mockRepository = () => ({
  getAllFeatures: jest.fn(),
  getFeatureById: jest.fn(),
  getFeatureByDescription: jest.fn(),
  featureAlreadyExist: jest.fn(),
  insertOrUpdateFeature: jest.fn(),
  deleteFeature: jest.fn(),
});

const mockTransformDto = () => ({
  transformDtoArray: jest.fn(),
  transformDtoObject: jest.fn(),
});

function makeDoc(overrides = {}): any {
  return {
    _id: new Types.ObjectId(),
    description: 'Auth con JWT',
    displayOrder: 1,
    projectId: new Types.ObjectId(),
    ...overrides,
  };
}

function makeDto(overrides = {}): any {
  const projectId = new Types.ObjectId();
  return {
    description: 'Auth con JWT',
    projectId: { toHexString: () => projectId.toHexString() },
    displayOrder: 1,
    ...overrides,
  };
}

describe('ProjectFeatureService', () => {
  let service: ProjectFeatureService;
  let repo: ReturnType<typeof mockRepository>;
  let transform: ReturnType<typeof mockTransformDto>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectFeatureService,
        { provide: IProjectFeatureRepository, useFactory: mockRepository },
        { provide: TransformDto, useFactory: mockTransformDto },
      ],
    }).compile();

    service = module.get(ProjectFeatureService);
    repo = module.get(IProjectFeatureRepository);
    transform = module.get(TransformDto);
  });

  afterEach(() => jest.clearAllMocks());

  describe('transformArray', () => {
    it('delega en transformDtoArray con la clase correcta', () => {
      const docs = [makeDoc()];
      const expected = [new ProjectFeatureResponseDto()];
      transform.transformDtoArray.mockReturnValue(expected);

      const result = service.transformArray(docs);

      expect(transform.transformDtoArray).toHaveBeenCalledWith(
        docs,
        ProjectFeatureResponseDto,
      );
      expect(result).toBe(expected);
    });
  });

  describe('transformObject', () => {
    it('delega en transformDtoObject con la clase correcta', () => {
      const doc = makeDoc();
      const expected = new ProjectFeatureResponseDto();
      transform.transformDtoObject.mockReturnValue(expected);

      const result = service.transformObject(doc);

      expect(transform.transformDtoObject).toHaveBeenCalledWith(
        doc,
        ProjectFeatureResponseDto,
      );
      expect(result).toBe(expected);
    });
  });

  describe('getAllFeatures', () => {
    it('retorna el array transformado', async () => {
      const docs = [makeDoc(), makeDoc()];
      const dtos = [new ProjectFeatureResponseDto()];
      repo.getAllFeatures.mockResolvedValue(docs);
      transform.transformDtoArray.mockReturnValue(dtos);

      const result = await service.getAllFeatures();

      expect(repo.getAllFeatures).toHaveBeenCalledTimes(1);
      expect(result).toBe(dtos);
    });

    it('retorna array vacío si el repo devuelve []', async () => {
      repo.getAllFeatures.mockResolvedValue([]);
      transform.transformDtoArray.mockReturnValue([]);

      expect(await service.getAllFeatures()).toEqual([]);
    });
  });

  describe('getFeatureById', () => {
    it('retorna el DTO transformado si existe', async () => {
      const doc = makeDoc();
      const dto = new ProjectFeatureResponseDto();
      repo.getFeatureById.mockResolvedValue(doc);
      transform.transformDtoObject.mockReturnValue(dto);

      const result = await service.getFeatureById('abc');

      expect(repo.getFeatureById).toHaveBeenCalledWith('abc');
      expect(result).toBe(dto);
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.getFeatureById.mockResolvedValue(null);

      await expect(service.getFeatureById('abc')).rejects.toThrow(
        new NotFoundException(FeatureError.FEATURE_NOT_FOUND),
      );
    });
  });

  describe('getFeatureByDescription', () => {
    it('retorna el DTO transformado si existe', async () => {
      const doc = makeDoc();
      const dto = new ProjectFeatureResponseDto();
      repo.getFeatureByDescription.mockResolvedValue(doc);
      transform.transformDtoObject.mockReturnValue(dto);

      const result = await service.getFeatureByDescription('Auth con JWT');

      expect(repo.getFeatureByDescription).toHaveBeenCalledWith('Auth con JWT');
      expect(result).toBe(dto);
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.getFeatureByDescription.mockResolvedValue(null);

      await expect(
        service.getFeatureByDescription('no existe'),
      ).rejects.toThrow(new NotFoundException(FeatureError.FEATURE_NOT_FOUND));
    });
  });

  describe('createNewFeat', () => {
    it('retorna true si todo sale bien', async () => {
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(makeDoc());

      expect(await service.createNewFeat(makeDto())).toBe(true);
    });

    it('lanza BadRequestException si la feature ya existe', async () => {
      repo.featureAlreadyExist.mockResolvedValue(true);

      await expect(service.createNewFeat(makeDto())).rejects.toThrow(
        new BadRequestException(FeatureError.FEATURE_ALREADY_EXIST),
      );
      expect(repo.insertOrUpdateFeature).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException si el repo devuelve false', async () => {
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(false);

      await expect(service.createNewFeat(makeDto())).rejects.toThrow(
        new BadRequestException(FeatureError.FEATURE_ERROR),
      );
    });

    it('lanza BadRequestException si el repo devuelve true (boolean, no documento)', async () => {
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(true);

      await expect(service.createNewFeat(makeDto())).rejects.toThrow(
        new BadRequestException(FeatureError.FEATURE_ERROR),
      );
    });

    it('omite campos nullish del DTO (usa ?? false)', async () => {
      const dto = makeDto({ priority: null, tags: undefined });
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(makeDoc());

      await service.createNewFeat(dto);

      const inserted = repo.insertOrUpdateFeature.mock.calls[0][0];
      expect(inserted).not.toHaveProperty('priority');
      expect(inserted).not.toHaveProperty('tags');
    });

    it('omite campos con valor false (??  descarta falsy)', async () => {
      const dto = makeDto({ active: false });
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(makeDoc());

      await service.createNewFeat(dto);

      const inserted = repo.insertOrUpdateFeature.mock.calls[0][0];
      expect(inserted).not.toHaveProperty('active');
    });
  });

  describe('createNewFeatAuto', () => {
    it('retorna el _id del documento creado', async () => {
      const doc = makeDoc();
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(doc);

      const result = await service.createNewFeatAuto(makeDto());
      expect(result).toBe(doc._id);
    });

    it('lanza BadRequestException si ya existe', async () => {
      repo.featureAlreadyExist.mockResolvedValue(true);

      await expect(service.createNewFeatAuto(makeDto())).rejects.toThrow(
        new BadRequestException(FeatureError.FEATURE_ALREADY_EXIST),
      );
    });

    it('lanza BadRequestException si el repo devuelve false', async () => {
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(false);

      await expect(service.createNewFeatAuto(makeDto())).rejects.toThrow(
        new BadRequestException(FeatureError.FEATURE_ERROR),
      );
    });

    it('lanza BadRequestException si el repo devuelve true (boolean)', async () => {
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(true);

      await expect(service.createNewFeatAuto(makeDto())).rejects.toThrow(
        new BadRequestException(FeatureError.FEATURE_ERROR),
      );
    });
  });

  describe('updateFeat', () => {
    it('retorna el mensaje de éxito', async () => {
      repo.getFeatureById.mockResolvedValue(makeDoc());
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(true);

      const result = await service.updateFeat('id-1', makeDto());
      expect(result).toBe(FeaturesOk.FEATURE_UPDATED);
    });

    it('lanza NotFoundException si la feature no existe', async () => {
      repo.getFeatureById.mockResolvedValue(null);

      await expect(service.updateFeat('id-1', makeDto())).rejects.toThrow(
        new NotFoundException(FeatureError.FEATURE_NOT_FOUND),
      );
      expect(repo.featureAlreadyExist).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException si la descripción ya existe en otro doc', async () => {
      repo.getFeatureById.mockResolvedValue(makeDoc());
      repo.featureAlreadyExist.mockResolvedValue(true);

      await expect(service.updateFeat('id-1', makeDto())).rejects.toThrow(
        new BadRequestException(FeatureError.FEATURE_ALREADY_EXIST),
      );
      expect(repo.insertOrUpdateFeature).not.toHaveBeenCalled();
    });

    it('pasa el id propio al chequeo de duplicados para excluirse a sí mismo', async () => {
      const dto = makeDto();
      repo.getFeatureById.mockResolvedValue(makeDoc());
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(true);

      await service.updateFeat('id-1', dto);

      expect(repo.featureAlreadyExist).toHaveBeenCalledWith(
        dto.description,
        dto.projectId.toHexString(),
        'id-1',
      );
    });

    it('lanza BadRequestException si el repo devuelve false', async () => {
      repo.getFeatureById.mockResolvedValue(makeDoc());
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(false);

      await expect(service.updateFeat('id-1', makeDto())).rejects.toThrow(
        new BadRequestException(FeatureError.FEATURE_ERROR),
      );
    });

    it('lanza BadRequestException si el repo devuelve un documento (espera boolean)', async () => {
      repo.getFeatureById.mockResolvedValue(makeDoc());
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(makeDoc());

      await expect(service.updateFeat('id-1', makeDto())).rejects.toThrow(
        new BadRequestException(FeatureError.FEATURE_ERROR),
      );
    });

    it('agrega updatedAt al objeto a persistir', async () => {
      const before = new Date();
      repo.getFeatureById.mockResolvedValue(makeDoc());
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(true);

      await service.updateFeat('id-1', makeDto());

      const featToEdit = repo.insertOrUpdateFeature.mock.calls[0][0];
      expect(featToEdit.updatedAt).toBeInstanceOf(Date);
      expect(featToEdit.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });

    it('omite campos undefined y null del DTO al actualizar', async () => {
      const dto = makeDto({ priority: null, tags: undefined });
      repo.getFeatureById.mockResolvedValue(makeDoc());
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(true);

      await service.updateFeat('id-1', dto);

      const featToEdit = repo.insertOrUpdateFeature.mock.calls[0][0];
      expect(featToEdit).not.toHaveProperty('priority');
      expect(featToEdit).not.toHaveProperty('tags');
    });

    it('incluye campos con valor false (update usa !== undefined/null)', async () => {
      const dto = makeDto({ active: false });
      repo.getFeatureById.mockResolvedValue(makeDoc());
      repo.featureAlreadyExist.mockResolvedValue(false);
      repo.insertOrUpdateFeature.mockResolvedValue(true);

      await service.updateFeat('id-1', dto);

      const featToEdit = repo.insertOrUpdateFeature.mock.calls[0][0];
      expect(featToEdit.active).toBe(false);
    });
  });

  describe('deleteFeat', () => {
    it('retorna el mensaje de éxito', async () => {
      repo.getFeatureById.mockResolvedValue(makeDoc());
      repo.deleteFeature.mockResolvedValue(true);

      const result = await service.deleteFeat('id-1');
      expect(result).toBe(FeaturesOk.FEATURE_REMOVED);
    });

    it('lanza NotFoundException si la feature no existe', async () => {
      repo.getFeatureById.mockResolvedValue(null);

      await expect(service.deleteFeat('id-1')).rejects.toThrow(
        new NotFoundException(FeatureError.FEATURE_NOT_FOUND),
      );
      expect(repo.deleteFeature).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException si el repo falla al eliminar', async () => {
      repo.getFeatureById.mockResolvedValue(makeDoc());
      repo.deleteFeature.mockResolvedValue(false);

      await expect(service.deleteFeat('id-1')).rejects.toThrow(
        new BadRequestException(FeatureError.FEATURE_ERROR),
      );
    });

    it('pasa el mismo id a getFeatureById y deleteFeature', async () => {
      repo.getFeatureById.mockResolvedValue(makeDoc());
      repo.deleteFeature.mockResolvedValue(true);

      await service.deleteFeat('id-xyz');

      expect(repo.getFeatureById).toHaveBeenCalledWith('id-xyz');
      expect(repo.deleteFeature).toHaveBeenCalledWith('id-xyz');
    });
  });
});
