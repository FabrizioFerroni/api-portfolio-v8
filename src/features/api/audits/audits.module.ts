import { Module } from '@nestjs/common';
import { AuditService } from './service/audit.service';
import { Audit, AuditSchema } from './schema/audit.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditRepository } from './repository/audit.repository';
import { IAuditRepository } from './repository/audit.interface.repository';
import { TransformDto } from '@/shared/utils';
import { AuditsController } from './controller/audits.controller';
import { CoreModule } from '@/core/core.module';

@Module({
  imports: [
    CoreModule,
    MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }]),
  ],
  controllers: [AuditsController],
  providers: [
    AuditService,
    AuditRepository,
    {
      provide: IAuditRepository,
      useClass: AuditRepository,
    },
    TransformDto,
  ],
  exports: [AuditService, AuditRepository, IAuditRepository],
})
export class AuditsModule {}
