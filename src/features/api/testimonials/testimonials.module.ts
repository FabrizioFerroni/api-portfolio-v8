import { TransformDto } from '@/shared/utils';
import { TestimonialService } from './service/testimonial.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { TestimonialController } from './controller/testimonial.controller';
import { Testimonial, TestimonialSchema } from './schema/testimonial.schema';
import { ITestimonialRepository } from './repository/testimonial.interface.repository';
import { TestimonialRepository } from './repository/testimonial.repository';
import { ProjectModule } from '../projects/projects.module';
import { MulterModule } from '@nestjs/platform-express';
import { testimonialStorage } from './storage/testimonial.storage';
import { CoreModule } from '@/core/core.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Testimonial.name, schema: TestimonialSchema },
    ]),
    ProjectModule,
    CoreModule,
    MulterModule.register({
      storage: testimonialStorage,
    }),
  ],
  controllers: [TestimonialController],
  providers: [
    TestimonialService,
    TestimonialRepository,
    {
      provide: ITestimonialRepository,
      useClass: TestimonialRepository,
    },
    TransformDto,
  ],
  exports: [TestimonialService, TestimonialRepository, ITestimonialRepository],
})
export class TestimonialModule {}
