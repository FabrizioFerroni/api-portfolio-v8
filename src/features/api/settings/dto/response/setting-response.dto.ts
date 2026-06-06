import {
  Exclude,
  Expose,
  Transform,
  TransformFnParams,
} from 'class-transformer';

export class SettingResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ value }: TransformFnParams) => value.toString(), {
    toPlainOnly: true,
  })
  _id: string;

  @Expose()
  frontUrl: string;

  @Expose()
  maintenanceMode: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
