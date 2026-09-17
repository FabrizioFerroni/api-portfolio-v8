import type { FitEnum } from 'sharp';
export interface VariantConfig {
  name: string;
  width: number;
  height: number;
  fit: keyof FitEnum;
}
