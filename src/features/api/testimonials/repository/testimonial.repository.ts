import { InjectModel } from '@nestjs/mongoose';
import { Testimonial, TestimonialDocument } from '../schema/testimonial.schema';
import { FilterQuery, Model, QueryOptions, Types } from 'mongoose';
import { ITestimonialRepository } from './testimonial.interface.repository';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TestimonialsError } from '../messages/testimonial.message';
import {
  TestimonialDocumentT,
  TestimonialPlain,
  TestimonialPlainT,
} from '../types/testimonial-with-project.type';
import { TestimonialCount } from '../interfaces/testimonial-count.interface';

@Injectable()
export class TestimonialRepository
  extends MongoDBRepository<TestimonialDocument>
  implements ITestimonialRepository
{
  constructor(
    @InjectModel(Testimonial.name)
    private readonly testimonialModel: Model<TestimonialDocument>,
  ) {
    super(testimonialModel);
  }

  async getAllTestimonialsHome(): Promise<TestimonialPlain[]> {
    const filter: FilterQuery<TestimonialDocument> = {};
    filter.visible = true;

    const allTestimonials: TestimonialDocument[] = await this.findAll(filter, {
      sort: {
        createdAt: -1,
      },
    });

    const plainTestimonials = allTestimonials.map((test) => test.toObject());

    return plainTestimonials;
  }

  async getAllTestimonials(
    take: number,
    skip: number,
    search?: string | null,
  ): Promise<[TestimonialPlain[], number]> {
    const options: QueryOptions = {};

    if (typeof skip === 'number') options.skip = skip;
    if (typeof take === 'number') options.limit = take;

    const filter: FilterQuery<TestimonialDocument> = {};

    if (search) {
      const regex = new RegExp(search, 'i');

      filter.$or = [
        { empresa: regex },
        { position: regex },
        { fullname: regex },
        { comment: regex },
      ];
    }

    const allTestimonials: TestimonialDocument[] = await this.findAll(filter, {
      ...options,
      sort: {
        createdAt: -1,
      },
    });

    const plainTestimonials = allTestimonials.map((test) => test.toObject());

    const total = await this.model.countDocuments(filter);

    return [plainTestimonials, total];
  }

  async getTestimonialById(id: string): Promise<TestimonialPlain | null> {
    const testimonial = await this.testimonialModel.findById(id);
    return testimonial ? testimonial.toJSON() : null;
  }

  async createTestimonial(data: Testimonial): Promise<TestimonialDocument> {
    const testimonial: Testimonial = plainToInstance(Testimonial, data);
    const testCreated: TestimonialDocument = await this.save(testimonial);

    if (!testCreated._id) {
      throw new InternalServerErrorException(
        TestimonialsError.INTERNAL_SERVER_ERROR,
      );
    }

    return testCreated;
  }

  async updateTestimonial(id: string, data: Testimonial): Promise<boolean> {
    const testimonial: Testimonial = plainToInstance(Testimonial, data);

    const query = {
      $set: testimonial,
    };

    const testUpdated = await this.update(id, query);

    if (!testUpdated.acknowledged) {
      return null;
    }

    if (testUpdated.modifiedCount !== 1) {
      throw new InternalServerErrorException(
        TestimonialsError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    const testDeleted: { deletedCount?: number } = await this.remove(id);

    if (testDeleted.deletedCount !== 1) {
      throw new InternalServerErrorException(
        TestimonialsError.INTERNAL_SERVER_ERROR,
      );
    }

    return true;
  }

  async testimonialAlredyExist(
    empresa: string,
    fullname: string,
    id?: Types.ObjectId,
  ): Promise<boolean> {
    if (!empresa && !fullname) return false;

    const query: FilterQuery<TestimonialDocument> = { empresa, fullname };

    if (id) {
      query._id = { $ne: new Types.ObjectId(id) };
    }

    const test = await this.model.findOne(query).lean();
    return !!test;
  }

  async getTestimonialsStats(): Promise<TestimonialCount> {
    const [total, active] = await Promise.all([
      this.model.countDocuments({}),
      this.model.countDocuments({ visible: true }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
    };
  }
}
