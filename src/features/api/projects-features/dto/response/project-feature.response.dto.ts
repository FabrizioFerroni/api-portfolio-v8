import { Exclude, Expose, Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class ProjectFeatureResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Expose()
  description: string;

  @Expose()
  displayOrder: number;

  @Exclude()
  projectId: Types.ObjectId;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
