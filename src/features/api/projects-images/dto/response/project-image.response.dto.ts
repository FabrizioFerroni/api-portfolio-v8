import { Exclude, Expose, Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class ProjectImageResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Expose()
  imageUrl: string;

  @Expose()
  imageFullUrl: string;

  @Exclude()
  imagePath: string;

  @Expose()
  displayOrder: number;

  @Expose()
  altText: string;

  @Exclude()
  projectId: Types.ObjectId;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
