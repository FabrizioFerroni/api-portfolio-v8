import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Testimonial, TestimonialDocument } from '../schema/testimonial.schema';
import { Injectable } from '@nestjs/common';
import {
  TestimonialDocumentT,
  TestimonialPlain,
  TestimonialPlainT,
} from '../types/testimonial-with-project.type';
import { Types } from 'mongoose';
import { TestimonialCount } from '../interfaces/testimonial-count.interface';

@Injectable()
export abstract class ITestimonialRepository extends MongoDBRepository<TestimonialDocument> {
  abstract getAllTestimonialsHome(): Promise<TestimonialPlain[]>;
  abstract getAllTestimonials(
    take: number,
    skip: number,
    search?: string | null,
  ): Promise<[TestimonialPlain[], number]>;
  abstract getTestimonialById(id: string): Promise<TestimonialPlain | null>;
  abstract createTestimonial(data: Testimonial): Promise<TestimonialDocument>;
  abstract updateTestimonial(id: string, data: Testimonial): Promise<boolean>;
  abstract deleteTestimonial(id: string): Promise<boolean>;
  abstract testimonialAlredyExist(
    empresa: string,
    fullname: string,
    id?: Types.ObjectId,
  ): Promise<boolean>;
  abstract getTestimonialsStats(): Promise<TestimonialCount>;
}
