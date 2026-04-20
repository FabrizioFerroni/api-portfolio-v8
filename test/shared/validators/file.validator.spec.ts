import {
  DetailedFileTypeValidator,
  DetailedMaxFileSizeValidator,
} from '@/shared/validators/file.validator';
import { fromBuffer } from 'file-type';
import { readFile } from 'fs/promises';

jest.mock('file-type');
jest.mock('fs/promises');

const mockFromBuffer = fromBuffer as jest.MockedFunction<typeof fromBuffer>;
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function makeFile(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'test.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from('fake'),
    stream: null,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  } as Express.Multer.File;
}

function makeValidator(
  allowedMimes: string[],
  allowedExtensions: string[] = [],
): DetailedFileTypeValidator {
  return new DetailedFileTypeValidator({ allowedMimes, allowedExtensions });
}

describe('DetailedFileTypeValidator', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('isValid', () => {
    describe('cuando el archivo tiene buffer en memoria', () => {
      it('usa el buffer directo sin llamar a readFile', async () => {
        const file = makeFile({ buffer: Buffer.from('data') });
        mockFromBuffer.mockResolvedValue({ mime: 'image/png', ext: 'png' });

        await makeValidator(['image/png'], ['png']).isValid(file);

        expect(mockReadFile).not.toHaveBeenCalled();
        expect(mockFromBuffer).toHaveBeenCalledWith(file.buffer);
      });

      it('retorna true si mime y extensión son válidos', async () => {
        mockFromBuffer.mockResolvedValue({ mime: 'image/png', ext: 'png' });
        const result = await makeValidator(['image/png'], ['png']).isValid(
          makeFile({ originalname: 'photo.png' }),
        );
        expect(result).toBe(true);
      });

      it('retorna false si el mime no está permitido', async () => {
        mockFromBuffer.mockResolvedValue({ mime: 'image/gif', ext: 'gif' });
        const result = await makeValidator(['image/png'], ['png']).isValid(
          makeFile({ originalname: 'photo.gif' }),
        );
        expect(result).toBe(false);
      });

      it('retorna false si la extensión no está permitida aunque el mime sí', async () => {
        mockFromBuffer.mockResolvedValue({ mime: 'image/png', ext: 'png' });
        const result = await makeValidator(['image/png'], ['jpg']).isValid(
          makeFile({ originalname: 'photo.png' }),
        );
        expect(result).toBe(false);
      });

      it('retorna false si fromBuffer no puede detectar el tipo', async () => {
        mockFromBuffer.mockResolvedValue(undefined);
        const result = await makeValidator(['image/png'], ['png']).isValid(
          makeFile(),
        );
        expect(result).toBe(false);
      });
    });

    describe('cuando el archivo está en disco (sin buffer)', () => {
      it('lee el archivo desde file.path', async () => {
        const file = makeFile({ buffer: undefined, path: '/tmp/upload/abc' });
        const diskBuffer = Buffer.from('disk-data');
        mockReadFile.mockResolvedValue(diskBuffer);
        mockFromBuffer.mockResolvedValue({ mime: 'image/jpeg', ext: 'jpg' });

        await makeValidator(['image/jpeg'], ['jpg']).isValid({
          ...file,
          originalname: 'photo.jpg',
        } as Express.Multer.File);

        expect(mockReadFile).toHaveBeenCalledWith('/tmp/upload/abc', null);
        expect(mockFromBuffer).toHaveBeenCalledWith(diskBuffer);
      });

      it('retorna false si readFile no devuelve buffer', async () => {
        const file = makeFile({ buffer: undefined, path: '/tmp/bad' });
        mockReadFile.mockResolvedValue(null as any);

        const result = await makeValidator(['image/png']).isValid(file);
        expect(result).toBe(false);
      });
    });

    describe('extensiones', () => {
      it('normaliza la extensión a lowercase antes de comparar', async () => {
        mockFromBuffer.mockResolvedValue({ mime: 'image/png', ext: 'png' });
        const result = await makeValidator(['image/png'], ['png']).isValid(
          makeFile({ originalname: 'PHOTO.PNG' }),
        );
        expect(result).toBe(true);
      });

      it('toma solo la última parte del nombre (multiple dots)', async () => {
        mockFromBuffer.mockResolvedValue({ mime: 'image/png', ext: 'png' });
        const result = await makeValidator(['image/png'], ['png']).isValid(
          makeFile({ originalname: 'my.photo.backup.png' }),
        );
        expect(result).toBe(true);
      });

      it('allowedExtensions vacío → extOk siempre false (array vacío es truthy)', async () => {
        mockFromBuffer.mockResolvedValue({ mime: 'image/png', ext: 'png' });
        const result = await makeValidator(['image/png'], []).isValid(
          makeFile({ originalname: 'photo.xyz' }),
        );
        expect(result).toBe(false);
      });

      it('archivo sin extensión → extOk false', async () => {
        mockFromBuffer.mockResolvedValue({ mime: 'image/png', ext: 'png' });
        const result = await makeValidator(['image/png'], ['png']).isValid(
          makeFile({ originalname: 'photosinextension' }),
        );
        expect(result).toBe(false);
      });
    });
  });

  describe('buildErrorMessage', () => {
    it('incluye el mimetype del archivo en el mensaje', () => {
      const file = makeFile({ mimetype: 'application/pdf' });
      const msg = makeValidator(['image/png']).buildErrorMessage(file);
      expect(msg).toContain('application/pdf');
    });
  });
});

describe('DetailedMaxFileSizeValidator', () => {
  function makeMaxValidator(maxSize: number): DetailedMaxFileSizeValidator {
    return new DetailedMaxFileSizeValidator({ maxSize });
  }

  describe('buildErrorMessage', () => {
    it('incluye el nombre original del archivo en el mensaje', () => {
      const file = makeFile({ originalname: 'document.pdf' });
      const msg = makeMaxValidator(1024).buildErrorMessage(file);
      expect(msg).toContain('document.pdf');
    });

    it('el mensaje es distinto al de MaxFileSizeValidator base', () => {
      const file = makeFile({ originalname: 'video.mp4' });
      const msg = makeMaxValidator(500).buildErrorMessage(file);
      // Verifica que tiene el formato propio, no el genérico de Nest
      expect(msg).toMatch(/demasiado grande/i);
    });
  });

  describe('isValid (heredado de MaxFileSizeValidator)', () => {
    it('retorna true si el archivo está dentro del límite', async () => {
      const file = makeFile({ size: 500 });
      const validator = makeMaxValidator(1024);
      expect(await validator.isValid(file)).toBe(true);
    });

    it('retorna false si el archivo supera el límite', async () => {
      const file = makeFile({ size: 2048 });
      const validator = makeMaxValidator(1024);
      expect(await validator.isValid(file)).toBe(false);
    });

    it('retorna false en el límite exacto (Nest usa size > maxSize estricto)', async () => {
      const file = makeFile({ size: 1024 });
      const validator = makeMaxValidator(1024);
      expect(await validator.isValid(file)).toBe(false);
    });

    it('retorna true con un byte menos del límite', async () => {
      const file = makeFile({ size: 1023 });
      const validator = makeMaxValidator(1024);
      expect(await validator.isValid(file)).toBe(true);
    });
  });
});
