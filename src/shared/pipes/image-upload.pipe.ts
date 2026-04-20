import { ParseFilePipe } from '@nestjs/common';
import {
  DetailedFileTypeValidator,
  DetailedMaxFileSizeValidator,
} from '../validators/file.validator';

interface UploadFilePipeOptions {
  maxSizeMB?: number;
  fileType?: string[];
  required?: boolean;
}

export const ImageUploadPipe = ({
  maxSizeMB = 5,
  fileType = ['image/jpeg', 'image/png', 'image/webp'],
  required = true,
}: UploadFilePipeOptions = {}) =>
  new ParseFilePipe({
    fileIsRequired: required,
    validators: [
      new DetailedMaxFileSizeValidator({ maxSize: maxSizeMB * 1024 * 1024 }),
      new DetailedFileTypeValidator({
        allowedMimes: Array.isArray(fileType) ? fileType : [fileType],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      }),
    ],
  });
