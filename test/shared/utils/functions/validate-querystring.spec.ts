import { BadRequestException } from '@nestjs/common';
import { validateQuerystringDto } from '@/shared/utils/functions/validate-querystring';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class ExampleQueryDto {
  @IsString()
  name: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  age?: number;
}

describe('validateQuerystringDto', () => {
  it('should return a valid DTO instance when query is valid', async () => {
    const query = { name: 'Fabrii', age: '25' };

    const result = await validateQuerystringDto(ExampleQueryDto, query);

    expect(result).toBeInstanceOf(ExampleQueryDto);
    expect(result.name).toBe('Fabrii');
    expect(result.age).toBe(25);
  });

  it('should throw BadRequestException if required fields are missing', async () => {
    const query = { age: '25' }; // falta `name`

    await expect(
      validateQuerystringDto(ExampleQueryDto, query),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for invalid types', async () => {
    const query = { name: 'Fabrii', age: 'not-a-number' };

    await expect(
      validateQuerystringDto(ExampleQueryDto, query),
    ).rejects.toThrow(BadRequestException);
  });

  it('should strip unknown properties if whitelist is enabled', async () => {
    const query = { name: 'Fabrii', extra: 'unexpected' };

    const result = await validateQuerystringDto(ExampleQueryDto, query);

    expect(result).not.toHaveProperty('extra');
  });
});
