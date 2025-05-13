import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { UserError } from '../messages/general.messages';
import { PasswordVerify } from '../validation/passwordverify.validation';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  email: string;

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
  password_verify: string;
}
