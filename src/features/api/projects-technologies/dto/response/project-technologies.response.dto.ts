import { Exclude, Expose, Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class ProjectTechnologieResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Expose()
  name: string;

  @Expose()
  category: string;

  @Exclude()
  projectId: Types.ObjectId;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
