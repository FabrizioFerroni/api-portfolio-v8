import { Injectable } from '@nestjs/common';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Audit, AuditDocument } from '../schema/audit.schema';
import { AuditLogsCount } from '../interfaces/audit-count';

@Injectable()
export abstract class IAuditRepository extends MongoDBRepository<AuditDocument> {
  abstract getAllAudits(): Promise<AuditDocument[]>;
  abstract findAllAudits(
    skip: number,
    take: number,
    search?: string | null,
    action?: string | null,
    time?: string | null,
  ): Promise<[AuditDocument[], number]>;
  abstract findOneAuditById(id: string): Promise<AuditDocument | null>;
  abstract getAuditStats(): Promise<AuditLogsCount>;
  abstract getLastFiveAudits(): Promise<AuditDocument[]>;
  abstract createAudit(data: Audit): Promise<Audit>;
  abstract removeAudit(id: string): Promise<boolean>;
  abstract count(): Promise<number>;
  abstract countViews(): Promise<number>;
  abstract countViewsPortfolio(): Promise<number>;
  abstract countViewsPortfolioThisMonth(): Promise<number>;
  abstract countViewsPortfolioPreviousMonth(): Promise<number>;
}
