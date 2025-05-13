import { Exclude, Expose, Transform } from 'class-transformer';

export class AuthResponseDto {
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
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  active: boolean;

  @Expose()
  access_token: string;

  @Expose()
  refresh_token: string;
}
