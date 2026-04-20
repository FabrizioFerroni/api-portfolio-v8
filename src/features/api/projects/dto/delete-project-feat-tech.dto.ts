import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class DeleteProjectTechFeat {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsInt()
  //TODO: Module 1 -> Feature, Module 2 -> Technologies
  @IsNotEmpty()
  @Min(1)
  @Max(2)
  module: number;
}
