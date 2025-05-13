import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { UserError } from '../messages/general.messages';
import { PasswordVerify } from '../validation/passwordverify.validation';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(3)
  lastname: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty()
  email: string;

  @ApiProperty()
  @IsOptional()
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

  @IsOptional()
  active: boolean;

  @ApiProperty()
  @ValidateIf((c) => c.password !== '')
  @PasswordVerify('password')
  password_verify: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(3)
  avatar: string;
}
