import {
  Exclude,
  Expose,
  Transform,
  TransformFnParams,
} from 'class-transformer';

export class ExperienceResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ value }: TransformFnParams) => value.toString(), {
    toPlainOnly: true,
  })
  _id: string;

  @Expose()
  company: string;

  @Expose()
  position: string;

  @Expose()
  startsDate: Date;

  @Expose()
  endsDate: Date;

  @Expose()
  currentPosition: boolean;

  @Expose()
  description: string;

  @Expose()
  displayOrder: number;

  @Expose()
  skills: string[];

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
