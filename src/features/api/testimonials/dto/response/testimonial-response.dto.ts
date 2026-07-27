import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ProjectTestimonialSummaryDto } from './project-testimonial.dto';

export class TestimonialResponseDto {
  @Expose({ name: 'id' })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Expose()
  imageUrl: string;

  @Expose()
  imageFullUrl: string;

  @Exclude()
  imagePath: string;

  @Expose()
  comment: string;

  @Expose()
  fullname: string;

  @Expose()
  position: string;

  @Expose()
  empresa: string;

  @Expose()
  visible: boolean;

  @Exclude()
  projectId: string;

  @Expose()
  @Type(() => ProjectTestimonialSummaryDto)
  project: ProjectTestimonialSummaryDto;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date | null;
}
