import { Exclude, Expose, Transform } from 'class-transformer';

export class CVResponseAdminDto {
  @Expose({ name: 'id' })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Exclude()
  originalName: string;

  @Expose()
  downloadName: string;

  @Exclude()
  storedFileName: string;

  @Expose()
  mimeType: string;

  @Expose()
  sizeBytes: number;

  @Expose()
  downloadCount: number;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Exclude()
  updatedAt: Date | null;
}
