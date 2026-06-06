import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import { Type } from 'class-transformer';

export class PaginationAuditDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @Type(() => String)
  readonly actions?: string = 'all';

  @IsOptional()
  @IsString()
  @Type(() => String)
  readonly time?: string = 'all';
}
