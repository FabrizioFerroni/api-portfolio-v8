import { Document, FlattenMaps, Types } from 'mongoose';
import { ProjectWithRelations } from '../../projects/interfaces/project-with-relations.interface';
import { ProjectTestimonialSummaryDto } from '../dto/response/project-testimonial.dto';
import { Testimonial } from '../schema/testimonial.schema';

export type TestimonialWithProject = Omit<Testimonial, 'projectId'> & {
  _id: Types.ObjectId;
  project: ProjectTestimonialSummaryDto | ProjectWithRelations | null;
};

export type TestimonialPlain = FlattenMaps<Testimonial> & {
  _id: Types.ObjectId;
};

export type TestimonialPlainT = Testimonial & { _id: Types.ObjectId };

export type TestimonialDocumentT = Testimonial & Document<Types.ObjectId>;
