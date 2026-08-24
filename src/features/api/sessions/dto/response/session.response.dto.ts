import {
  Exclude,
  Expose,
  plainToInstance,
  Transform,
  Type,
} from 'class-transformer';
import { DeviceType } from '../../enum/device.enum';

export class UserResponseSessionDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString(), { toClassOnly: true })
  id: string;

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

export class SessionResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString(), { toClassOnly: true })
  id: string;

  @Expose()
  ip: string;

  @Expose()
  city: string;

  @Expose()
  country: string;

  @Expose()
  deviceName: string;

  @Expose()
  deviceType: DeviceType;

  @Expose()
  browser: string;

  @Expose()
  os: string;

  @Expose()
  remembered: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  lastUsedAt: Date;

  @Expose()
  expiresAt: Date;

  @Expose()
  @Type(() => UserResponseSessionDto)
  @Transform(
    ({ obj }) =>
      obj.userId &&
      plainToInstance(UserResponseSessionDto, obj.userId, {
        excludeExtraneousValues: true,
      }),
    { toClassOnly: true },
  )
  user: UserResponseSessionDto;
}
