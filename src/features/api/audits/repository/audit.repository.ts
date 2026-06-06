import { InjectModel } from '@nestjs/mongoose';
import { Audit, AuditDocument } from '../schema/audit.schema';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { IAuditRepository } from './audit.interface.repository';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuditError } from '../messages/audit.messages';
import { AuditLogsCount } from '../interfaces/audit-count';
import {
  getCurrentMonthRange,
  getPreviousMonthRange,
} from '@/shared/utils/functions/date.utils';

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

  async findAllAudits(
    skip: number,
    take: number,
    search?: string | null,
    action?: string | null,
    time?: string | null,
  ): Promise<[AuditDocument[], number]> {
    const options: QueryOptions = {};

    if (typeof skip === 'number') options.skip = skip;
    if (typeof take === 'number') options.limit = take;

    const filter: FilterQuery<AuditDocument> = {};

    if (search?.trim()) {
      if (search.includes('@')) {
        filter.user = { $regex: search.trim(), $options: 'i' };
      } else {
        filter.details = { $regex: search.trim(), $options: 'i' };
      }
    }

    if (action && action !== 'all') {
      filter.action = { $regex: action.trim(), $options: 'i' };
    }

    if (time && time !== 'all') {
      const nowDate = new Date();
      const clientNow = new Date(nowDate.getTime() - 3 * 60 * 60 * 1000);

      const todayUTC = new Date(
        Date.UTC(
          clientNow.getUTCFullYear(),
          clientNow.getUTCMonth(),
          clientNow.getUTCDate(),
        ),
      );

      switch (time) {
        case 'yesterday': {
          const yesterdayUTC = new Date(
            Date.UTC(
              clientNow.getUTCFullYear(),
              clientNow.getUTCMonth(),
              clientNow.getUTCDate() - 1,
            ),
          );
          filter.dateAudit = { $gte: yesterdayUTC, $lt: todayUTC };
          break;
        }
        case 'today': {
          filter.dateAudit = { $gte: todayUTC };
          break;
        }
        case 'last7days': {
          const from7 = new Date(
            Date.UTC(
              clientNow.getUTCFullYear(),
              clientNow.getUTCMonth(),
              clientNow.getUTCDate() - 6,
            ),
          );
          filter.dateAudit = { $gte: from7 };
          break;
        }
        case 'last30days': {
          const from30 = new Date(
            Date.UTC(
              clientNow.getUTCFullYear(),
              clientNow.getUTCMonth(),
              clientNow.getUTCDate() - 29,
            ),
          );
          filter.dateAudit = { $gte: from30 };
          break;
        }
      }
    }

    const allAudits: AuditDocument[] = await this.findAll(filter, options);
    const plainAudits: any[] = allAudits.map((audit: AuditDocument) =>
      audit.toObject(),
    );

    const total: number = await this.model.countDocuments(filter);

    console.log('Filter aplicado:', JSON.stringify(filter, null, 2));
    return [plainAudits, total];
  }

  async count(): Promise<number> {
    return this.auditModel.countDocuments().exec();
  }

  async countViews(): Promise<number> {
    return this.auditModel.countDocuments().exec();
  }

  async countViewsPortfolio(): Promise<number> {
    return this.auditModel.countDocuments({ isPortfolio: true }).exec();
  }

  async getAllAudits(): Promise<AuditDocument[]> {
    const allAudits = await this.findAll();
    const plainAudits: AuditDocument[] = allAudits.map((audit: AuditDocument) =>
      audit.toObject(),
    );
    return plainAudits;
  }

  async getLastFiveAudits(): Promise<AuditDocument[]> {
    return this.auditModel
      .find()
      .sort({ createdAt: -1 })
      .limit(8)
      .lean<AuditDocument[]>()
      .exec();
  }

  async getAuditStats(): Promise<AuditLogsCount> {
    const [login, created, updated, deleted] = await Promise.all([
      this.model.countDocuments({ action: { $regex: 'login', $options: 'i' } }),
      this.model.countDocuments({
        action: { $regex: 'create', $options: 'i' },
      }),
      this.model.countDocuments({
        action: { $regex: 'update', $options: 'i' },
      }),
      this.model.countDocuments({
        action: { $regex: 'delete', $options: 'i' },
      }),
    ]);

    return { login, created, updated, deleted };
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

  async countViewsPortfolioThisMonth(): Promise<number> {
    const { start, end } = getCurrentMonthRange();
    return this.auditModel
      .countDocuments({
        isPortfolio: true,
        createdAt: { $gte: start, $lt: end },
      })
      .exec();
  }

  async countViewsPortfolioPreviousMonth(): Promise<number> {
    const { start, end } = getPreviousMonthRange();
    return this.auditModel
      .countDocuments({
        isPortfolio: true,
        createdAt: { $gte: start, $lt: end },
      })
      .exec();
  }
}
