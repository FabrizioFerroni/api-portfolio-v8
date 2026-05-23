import { IsOptional, IsString, Max } from 'class-validator';
import { MAX_PAGE_NUMBER, MAX_PAGE_SIZE } from '../constants/querying';
import { IsCardinal } from '@/shared/decorators/validators/is-cardinal.decorator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Max(MAX_PAGE_NUMBER)
  @IsCardinal()
  @Type(() => Number)
  readonly page?: number = 1;

  @IsOptional()
  @Max(MAX_PAGE_SIZE)
  @IsCardinal()
  @Type(() => Number)
  readonly limit?: number = 10;

  @IsOptional()
  @IsString()
  @Type(() => String)
  readonly search?: string = '';
}
