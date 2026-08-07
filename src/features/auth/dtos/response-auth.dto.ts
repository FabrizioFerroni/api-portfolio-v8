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

  @Expose()
  tokenVersion: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  active: boolean;

  @Expose()
  access_token: string;

  @Exclude()
  refresh_token: string;
}
