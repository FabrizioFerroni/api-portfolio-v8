import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateSession {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsIn(['true', 'false'])
  @IsNotEmpty()
  remembered: string;
}
