import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { TransformDto } from '@/shared/utils';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(),
  rmdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock('@/shared/utils/functions/generateSlug', () => ({
  generateSlug: jest.fn(() => 'mi-proyecto'),
}));

jest.mock('@/config/app/config.app', () => ({
  configApp: jest.fn(() => ({ apiHost: 'https://api.test.com' })),
}));

import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { generateSlug } from '@/shared/utils/functions/generateSlug';
import { ProjectImageService } from '@/features/api/projects-images/service/project-image.service';
import { IProjectImageRepository } from '@/features/api/projects-images/repository/project-image.interface.repository';
import { ProjectImageResponseDto } from '@/features/api/projects-images/dto/response/project-image.response.dto';
import { ImagesError } from '@/features/api/projects-images/messages/project-images.messages';

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockMkdirSync = mkdirSync as jest.MockedFunction<typeof mkdirSync>;
const mockReaddirSync = readdirSync as jest.MockedFunction<typeof readdirSync>;
const mockRmdirSync = rmdirSync as jest.MockedFunction<typeof rmdirSync>;
const mockUnlinkSync = unlinkSync as jest.MockedFunction<typeof unlinkSync>;
const mockWriteFileSync = writeFileSync as jest.MockedFunction<
  typeof writeFileSync
>;
const mockGenerateSlug = generateSlug as jest.MockedFunction<
  typeof generateSlug
>;

const mockRepository = () => ({
  getAllProjectsImages: jest.fn(),
  getProjectImgById: jest.fn(),
  getProjectImgsByProjectId: jest.fn(),
  uploadImageToProject: jest.fn(),
  deleteImageProject: jest.fn(),
  deleteImageProjectMany: jest.fn(),
});

const mockTransformDto = () => ({
  transformDtoArray: jest.fn(),
  transformDtoObject: jest.fn(),
});

function makeDoc(overrides = {}): any {
  return {
    _id: new Types.ObjectId(),
    imageUrl: '/file/projects/pid/img.png',
    imagePath: '/srv/uploads/projects/pid/img.png',
    projectId: new Types.ObjectId(),
    ...overrides,
  };
}

function makeUploadDto(overrides = {}): any {
  return {
    projectId: new Types.ObjectId().toHexString(),
    projectName: 'Mi Proyecto',
    displayOrder: 1,
    altText: 'Imagen de prueba',
    ...overrides,
  };
}

function makeMulterFile(overrides = {}): Express.Multer.File {
  return {
    originalname: 'photo.png',
    buffer: Buffer.from('fake-image'),
    mimetype: 'image/png',
    size: 1024,
    fieldname: 'file',
    encoding: '7bit',
    stream: null,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  } as Express.Multer.File;
}

describe('ProjectImageService', () => {
  let service: ProjectImageService;
  let repo: ReturnType<typeof mockRepository>;
  let transform: ReturnType<typeof mockTransformDto>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectImageService,
        { provide: IProjectImageRepository, useFactory: mockRepository },
        { provide: TransformDto, useFactory: mockTransformDto },
      ],
    }).compile();

    service = module.get(ProjectImageService);
    repo = module.get(IProjectImageRepository);
    transform = module.get(TransformDto);
  });

  afterEach(() => jest.clearAllMocks());

  describe('transformArray', () => {
    it('delega en transformDtoArray con la clase correcta', () => {
      const docs = [makeDoc()];
      const expected = [new ProjectImageResponseDto()];
      transform.transformDtoArray.mockReturnValue(expected);

      const result = service.transformArray(docs);

      expect(transform.transformDtoArray).toHaveBeenCalledWith(
        docs,
        ProjectImageResponseDto,
      );
      expect(result).toBe(expected);
    });
  });

  describe('transformObject', () => {
    it('delega en transformDtoObject con la clase correcta', () => {
      const doc = makeDoc();
      const expected = new ProjectImageResponseDto();
      transform.transformDtoObject.mockReturnValue(expected);

      const result = service.transformObject(doc);

      expect(transform.transformDtoObject).toHaveBeenCalledWith(
        doc,
        ProjectImageResponseDto,
      );
      expect(result).toBe(expected);
    });
  });

  describe('getAllProjectImages', () => {
    it('retorna el array transformado', async () => {
      const docs = [makeDoc()];
      const dtos = [new ProjectImageResponseDto()];
      repo.getAllProjectsImages.mockResolvedValue(docs);
      transform.transformDtoArray.mockReturnValue(dtos);

      expect(await service.getAllProjectImages()).toBe(dtos);
      expect(repo.getAllProjectsImages).toHaveBeenCalledTimes(1);
    });

    it('retorna array vacío si no hay imágenes', async () => {
      repo.getAllProjectsImages.mockResolvedValue([]);
      transform.transformDtoArray.mockReturnValue([]);

      expect(await service.getAllProjectImages()).toEqual([]);
    });
  });

  describe('getProjectImageById', () => {
    it('retorna el DTO si existe', async () => {
      const doc = makeDoc();
      const dto = new ProjectImageResponseDto();
      repo.getProjectImgById.mockResolvedValue(doc);
      transform.transformDtoObject.mockReturnValue(dto);

      expect(await service.getProjectImageById('id-1')).toBe(dto);
      expect(repo.getProjectImgById).toHaveBeenCalledWith('id-1');
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.getProjectImgById.mockResolvedValue(null);

      await expect(service.getProjectImageById('id-1')).rejects.toThrow(
        new NotFoundException(ImagesError.IMAGES_NOT_FOUND),
      );
    });
  });

  describe('getAllProjectImagesByProjectId', () => {
    it('retorna el array transformado para el projectId dado', async () => {
      const docs = [makeDoc(), makeDoc()];
      const dtos = [new ProjectImageResponseDto()];
      repo.getProjectImgsByProjectId.mockResolvedValue(docs);
      transform.transformDtoArray.mockReturnValue(dtos);

      const result = await service.getAllProjectImagesByProjectId('pid-1');

      expect(repo.getProjectImgsByProjectId).toHaveBeenCalledWith('pid-1');
      expect(result).toBe(dtos);
    });
  });

  describe('uploadProjectImage', () => {
    it('retorna true si todo sale bien', async () => {
      repo.uploadImageToProject.mockResolvedValue(true);

      const result = await service.uploadProjectImage(
        makeUploadDto(),
        makeMulterFile(),
      );

      expect(result).toBe(true);
    });

    it('crea el directorio con mkdirSync recursive', async () => {
      repo.uploadImageToProject.mockResolvedValue(true);
      const pid = new Types.ObjectId().toHexString();
      const dto = makeUploadDto({ projectId: pid });

      await service.uploadProjectImage(dto, makeMulterFile());

      expect(mockMkdirSync).toHaveBeenCalledWith(expect.stringContaining(pid), {
        recursive: true,
      });
    });

    it('escribe el buffer del archivo en disco', async () => {
      const file = makeMulterFile({ buffer: Buffer.from('img-data') });
      repo.uploadImageToProject.mockResolvedValue(true);

      await service.uploadProjectImage(makeUploadDto(), file);

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.any(String),
        file.buffer,
      );
    });

    it('usa generateSlug para construir el nombre del archivo', async () => {
      mockGenerateSlug.mockReturnValue('mi-proyecto');
      repo.uploadImageToProject.mockResolvedValue(true);

      await service.uploadProjectImage(
        makeUploadDto({ projectName: 'Mi Proyecto' }),
        makeMulterFile(),
      );

      expect(mockGenerateSlug).toHaveBeenCalledWith('Mi Proyecto');
      const record = repo.uploadImageToProject.mock.calls[0][0];
      expect(record.imageUrl).toContain('mi-proyecto');
    });

    it('preserva la extensión del archivo original en el nombre', async () => {
      repo.uploadImageToProject.mockResolvedValue(true);

      await service.uploadProjectImage(
        makeUploadDto(),
        makeMulterFile({ originalname: 'foto.webp' }),
      );

      const record = repo.uploadImageToProject.mock.calls[0][0];
      expect(record.imageUrl).toMatch(/\.webp$/);
    });

    it('construye imageUrl con el formato /file/projects/{projectId}/{filename}', async () => {
      repo.uploadImageToProject.mockResolvedValue(true);
      const pid = new Types.ObjectId().toHexString();
      const dto = makeUploadDto({ projectId: pid });

      await service.uploadProjectImage(dto, makeMulterFile());

      const record = repo.uploadImageToProject.mock.calls[0][0];
      expect(record.imageUrl).toMatch(
        new RegExp(`^\/file\/projects\/${pid}\/`),
      );
    });

    it('construye imageFullUrl con el host de configApp', async () => {
      repo.uploadImageToProject.mockResolvedValue(true);

      await service.uploadProjectImage(makeUploadDto(), makeMulterFile());

      const record = repo.uploadImageToProject.mock.calls[0][0];
      expect(record.imageFullUrl).toMatch(/^https:\/\/api\.test\.com/);
    });

    it('usa displayOrder 0 si no se provee', async () => {
      repo.uploadImageToProject.mockResolvedValue(true);
      const dto = makeUploadDto({ displayOrder: undefined });

      await service.uploadProjectImage(dto, makeMulterFile());

      const record = repo.uploadImageToProject.mock.calls[0][0];
      expect(record.displayOrder).toBe(0);
    });

    it('usa altText por defecto si no se provee', async () => {
      repo.uploadImageToProject.mockResolvedValue(true);
      const dto = makeUploadDto({ altText: undefined, projectName: 'Test' });

      await service.uploadProjectImage(dto, makeMulterFile());

      const record = repo.uploadImageToProject.mock.calls[0][0];
      expect(record.altText).toBe('Imagen proyecto Test');
    });

    it('el projectId del record es un ObjectId válido', async () => {
      repo.uploadImageToProject.mockResolvedValue(true);
      const pid = new Types.ObjectId().toHexString();

      await service.uploadProjectImage(
        makeUploadDto({ projectId: pid }),
        makeMulterFile(),
      );

      const record = repo.uploadImageToProject.mock.calls[0][0];
      expect(record.projectId).toBeInstanceOf(Types.ObjectId);
      expect(record.projectId.toHexString()).toBe(pid);
    });

    it('lanza InternalServerErrorException si el repo falla', async () => {
      repo.uploadImageToProject.mockResolvedValue(false);

      await expect(
        service.uploadProjectImage(makeUploadDto(), makeMulterFile()),
      ).rejects.toThrow(
        new InternalServerErrorException(ImagesError.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('remove', () => {
    it('retorna true si todo sale bien', async () => {
      const doc = makeDoc({ imagePath: '/uploads/projects/pid/img.png' });
      repo.getProjectImgById.mockResolvedValue(doc);
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(['otro.png'] as any);
      repo.deleteImageProject.mockResolvedValue(true);

      expect(await service.remove('id-1')).toBe(true);
    });

    it('lanza NotFoundException si la imagen no existe en la base', async () => {
      repo.getProjectImgById.mockResolvedValue(null);

      await expect(service.remove('id-1')).rejects.toThrow(NotFoundException);
      expect(mockUnlinkSync).not.toHaveBeenCalled();
    });

    it('elimina el archivo si existe en disco', async () => {
      const doc = makeDoc({ imagePath: '/uploads/pid/img.png' });
      repo.getProjectImgById.mockResolvedValue(doc);
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(['otro.png'] as any);
      repo.deleteImageProject.mockResolvedValue(true);

      await service.remove('id-1');

      expect(mockUnlinkSync).toHaveBeenCalledWith(doc.imagePath);
    });

    it('no llama a unlinkSync si el archivo no existe en disco', async () => {
      const doc = makeDoc({ imagePath: '/uploads/pid/img.png' });
      repo.getProjectImgById.mockResolvedValue(doc);
      mockExistsSync.mockReturnValue(false);
      repo.deleteImageProject.mockResolvedValue(true);

      await service.remove('id-1');

      expect(mockUnlinkSync).not.toHaveBeenCalled();
    });

    it('elimina el directorio si queda vacío tras borrar el archivo', async () => {
      const doc = makeDoc({ imagePath: '/uploads/pid/img.png' });
      repo.getProjectImgById.mockResolvedValue(doc);
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([] as any); // directorio vacío
      repo.deleteImageProject.mockResolvedValue(true);

      await service.remove('id-1');

      expect(mockRmdirSync).toHaveBeenCalledWith('/uploads/pid');
    });

    it('no elimina el directorio si todavía tiene archivos', async () => {
      const doc = makeDoc({ imagePath: '/uploads/pid/img.png' });
      repo.getProjectImgById.mockResolvedValue(doc);
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(['otro.png', 'otro2.png'] as any);
      repo.deleteImageProject.mockResolvedValue(true);

      await service.remove('id-1');

      expect(mockRmdirSync).not.toHaveBeenCalled();
    });

    it('lanza InternalServerErrorException si el repo falla al eliminar', async () => {
      const doc = makeDoc({ imagePath: '/uploads/pid/img.png' });
      repo.getProjectImgById.mockResolvedValue(doc);
      mockExistsSync.mockReturnValue(false);
      repo.deleteImageProject.mockResolvedValue(false);

      await expect(service.remove('id-1')).rejects.toThrow(
        new InternalServerErrorException(ImagesError.IMAGES_ERROR),
      );
    });
  });

  describe('removeAllByProject', () => {
    it('retorna true si todo sale bien', async () => {
      const docs = [
        makeDoc({ imagePath: '/uploads/pid/a.png' }),
        makeDoc({ imagePath: '/uploads/pid/b.png' }),
      ];
      repo.getProjectImgsByProjectId.mockResolvedValue(docs);
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([] as any);
      repo.deleteImageProjectMany.mockResolvedValue(true);

      expect(await service.removeAllByProject('pid')).toBe(true);
    });

    it('elimina cada archivo que existe en disco', async () => {
      const docs = [
        makeDoc({ imagePath: '/uploads/pid/a.png' }),
        makeDoc({ imagePath: '/uploads/pid/b.png' }),
      ];
      repo.getProjectImgsByProjectId.mockResolvedValue(docs);
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([] as any);
      repo.deleteImageProjectMany.mockResolvedValue(true);

      await service.removeAllByProject('pid');

      expect(mockUnlinkSync).toHaveBeenCalledTimes(2);
      expect(mockUnlinkSync).toHaveBeenCalledWith('/uploads/pid/a.png');
      expect(mockUnlinkSync).toHaveBeenCalledWith('/uploads/pid/b.png');
    });

    it('no llama a unlinkSync si ningún archivo existe en disco', async () => {
      const docs = [makeDoc({ imagePath: '/uploads/pid/a.png' })];
      repo.getProjectImgsByProjectId.mockResolvedValue(docs);
      mockExistsSync.mockReturnValue(false);
      repo.deleteImageProjectMany.mockResolvedValue(true);

      await service.removeAllByProject('pid');

      expect(mockUnlinkSync).not.toHaveBeenCalled();
    });

    it('intenta limpiar el directorio usando el path de la primera imagen', async () => {
      const docs = [
        makeDoc({ imagePath: '/uploads/pid/a.png' }),
        makeDoc({ imagePath: '/uploads/pid/b.png' }),
      ];
      repo.getProjectImgsByProjectId.mockResolvedValue(docs);
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([] as any);
      repo.deleteImageProjectMany.mockResolvedValue(true);

      await service.removeAllByProject('pid');

      expect(mockReaddirSync).toHaveBeenCalledWith('/uploads/pid');
    });

    it('no llama a removeDirectoryIfEmpty si no hay imágenes', async () => {
      repo.getProjectImgsByProjectId.mockResolvedValue([]);
      repo.deleteImageProjectMany.mockResolvedValue(true);

      await service.removeAllByProject('pid');

      expect(mockReaddirSync).not.toHaveBeenCalled();
      expect(mockRmdirSync).not.toHaveBeenCalled();
    });

    it('lanza InternalServerErrorException si el repo falla al eliminar en masa', async () => {
      repo.getProjectImgsByProjectId.mockResolvedValue([]);
      repo.deleteImageProjectMany.mockResolvedValue(false);

      await expect(service.removeAllByProject('pid')).rejects.toThrow(
        new InternalServerErrorException(ImagesError.IMAGES_ERROR),
      );
    });
  });
});
