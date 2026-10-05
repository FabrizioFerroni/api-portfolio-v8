import { Injectable } from '@nestjs/common';
import { mkdirSync } from 'fs';
import { unlink, writeFile } from 'node:fs/promises';
import { extname, join } from 'path';

import { memoryStorage } from 'multer';
import { generateSlug } from '@/shared/utils/functions/generateSlug';
export const cvMemoryStorage = memoryStorage();

@Injectable()
export class CvStorage {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'cv');

  constructor() {
    mkdirSync(this.uploadDir, { recursive: true });
  }

  async saveFileToDisk(
    file: Express.Multer.File,
    name: string,
  ): Promise<string> {
    const extension = extname(file.originalname);
    const uid =
      Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const fileName = `${generateSlug(name)}-${uid}${extension}`;
    const fullPath = join(this.uploadDir, fileName);

    await writeFile(fullPath, file.buffer);
    return fileName;
  }

  async deletePhysicalFile(storedFileName: string): Promise<void> {
    const fullPath = this.getFilePath(storedFileName);
    try {
      await unlink(fullPath);
    } catch (err) {
      if (err instanceof Error && 'code' in err && err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  getFilePath(storedFileName: string): string {
    return join(this.uploadDir, storedFileName);
  }
}
