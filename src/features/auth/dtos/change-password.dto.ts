import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { AuthMessagesError } from '../errors/error-messages';
import { PasswordVerify } from '@/features/api/user/validation/passwordverify.validation';
import { UserError } from '@/features/api/user/messages/general.messages';

export class ChangePasswordDto {
  @IsEmail({}, { message: AuthMessagesError.USER_EMAIL_VALID })
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message: UserError.USER_PASSWORD_NOT_STRONG,
    },
  )
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @PasswordVerify('password')
  confirm_password: string;
}
