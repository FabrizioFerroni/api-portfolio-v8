import { File } from '@/shared/decorators/file.decorator';
import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  applyDecorators: jest.fn(),
  UseInterceptors: jest.fn(),
}));

jest.mock('@nestjs/platform-express', () => ({
  FileInterceptor: jest.fn(),
}));

const mockApplyDecorators = applyDecorators as jest.MockedFunction<
  typeof applyDecorators
>;
const mockUseInterceptors = UseInterceptors as jest.MockedFunction<
  typeof UseInterceptors
>;
const mockFileInterceptor = FileInterceptor as jest.MockedFunction<
  typeof FileInterceptor
>;

describe('File decorator', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('FileInterceptor', () => {
    it('siempre usa el field name "file"', () => {
      File();
      expect(mockFileInterceptor).toHaveBeenCalledWith('file', undefined);
    });

    it('pasa localOptions a FileInterceptor cuando se proveen', () => {
      const options = { limits: { fileSize: 1024 } };
      File(options);
      expect(mockFileInterceptor).toHaveBeenCalledWith('file', options);
    });

    it('pasa undefined como options cuando no se proveen', () => {
      File();
      expect(mockFileInterceptor).toHaveBeenCalledWith('file', undefined);
    });
  });

  describe('composición de decorators', () => {
    it('llama a UseInterceptors con el resultado de FileInterceptor', () => {
      const fakeInterceptor = class {};
      mockFileInterceptor.mockReturnValue(fakeInterceptor as any);

      File();

      expect(mockUseInterceptors).toHaveBeenCalledWith(fakeInterceptor);
    });

    it('llama a applyDecorators con el resultado de UseInterceptors', () => {
      const fakeDecorator = jest.fn();
      mockUseInterceptors.mockReturnValue(fakeDecorator as any);

      File();

      expect(mockApplyDecorators).toHaveBeenCalledWith(fakeDecorator);
    });

    it('retorna el resultado de applyDecorators', () => {
      const expected = jest.fn();
      mockApplyDecorators.mockReturnValue(expected as any);

      const result = File();

      expect(result).toBe(expected);
    });
  });

  describe('opciones de multer', () => {
    it('acepta limits', () => {
      const options = { limits: { fileSize: 5 * 1024 * 1024, files: 1 } };
      File(options);
      expect(mockFileInterceptor).toHaveBeenCalledWith('file', options);
    });

    it('acepta fileFilter', () => {
      const fileFilter = jest.fn();
      File({ fileFilter });
      expect(mockFileInterceptor).toHaveBeenCalledWith('file', { fileFilter });
    });

    it('acepta dest (storage en disco)', () => {
      File({ dest: '/tmp/uploads' });
      expect(mockFileInterceptor).toHaveBeenCalledWith('file', {
        dest: '/tmp/uploads',
      });
    });

    it('crea un decorator nuevo por cada invocación', () => {
      const r1 = File();
      const r2 = File();
      expect(mockApplyDecorators).toHaveBeenCalledTimes(2);
    });
  });
});
