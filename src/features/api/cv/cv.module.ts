import { CoreModule } from '@/core/core.module';
import { TransformDto } from '@/shared/utils';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CV, CVSchema } from './schema/cv.schema';
import { CVRepository } from './repository/cv.repository';
import { ICVRepository } from './repository/cv.interface.repository';
import { CVService } from './service/cv.service';
import { CVController } from './controller/cv.controller';
import { CvStorage } from './storage/cv.storage';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CV.name, schema: CVSchema }]),
    CoreModule,
  ],
  controllers: [CVController],
  providers: [
    TransformDto,
    CVRepository,
    {
      provide: ICVRepository,
      useClass: CVRepository,
    },
    CvStorage,
    CVService,
  ],
  exports: [CVService, CVRepository, ICVRepository],
})
export class CVModule {}
