import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'bson';
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class InsertOrUpdateProjectTecDto {
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
