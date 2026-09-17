import { Injectable } from '@nestjs/common';
import sharp = require('sharp');
import { writeFileSync } from 'fs';
import { join } from 'path';
import { VariantConfig } from '../interfaces/variant.interface';

@Injectable()
export class ImageProcessingService {
  private readonly variants: VariantConfig[] = [
    { name: 'thumbnail', width: 200, height: 200, fit: 'cover' },
    { name: 'medium', width: 800, height: 600, fit: 'inside' },
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
          .resize(variant.width, variant.height, {
            fit: variant.fit,
            withoutEnlargement: true,
          })
          .toFormat('webp', { quality: 80 })
          .toBuffer();

        const filename = `${baseFilename}-${variant.name}.webp`;
        const filePath = join(folder, filename);
        writeFileSync(filePath, buffer);

        results[variant.name] = { path: filePath, filename };
      }),
    );

    return results;
  }
}
