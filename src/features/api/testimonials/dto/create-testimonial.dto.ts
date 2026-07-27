import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example:
      'Trabajar con Fabrizio fue una experiencia excepcional. Su capacidad para entender nuestras necesidades y convertirlas en soluciones tecnológicas superó todas nuestras expectativas. El proyecto se entregó a tiempo y con una calidad sobresaliente.',
  })
  comment: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Ana Martínez',
  })
  fullname: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'CEO',
  })
  position: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'TechSolutions',
  })
  empresa: string;

  @IsIn(['true', 'false'])
  @IsNotEmpty()
  @ApiProperty({ example: 'false' })
  visible: string;

  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  projectId: string;
}
