import { ProjectFeatureResponseDto } from '@/features/api/projects-features/dto/response/project-feature.response.dto';
import { ProjectImageResponseDto } from '@/features/api/projects-images/dto/response/project-image.response.dto';
import { ProjectTechnologieResponseDto } from '@/features/api/projects-technologies/dto/response/project-technologies.response.dto';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class ProjectResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Expose()
  title: string;

  @Expose()
  summary: string;

  @Expose()
  description: string;

  @Expose()
  publishedDate: Date | null;

  @Expose()
  slug: string;

  @Expose()
  isFeatured: boolean;

  @Expose()
  imageUrl: string;

  @Expose()
  imageFullUrl: string;

  @Expose()
  @Type(() => ProjectImageResponseDto)
  images: ProjectImageResponseDto[];

  @Expose()
  @Type(() => ProjectTechnologieResponseDto)
  technologies: ProjectTechnologieResponseDto[];

  @Expose()
  @Type(() => ProjectFeatureResponseDto)
  features: ProjectFeatureResponseDto[];

  @Exclude()
  imagePath: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date | null;
}
