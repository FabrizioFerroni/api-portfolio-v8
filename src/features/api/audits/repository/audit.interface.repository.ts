import { Injectable } from '@nestjs/common';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Audit, AuditDocument } from '../schema/audit.schema';

@Injectable()
export abstract class IAuditRepository extends MongoDBRepository<AuditDocument> {
  abstract getAllAudits(): Promise<AuditDocument[]>;
  abstract findOneAuditById(id: string): Promise<AuditDocument | null>;
  abstract createAudit(data: Audit): Promise<Audit>;
  abstract removeAudit(id: string): Promise<boolean>;
}
