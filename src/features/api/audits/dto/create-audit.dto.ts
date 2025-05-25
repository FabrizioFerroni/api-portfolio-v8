import { IsIP, IsNotEmpty, IsString } from 'class-validator';

export class NewAuditDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsNotEmpty()
  details: string;

  module: string;

  ipAddress: string;
}
