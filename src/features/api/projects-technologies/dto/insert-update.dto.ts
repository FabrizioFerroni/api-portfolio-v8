import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'bson';
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class InsertOrUpdateProjectTecDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  category: string;

  projectId: Types.ObjectId;
}
