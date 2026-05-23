import {
  formatDate,
  formatDateTime,
} from '@/shared/utils/functions/format-date';
import { Exclude, Expose, Transform } from 'class-transformer';

export class AuditResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Expose()
  action: string;

  @Expose()
  user: string;

  @Expose()
  details: string;

  @Expose()
  module: string;

  @Expose({ name: 'ip' })
  ipAddress: string;

  @Expose({ name: 'date' })
  @Transform(({ value }) => formatDateTime(value), { toPlainOnly: true })
  dateAudit: Date;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
