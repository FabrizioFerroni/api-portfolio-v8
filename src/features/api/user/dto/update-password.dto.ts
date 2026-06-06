import { ApiProperty } from '@nestjs/swagger';
import { UserError } from '../messages/general.messages';
import { IsNotEmpty, IsStrongPassword, ValidateIf } from 'class-validator';
import { PasswordVerify } from '../validation/passwordverify.validation';

export class UpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
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
  currentPassword: string;

  @ApiProperty()
  @ApiProperty()
  @IsNotEmpty()
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
  @ValidateIf((c) => c.currentPassword !== '')
  newPassword: string;

  @ApiProperty()
  @ValidateIf((c) => c.newPassword !== '')
  @PasswordVerify('newPassword')
  confirmPassword: string;
}
