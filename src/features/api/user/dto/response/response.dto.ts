import { Exclude, Expose, Transform } from 'class-transformer';

export class UserResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Expose()
  name: string;

  @Expose()
  lastname: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  avatar: string;

  @Exclude()
  imagePath: string;

  @Exclude()
  imageUrl: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  __v: number;
}
