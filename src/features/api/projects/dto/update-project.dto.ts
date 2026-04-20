import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { InsertOrUpdateProjectFeatDto } from '../../projects-features/dto/insert-update.dto';
import { InsertOrUpdateProjectTecDto } from '../../projects-technologies/dto/insert-update.dto';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { DeleteProjectTechFeat } from './delete-project-feat-tech.dto';

export class UpdateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  summary: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  publishedDate: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  isFeatured?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return [];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(InsertOrUpdateProjectFeatDto, parsed, {
          enableImplicitConversion: true,
        });
      } catch {
        return [];
      }
    }
    if (Array.isArray(value)) {
      return plainToInstance(InsertOrUpdateProjectFeatDto, value, {
        enableImplicitConversion: true,
      });
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsertOrUpdateProjectFeatDto)
  projectFeatures: InsertOrUpdateProjectFeatDto[];

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return [];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(InsertOrUpdateProjectTecDto, parsed, {
          enableImplicitConversion: true,
        });
      } catch {
        return [];
      }
    }
    if (Array.isArray(value)) {
      return plainToInstance(InsertOrUpdateProjectTecDto, value, {
        enableImplicitConversion: true,
      });
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsertOrUpdateProjectTecDto)
  projectTechnologies: InsertOrUpdateProjectTecDto[];

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return [];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(DeleteProjectTechFeat, parsed, {
          enableImplicitConversion: true,
        });
      } catch {
        return [];
      }
    }
    if (Array.isArray(value)) {
      return plainToInstance(DeleteProjectTechFeat, value, {
        enableImplicitConversion: true,
      });
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeleteProjectTechFeat)
  deleteDataFT: DeleteProjectTechFeat[];
}
