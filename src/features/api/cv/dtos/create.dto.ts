import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CVCUpDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'CV Mi Nombre' })
  name: string;
}
