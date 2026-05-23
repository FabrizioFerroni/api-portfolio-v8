import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'bson';
import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

export class InsertOrUpdateProjectFeatDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({ type: Number })
  displayOrder: number;

  projectId: Types.ObjectId;
}
