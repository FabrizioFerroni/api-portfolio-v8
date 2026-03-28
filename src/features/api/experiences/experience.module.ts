import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransformDto } from '@/shared/utils';
import {
  Experience,
  ExperienceSchema,
} from '@/features/api/experiences/schema/experiencie.schema';
import { ExperiencieRepository } from '@/features/api/experiences/repository/experiencie.repository';
import { IExperiencesRepository } from '@/features/api/experiences/repository/experiencie.interface.repository';
import { ExperienceService } from '@/features/api/experiences/service/experience.service';
import { ExperienceController } from '@/features/api/experiences/controller/eperience.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Experience.name, schema: ExperienceSchema },
    ]),
  ],
  controllers: [ExperienceController],
  providers: [
    ExperienceService,
    ExperiencieRepository,
    {
      provide: IExperiencesRepository,
      useClass: ExperiencieRepository,
    },
    TransformDto,
  ],
  exports: [ExperienceService, ExperiencieRepository, IExperiencesRepository],
})
export class ExperienceModule {}
