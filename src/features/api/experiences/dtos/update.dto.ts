import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateExperienceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Google' })
  company: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Backend Developer' })
  position: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2022-01-01' })
  startsDate: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ApiPropertyOptional({ example: '2023-06-30' })
  endsDate?: Date;

  @IsNotEmpty()
  @IsBoolean()
  @IsDefined()
  @ApiProperty({ example: false })
  currentPosition: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Worked on...' })
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiPropertyOptional({ example: 1 })
  displayOrder?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    type: [String],
    example: ['NestJS', 'MongoDB'],
  })
  skills?: string[];
}
