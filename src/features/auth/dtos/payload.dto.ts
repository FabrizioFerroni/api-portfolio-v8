import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AuthMessagesError } from '../errors/error-messages';

export class PayloadDto {
  @IsEmail({}, { message: AuthMessagesError.USER_EMAIL_VALID })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  id?: string;

  @IsNumber()
  @IsOptional()
  tokenVersion?: number;

  @IsOptional()
  @IsIn(['true', 'false'])
  rememberMe?: boolean;
}
