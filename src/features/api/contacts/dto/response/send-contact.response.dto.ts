import { formatDateTime } from '@/shared/utils/functions/format-date';
import { Exclude, Expose, Transform } from 'class-transformer';

export class SendContactResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  subject: string;

  @Expose()
  message: string;

  @Expose({ name: 'send_at' })
  @Transform(({ value }) => formatDateTime(value), { toPlainOnly: true })
  sendAt: Date;

  @Expose({ name: 'received_at' })
  @Transform(({ value }) => formatDateTime(value), { toPlainOnly: true })
  receivedAt: Date;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
