import { InjectModel } from '@nestjs/mongoose';
import { Audit, AuditDocument } from '../schema/audit.schema';
import { Model } from 'mongoose';
import { IAuditRepository } from './audit.interface.repository';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuditError } from '../messages/audit.messages';

@Injectable()
export class AuditRepository
  extends MongoDBRepository<AuditDocument>
  implements IAuditRepository
{
  constructor(
    @InjectModel(Audit.name) private readonly auditModel: Model<AuditDocument>,
  ) {
    super(auditModel);
  }

  async getAllAudits(): Promise<AuditDocument[]> {
    const allAudits = await this.findAll();
    const plainAudits: AuditDocument[] = allAudits.map((audit: AuditDocument) =>
      audit.toObject(),
    );
    return plainAudits;
  }

  async findOneAuditById(id: string): Promise<AuditDocument | null> {
    const audit = await this.auditModel.findById(id);
    return audit ? audit.toJSON() : null;
  }

  async createAudit(data: Audit): Promise<Audit> {
    const audit = plainToInstance(Audit, data);
    const auditCreated = await this.save(audit);

    if (!auditCreated._id) {
      throw new InternalServerErrorException(AuditError.INTERNAL_SERVER_ERROR);
    }

    return audit;
  }

  async removeAudit(id: string): Promise<boolean> {
    const auditDeleted = await this.remove(id);

    if (auditDeleted.deletedCount !== 1) {
      throw new InternalServerErrorException(AuditError.INTERNAL_SERVER_ERROR);
    }

    return true;
  }
}
