import { Injectable } from '@nestjs/common';
import sharp = require('sharp');
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { VariantConfig } from '../interfaces/variant.interface';

@Injectable()
export class ImageProcessingService {
  private readonly variants: VariantConfig[] = [
    { name: 'thumbnail', width: 800, height: 450 },
    { name: 'medium', width: 1600, height: 900 },
  ];

  async generateAndSaveVariants(
    inputBuffer: Buffer,
    folder: string,
    baseFilename: string,
  ): Promise<Record<string, { path: string; filename: string }>> {
    const results: Record<string, { path: string; filename: string }> = {};

    await Promise.all(
      this.variants.map(async (variant) => {
        const buffer = await sharp(inputBuffer)
          .rotate()
          .resize(variant.width, variant.height, {
            fit: 'cover',
            position: sharp.strategy.attention,
          })
          .toFormat('webp', { quality: 80 })
          .toBuffer();

        const variantFolder = join(folder, variant.name);

        await mkdir(variantFolder, { recursive: true });

        const filename = `${baseFilename}.webp`;
        const filePath = join(variantFolder, filename);
        await writeFile(filePath, buffer);

        results[variant.name] = { path: filePath, filename };
      }),
    );

    return results;
  }
}
