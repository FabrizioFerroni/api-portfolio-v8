import { ImageUploadPipe } from '@/shared/pipes/image-upload.pipe';
import {
  DetailedFileTypeValidator,
  DetailedMaxFileSizeValidator,
} from '@/shared/validators/file.validator';
import { ParseFilePipe } from '@nestjs/common';

jest.mock('@/shared/validators/file.validator');

const MockMaxSize = DetailedMaxFileSizeValidator as jest.MockedClass<
  typeof DetailedMaxFileSizeValidator
>;
const MockFileType = DetailedFileTypeValidator as jest.MockedClass<
  typeof DetailedFileTypeValidator
>;

describe('ImageUploadPipe', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('retorna una instancia de ParseFilePipe', () => {
    it('sin opciones', () => {
      expect(ImageUploadPipe()).toBeInstanceOf(ParseFilePipe);
    });

    it('con opciones parciales', () => {
      expect(ImageUploadPipe({ maxSizeMB: 2 })).toBeInstanceOf(ParseFilePipe);
    });
  });

  describe('defaults', () => {
    it('maxSizeMB default = 5 → maxSize = 5 * 1024 * 1024', () => {
      ImageUploadPipe();
      expect(MockMaxSize).toHaveBeenCalledWith({ maxSize: 5 * 1024 * 1024 });
    });

    it('fileType default incluye jpeg, png y webp', () => {
      ImageUploadPipe();
      expect(MockFileType).toHaveBeenCalledWith(
        expect.objectContaining({
          allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      );
    });

    it('allowedExtensions siempre son jpg, jpeg, png, webp', () => {
      ImageUploadPipe();
      expect(MockFileType).toHaveBeenCalledWith(
        expect.objectContaining({
          allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
        }),
      );
    });

    it('required default = true', () => {
      // ParseFilePipe expone fileIsRequired en sus opciones internas
      const pipe = ImageUploadPipe() as any;
      expect(pipe.fileIsRequired ?? pipe.options?.fileIsRequired).toBe(true);
    });
  });

  describe('opciones custom', () => {
    it('maxSizeMB custom se convierte correctamente a bytes', () => {
      ImageUploadPipe({ maxSizeMB: 10 });
      expect(MockMaxSize).toHaveBeenCalledWith({ maxSize: 10 * 1024 * 1024 });
    });

    it('maxSizeMB = 0 → maxSize = 0', () => {
      ImageUploadPipe({ maxSizeMB: 0 });
      expect(MockMaxSize).toHaveBeenCalledWith({ maxSize: 0 });
    });

    it('fileType custom array se pasa como allowedMimes', () => {
      ImageUploadPipe({ fileType: ['image/gif', 'image/bmp'] });
      expect(MockFileType).toHaveBeenCalledWith(
        expect.objectContaining({
          allowedMimes: ['image/gif', 'image/bmp'],
        }),
      );
    });

    it('required = false se respeta', () => {
      const pipe = ImageUploadPipe({ required: false }) as any;
      expect(pipe.fileIsRequired ?? pipe.options?.fileIsRequired).toBe(false);
    });
  });

  describe('fileType como string suelto (coerción a array)', () => {
    it('un string suelto se envuelve en array', () => {
      // El código hace: Array.isArray(fileType) ? fileType : [fileType]
      // Esto solo aplica si alguien bypasea el tipo en runtime
      ImageUploadPipe({ fileType: 'image/gif' as any });
      expect(MockFileType).toHaveBeenCalledWith(
        expect.objectContaining({
          allowedMimes: ['image/gif'],
        }),
      );
    });
  });

  describe('orden de validators', () => {
    it('MaxSize va antes que FileType', () => {
      ImageUploadPipe();
      // MaxSize se instancia primero en el array de validators
      const maxSizeOrder = MockMaxSize.mock.invocationCallOrder[0];
      const fileTypeOrder = MockFileType.mock.invocationCallOrder[0];
      expect(maxSizeOrder).toBeLessThan(fileTypeOrder);
    });
  });

  describe('instancias de validators', () => {
    it('siempre crea nuevas instancias de validators por llamada', () => {
      ImageUploadPipe();
      ImageUploadPipe();
      expect(MockMaxSize).toHaveBeenCalledTimes(2);
      expect(MockFileType).toHaveBeenCalledTimes(2);
    });
  });
});
