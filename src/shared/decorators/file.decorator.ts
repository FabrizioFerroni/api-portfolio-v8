import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export function File(localOptions?: MulterOptions) {
  return applyDecorators(
    UseInterceptors(FileInterceptor('file', localOptions)),
  );
}
