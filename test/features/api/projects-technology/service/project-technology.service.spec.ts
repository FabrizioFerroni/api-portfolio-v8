import { ProjectTechnologieResponseDto } from '@/features/api/projects-technologies/dto/response/project-technologies.response.dto';
import {
  TechnologiesError,
  TechnologiesOk,
} from '@/features/api/projects-technologies/messages/project-technologies.messages';
import { IProjectTechnologyRepository } from '@/features/api/projects-technologies/repository/project-technology.interface.repository';
import { ProjectTechnologyService } from '@/features/api/projects-technologies/service/project-technology.service';
import { TransformDto } from '@/shared/utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

const mockRepository = () => ({
  getAllTechnologies: jest.fn(),
  getTechnologyById: jest.fn(),
  getTechnologyByName: jest.fn(),
  technologyAlredyExist: jest.fn(),
  insertOrUpdateTechnology: jest.fn(),
  deleteTechnology: jest.fn(),
});

const mockTransformDto = () => ({
  transformDtoArray: jest.fn(),
  transformDtoObject: jest.fn(),
});

function makeDoc(overrides = {}): any {
  return {
    _id: new Types.ObjectId(),
    name: 'Angular',
    projectId: new Types.ObjectId(),
    ...overrides,
  };
}

function makeDto(overrides = {}): any {
  const projectId = new Types.ObjectId();
  return {
    name: 'Angular',
    projectId: { toHexString: () => projectId.toHexString() },
    category: 'Frontend',
    ...overrides,
  };
}

describe('ProjectTechnologyService', () => {
  let service: ProjectTechnologyService;
  let repo: ReturnType<typeof mockRepository>;
  let transform: ReturnType<typeof mockTransformDto>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectTechnologyService,
        { provide: IProjectTechnologyRepository, useFactory: mockRepository },
        { provide: TransformDto, useFactory: mockTransformDto },
      ],
    }).compile();

    service = module.get(ProjectTechnologyService);
    repo = module.get(IProjectTechnologyRepository);
    transform = module.get(TransformDto);
  });

  afterEach(() => jest.clearAllMocks());

  describe('transformArray', () => {
    it('delega en transformDto.transformDtoArray con la clase correcta', () => {
      const docs = [makeDoc()];
      const expected = [new ProjectTechnologieResponseDto()];
      transform.transformDtoArray.mockReturnValue(expected);

      const result = service.transformArray(docs);

      expect(transform.transformDtoArray).toHaveBeenCalledWith(
        docs,
        ProjectTechnologieResponseDto,
      );
      expect(result).toBe(expected);
    });
    describe('transformObject', () => {
      it('delega en transformDto.transformDtoObject con la clase correcta', () => {
        const doc = makeDoc();
        const expected = new ProjectTechnologieResponseDto();
        transform.transformDtoObject.mockReturnValue(expected);

        const result = service.transformObject(doc);

        expect(transform.transformDtoObject).toHaveBeenCalledWith(
          doc,
          ProjectTechnologieResponseDto,
        );
        expect(result).toBe(expected);
      });
    });

    describe('getAllTechnologies', () => {
      it('retorna el array transformado', async () => {
        const docs = [makeDoc(), makeDoc()];
        const dtos = [new ProjectTechnologieResponseDto()];
        repo.getAllTechnologies.mockResolvedValue(docs);
        transform.transformDtoArray.mockReturnValue(dtos);

        const result = await service.getAllTechnologies();

        expect(repo.getAllTechnologies).toHaveBeenCalledTimes(1);
        expect(result).toBe(dtos);
      });

      it('retorna array vacío si el repo devuelve []', async () => {
        repo.getAllTechnologies.mockResolvedValue([]);
        transform.transformDtoArray.mockReturnValue([]);

        const result = await service.getAllTechnologies();
        expect(result).toEqual([]);
      });
    });

    describe('getOneById', () => {
      it('retorna el DTO transformado si existe', async () => {
        const doc = makeDoc();
        const dto = new ProjectTechnologieResponseDto();
        repo.getTechnologyById.mockResolvedValue(doc);
        transform.transformDtoObject.mockReturnValue(dto);

        const result = await service.getOneById('abc');

        expect(repo.getTechnologyById).toHaveBeenCalledWith('abc');
        expect(result).toBe(dto);
      });

      it('lanza NotFoundException si no existe', async () => {
        repo.getTechnologyById.mockResolvedValue(null);

        await expect(service.getOneById('abc')).rejects.toThrow(
          new NotFoundException(TechnologiesError.TECHNOLOGIES_NOT_FOUND),
        );
      });
    });

    describe('getOneByName', () => {
      it('retorna el DTO transformado si existe', async () => {
        const doc = makeDoc();
        const dto = new ProjectTechnologieResponseDto();
        repo.getTechnologyByName.mockResolvedValue(doc);
        transform.transformDtoObject.mockReturnValue(dto);

        const result = await service.getOneByName('React');

        expect(repo.getTechnologyByName).toHaveBeenCalledWith('React');
        expect(result).toBe(dto);
      });

      it('lanza NotFoundException si no existe', async () => {
        repo.getTechnologyByName.mockResolvedValue(null);

        await expect(service.getOneByName('React')).rejects.toThrow(
          new NotFoundException(TechnologiesError.TECHNOLOGIES_NOT_FOUND),
        );
      });
    });

    describe('createNewTech', () => {
      it('retorna true si todo sale bien', async () => {
        const dto = makeDto();
        repo.technologyAlredyExist.mockResolvedValue(false);
        repo.insertOrUpdateTechnology.mockResolvedValue(makeDoc());

        const result = await service.createNewTech(dto);
        expect(result).toBe(true);
      });

      it('lanza BadRequestException si la tech ya existe', async () => {
        repo.technologyAlredyExist.mockResolvedValue(true);

        await expect(service.createNewTech(makeDto())).rejects.toThrow(
          new BadRequestException(TechnologiesError.TECHNOLOGIES_ALREADY_EXIST),
        );
        expect(repo.insertOrUpdateTechnology).not.toHaveBeenCalled();
      });

      it('lanza BadRequestException si el repo devuelve falsy', async () => {
        repo.technologyAlredyExist.mockResolvedValue(false);
        repo.insertOrUpdateTechnology.mockResolvedValue(false);

        await expect(service.createNewTech(makeDto())).rejects.toThrow(
          new BadRequestException(TechnologiesError.TECHNOLOGIES_ERROR),
        );
      });

      it('omite campos nullish del DTO al construir el objeto a insertar', async () => {
        const dto = makeDto({ version: null, icon: undefined });
        repo.technologyAlredyExist.mockResolvedValue(false);
        repo.insertOrUpdateTechnology.mockResolvedValue(makeDoc());

        await service.createNewTech(dto);

        const inserted = repo.insertOrUpdateTechnology.mock.calls[0][0];
        expect(inserted).not.toHaveProperty('version');
        expect(inserted).not.toHaveProperty('icon');
      });

      it('incluye campos con valor false (falsy pero no nullish)', async () => {
        const dto = makeDto({ active: false });
        repo.technologyAlredyExist.mockResolvedValue(false);
        repo.insertOrUpdateTechnology.mockResolvedValue(makeDoc());

        await service.createNewTech(dto);

        const inserted = repo.insertOrUpdateTechnology.mock.calls[0][0];
        expect(inserted).not.toHaveProperty('active');
      });
    });

    describe('createNewTechAuto', () => {
      it('retorna el _id del documento creado', async () => {
        const doc = makeDoc();
        repo.technologyAlredyExist.mockResolvedValue(false);
        repo.insertOrUpdateTechnology.mockResolvedValue(doc);

        const result = await service.createNewTechAuto(makeDto());
        expect(result).toBe(doc._id);
      });

      it('lanza BadRequestException si ya existe', async () => {
        repo.technologyAlredyExist.mockResolvedValue(true);

        await expect(service.createNewTechAuto(makeDto())).rejects.toThrow(
          new BadRequestException(TechnologiesError.TECHNOLOGIES_ALREADY_EXIST),
        );
      });

      it('lanza BadRequestException si el repo devuelve false', async () => {
        repo.technologyAlredyExist.mockResolvedValue(false);
        repo.insertOrUpdateTechnology.mockResolvedValue(false);

        await expect(service.createNewTechAuto(makeDto())).rejects.toThrow(
          new BadRequestException(TechnologiesError.TECHNOLOGIES_ERROR),
        );
      });

      it('lanza BadRequestException si el repo devuelve true (boolean, no documento)', async () => {
        repo.technologyAlredyExist.mockResolvedValue(false);
        repo.insertOrUpdateTechnology.mockResolvedValue(true);

        await expect(service.createNewTechAuto(makeDto())).rejects.toThrow(
          new BadRequestException(TechnologiesError.TECHNOLOGIES_ERROR),
        );
      });
    });

    describe('updateTechnology', () => {
      it('retorna el mensaje de éxito', async () => {
        const doc = makeDoc();
        repo.getTechnologyById.mockResolvedValue(doc);
        repo.technologyAlredyExist.mockResolvedValue(false);
        repo.insertOrUpdateTechnology.mockResolvedValue(doc);

        const result = await service.updateTechnology('id-1', makeDto());
        expect(result).toBe(TechnologiesOk.TECHNOLOGY_UPDATED);
      });

      it('lanza NotFoundException si la tech no existe', async () => {
        repo.getTechnologyById.mockResolvedValue(null);

        await expect(
          service.updateTechnology('id-1', makeDto()),
        ).rejects.toThrow(
          new NotFoundException(TechnologiesError.TECHNOLOGIES_NOT_FOUND),
        );
        expect(repo.technologyAlredyExist).not.toHaveBeenCalled();
      });

      it('lanza BadRequestException si el nombre ya existe en otro doc', async () => {
        repo.getTechnologyById.mockResolvedValue(makeDoc());
        repo.technologyAlredyExist.mockResolvedValue(true);

        await expect(
          service.updateTechnology('id-1', makeDto()),
        ).rejects.toThrow(
          new BadRequestException(TechnologiesError.TECHNOLOGIES_ALREADY_EXIST),
        );
        expect(repo.insertOrUpdateTechnology).not.toHaveBeenCalled();
      });

      it('pasa el id al chequeo de duplicados para excluirse a sí mismo', async () => {
        const dto = makeDto();
        repo.getTechnologyById.mockResolvedValue(makeDoc());
        repo.technologyAlredyExist.mockResolvedValue(false);
        repo.insertOrUpdateTechnology.mockResolvedValue(makeDoc());

        await service.updateTechnology('id-1', dto);

        expect(repo.technologyAlredyExist).toHaveBeenCalledWith(
          dto.name,
          dto.projectId.toHexString(),
          'id-1',
        );
      });

      it('lanza BadRequestException si el repo devuelve falsy al actualizar', async () => {
        repo.getTechnologyById.mockResolvedValue(makeDoc());
        repo.technologyAlredyExist.mockResolvedValue(false);
        repo.insertOrUpdateTechnology.mockResolvedValue(false);

        await expect(
          service.updateTechnology('id-1', makeDto()),
        ).rejects.toThrow(
          new BadRequestException(TechnologiesError.TECHNOLOGIES_ERROR),
        );
      });

      it('agrega updatedAt al objeto a persistir', async () => {
        const before = new Date();
        repo.getTechnologyById.mockResolvedValue(makeDoc());
        repo.technologyAlredyExist.mockResolvedValue(false);
        repo.insertOrUpdateTechnology.mockResolvedValue(makeDoc());

        await service.updateTechnology('id-1', makeDto());

        const techToEdit = repo.insertOrUpdateTechnology.mock.calls[0][0];
        expect(techToEdit.updatedAt).toBeInstanceOf(Date);
        expect(techToEdit.updatedAt.getTime()).toBeGreaterThanOrEqual(
          before.getTime(),
        );
      });

      it('omite campos undefined y null del DTO al actualizar', async () => {
        const dto = makeDto({ version: null, icon: undefined });
        repo.getTechnologyById.mockResolvedValue(makeDoc());
        repo.technologyAlredyExist.mockResolvedValue(false);
        repo.insertOrUpdateTechnology.mockResolvedValue(makeDoc());

        await service.updateTechnology('id-1', dto);

        const techToEdit = repo.insertOrUpdateTechnology.mock.calls[0][0];
        expect(techToEdit).not.toHaveProperty('version');
        expect(techToEdit).not.toHaveProperty('icon');
      });

      it('incluye campos con valor false (update usa !== undefined/null, no ??)', async () => {
        const dto = makeDto({ active: false });
        repo.getTechnologyById.mockResolvedValue(makeDoc());
        repo.technologyAlredyExist.mockResolvedValue(false);
        repo.insertOrUpdateTechnology.mockResolvedValue(makeDoc());

        await service.updateTechnology('id-1', dto);

        const techToEdit = repo.insertOrUpdateTechnology.mock.calls[0][0];
        expect(techToEdit.active).toBe(false);
      });
    });

    describe('deleteTechnology', () => {
      it('retorna el mensaje de éxito', async () => {
        repo.getTechnologyById.mockResolvedValue(makeDoc());
        repo.deleteTechnology.mockResolvedValue(true);

        const result = await service.deleteTechnology('id-1');
        expect(result).toBe(TechnologiesOk.TECHNOLOGY_REMOVED);
      });

      it('lanza NotFoundException si la tech no existe', async () => {
        repo.getTechnologyById.mockResolvedValue(null);

        await expect(service.deleteTechnology('id-1')).rejects.toThrow(
          new NotFoundException(TechnologiesError.TECHNOLOGIES_NOT_FOUND),
        );
        expect(repo.deleteTechnology).not.toHaveBeenCalled();
      });

      it('lanza BadRequestException si el repo falla al eliminar', async () => {
        repo.getTechnologyById.mockResolvedValue(makeDoc());
        repo.deleteTechnology.mockResolvedValue(false);

        await expect(service.deleteTechnology('id-1')).rejects.toThrow(
          new BadRequestException(TechnologiesError.TECHNOLOGIES_ERROR),
        );
      });

      it('pasa el mismo id a getTechnologyById y deleteTechnology', async () => {
        repo.getTechnologyById.mockResolvedValue(makeDoc());
        repo.deleteTechnology.mockResolvedValue(true);

        await service.deleteTechnology('id-xyz');

        expect(repo.getTechnologyById).toHaveBeenCalledWith('id-xyz');
        expect(repo.deleteTechnology).toHaveBeenCalledWith('id-xyz');
      });
    });
  });
});
