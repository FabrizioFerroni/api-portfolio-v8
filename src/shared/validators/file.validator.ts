import { FileValidator, MaxFileSizeValidator } from '@nestjs/common';
import { fromBuffer } from 'file-type';
import { readFile } from 'fs/promises';

interface DetailedFileTypeValidatorOptions {
  allowedMimes: string[];
  allowedExtensions: string[];
}
export class DetailedFileTypeValidator extends FileValidator<DetailedFileTypeValidatorOptions> {
  async isValid(file: Express.Multer.File): Promise<boolean> {
    const buffer = file.buffer ?? (await readFile(file.path, null));

    if (!buffer) return false;

    const result = await fromBuffer(buffer);
    if (!result) return false;

    const mimeOk: boolean = this.validationOptions.allowedMimes.includes(
      result.mime,
    );

    if (this.validationOptions.allowedExtensions) {
      const ext: string = file.originalname.split('.').pop()?.toLowerCase();
      const extOk: boolean = this.validationOptions.allowedExtensions.includes(
        ext ?? '',
      );
      return mimeOk && extOk;
    }

    return mimeOk;
  }

  buildErrorMessage(file: Express.Multer.File): string {
    return `Tipo no permitido: ${file.mimetype}`;
  }
}

export class DetailedMaxFileSizeValidator extends MaxFileSizeValidator {
  buildErrorMessage(file: Express.Multer.File): string {
    return `Archivo demasiado grande: ${file.originalname}`;
  }
}
