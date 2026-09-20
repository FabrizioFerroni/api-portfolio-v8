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
  isPublished: boolean;

  @Expose()
  slug: string;

  @Expose()
  category: string;

  @Expose()
  visibility: string;

  @Expose()
  type: string;

  @Expose()
  @Transform(({ value }) =>
    value
      ? Object.fromEntries(
          Object.entries(value as Record<string, { url: string }>).map(
            ([variant, { url }]) => [variant, { url }],
          ),
        )
      : value,
  )
  imageVariants: Record<string, { url: string; path: string }>;

  @Expose()
  urlGithub: string;

  @Expose()
  urlProyect: string;

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

export class ProjectResponseHomeDto {
  @Expose({ name: 'id' })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Expose()
  title: string;

  @Expose()
  summary: string;

  @Exclude()
  description: string;

  @Exclude()
  publishedDate: Date | null;

  @Exclude()
  isPublished: boolean;

  @Expose()
  slug: string;

  @Expose()
  category: string;

  @Expose()
  visibility: string;

  @Expose()
  type: string;

  @Expose()
  @Transform(({ value }) =>
    value
      ? Object.fromEntries(
          Object.entries(value as Record<string, { url: string }>).map(
            ([variant, { url }]) => [variant, { url }],
          ),
        )
      : value,
  )
  imageVariants: Record<string, { url: string; path: string }>;

  @Expose()
  urlGithub: string;

  @Expose()
  urlProyect: string;

  @Exclude()
  @Type(() => ProjectImageResponseDto)
  images: ProjectImageResponseDto[];

  @Expose()
  @Type(() => ProjectTechnologieResponseDto)
  technologies: ProjectTechnologieResponseDto[];

  @Exclude()
  @Type(() => ProjectFeatureResponseDto)
  features: ProjectFeatureResponseDto[];

  @Exclude()
  imagePath: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date | null;
}

export class ProjectResponseRelatedDto {
  @Expose({ name: 'id' })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Expose()
  title: string;

  @Expose()
  summary: string;

  @Exclude()
  description: string;

  @Exclude()
  publishedDate: Date | null;

  @Exclude()
  isPublished: boolean;

  @Expose()
  slug: string;

  @Expose()
  category: string;

  @Expose()
  visibility: string;

  @Exclude()
  type: string;

  @Expose()
  @Transform(({ value }) =>
    value
      ? Object.fromEntries(
          Object.entries(value as Record<string, { url: string }>).map(
            ([variant, { url }]) => [variant, { url }],
          ),
        )
      : value,
  )
  imageVariants: Record<string, { url: string; path: string }>;

  @Exclude()
  urlGithub: string;

  @Exclude()
  urlProyect: string;

  @Exclude()
  @Type(() => ProjectImageResponseDto)
  images: ProjectImageResponseDto[];

  @Exclude()
  @Type(() => ProjectTechnologieResponseDto)
  technologies: ProjectTechnologieResponseDto[];

  @Exclude()
  @Type(() => ProjectFeatureResponseDto)
  features: ProjectFeatureResponseDto[];

  @Exclude()
  imagePath: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date | null;
}

export class ProjectResponseSelectDto {
  @Expose({ name: 'id' })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Expose()
  title: string;

  @Expose()
  category: string;

  @Exclude()
  summary: string;

  @Exclude()
  description: string;

  @Exclude()
  publishedDate: Date | null;

  @Exclude()
  isPublished: boolean;

  @Exclude()
  slug: string;

  @Exclude()
  visibility: string;

  @Exclude()
  type: string;

  @Exclude()
  @Transform(({ value }) =>
    value
      ? Object.fromEntries(
          Object.entries(value as Record<string, { url: string }>).map(
            ([variant, { url }]) => [variant, { url }],
          ),
        )
      : value,
  )
  imageVariants: Record<string, { url: string; path: string }>;

  @Exclude()
  urlGithub: string;

  @Exclude()
  urlProyect: string;

  @Exclude()
  @Type(() => ProjectImageResponseDto)
  images: ProjectImageResponseDto[];

  @Exclude()
  @Type(() => ProjectTechnologieResponseDto)
  technologies: ProjectTechnologieResponseDto[];

  @Exclude()
  @Type(() => ProjectFeatureResponseDto)
  features: ProjectFeatureResponseDto[];

  @Exclude()
  imagePath: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date | null;
}
