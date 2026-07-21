import { IsArray, IsOptional, IsString, Max } from 'class-validator';
import { MAX_PAGE_NUMBER, MAX_PAGE_SIZE } from '../constants/querying';
import { IsCardinal } from '@/shared/decorators/validators/is-cardinal.decorator';
import { Transform, Type } from 'class-transformer';

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

export class PaginationProjectDto {
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

  @IsOptional()
  @IsString()
  @Type(() => String)
  readonly category?: string = '';

  @IsOptional()
  @IsString()
  @Type(() => String)
  readonly visibility?: string = '';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value : [value].filter(Boolean),
  )
  readonly technologies?: string[] = [];

  @IsOptional()
  @IsString()
  @Type(() => String)
  readonly sortBy?: string = '';
}

export class PaginationProjectHomeDto {
  @IsOptional()
  @IsString()
  @Type(() => String)
  readonly category: string = '';
}
