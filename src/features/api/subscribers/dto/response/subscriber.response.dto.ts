import { formatDateTime } from '@/shared/utils/functions/format-date';
import { Exclude, Expose, Transform } from 'class-transformer';

export class SubscriberResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose({ name: 'subscribed_at' })
  @Transform(({ value }) => formatDateTime(value), { toPlainOnly: true })
  subscribedAt: Date;

  @Expose()
  source: string;
  @Expose()
  status: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
