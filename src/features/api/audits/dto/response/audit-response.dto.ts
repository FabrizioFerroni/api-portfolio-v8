import { Exclude, Expose, Transform } from 'class-transformer';

export class AuditResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Expose()
  action: string;

  @Expose()
  details: string;

  @Expose()
  module: string;

  @Expose({ name: 'ip' })
  ipAddress: string;

  @Expose({ name: 'date' })
  @Transform(
    ({ value }) => {
      if (!(value instanceof Date)) value = new Date(value);
      const day = String(value.getDate()).padStart(2, '0');
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const year = value.getFullYear();
      return `${day}/${month}/${year}`;
    },
    { toPlainOnly: true },
  )
  dateAudit: Date;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
