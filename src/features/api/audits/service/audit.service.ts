import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IAuditRepository } from '../repository/audit.interface.repository';
import { TransformDto } from '@/shared/utils';
import { Audit, AuditDocument } from '../schema/audit.schema';
import { AuditResponseDto } from '../dto/response/audit-response.dto';
import { AuditError, AuditOk } from '../messages/audit.messages';
import { NewAuditDto } from '../dto/create-audit.dto';
import { PaginationAuditDto } from '@/shared/utils/dtos/pagination-audit.dto';
import { DefaultPageSize } from '@/shared/utils/constants/querying';
import { PaginationService } from '@/core/services/pagination.service';
import { PaginationMeta } from '@/core/interfaces/pagination-meta.interface';
import { UserDocument } from '../../user/schema/user.schema';
import { AuditLogsCount } from '../interfaces/audit-count';
import { configApp } from '@/config/app/config.app';

@Injectable()
export class AuditService {
  constructor(
    private readonly auditRepo: IAuditRepository,
    @Inject(TransformDto)
    private readonly transform: TransformDto<AuditDocument, AuditResponseDto>,
    private readonly paginationService: PaginationService,
  ) {}

  transformArray(data: AuditDocument[]) {
    return this.transform.transformDtoArray(data, AuditResponseDto);
  }

  transformObject(data: AuditDocument) {
    return this.transform.transformDtoObject(data, AuditResponseDto);
  }

  async getAllAudits(
    param: PaginationAuditDto,
  ): Promise<{ audits: AuditResponseDto[]; meta: PaginationMeta }> {
    const { page, limit, search, actions, time } = param;

    const take: number = limit ?? DefaultPageSize.AUDITS;
    const skip: number = this.paginationService.calculateOffset(limit, page);

    const [data, count] = await this.auditRepo.findAllAudits(
      skip,
      take,
      search,
      actions,
      time,
    );

    const audits: AuditResponseDto[] = this.transformArray(data);

    const meta: PaginationMeta = this.paginationService.createMeta(
      limit,
      page,
      count,
    );

    return { audits, meta };
  }

  async getLastFiveAudits(): Promise<AuditResponseDto[]> {
    const audits = await this.auditRepo.getLastFiveAudits();
    return this.transformArray(audits);
  }

  async findOne(id: string): Promise<AuditResponseDto> {
    const audit = await this.auditRepo.findOneAuditById(id);

    if (!audit) {
      throw new NotFoundException(AuditError.AUDIT_NOT_FOUND);
    }

    return this.transformObject(audit);
  }

  //@User() user: UserEntity,
  async createAudit(
    dto: NewAuditDto,
    fullUrl?: string,
    user?: string,
  ): Promise<string> {
    if (!dto.ipAddress) {
      throw new BadRequestException(AuditError.AUDIT_NOT_IP);
    }

    if (!dto.module) {
      throw new BadRequestException(AuditError.AUDIT_NOT_MODULE);
    }

    const newAudit: Partial<Audit> = {};

    if (user) {
      dto.user = user;
    } else {
      dto.user = 'Anonimo';
    }

    for (const key in dto) {
      if (dto[key] ?? false) newAudit[key] = dto[key];
    }

    if (fullUrl !== '') {
      if (configApp().frontHostPortfolio === fullUrl) {
        newAudit.isPortfolio = true;
      } else {
        newAudit.isPortfolio = false;
      }
    } else {
      newAudit.isPortfolio = false;
    }

    const result: Audit = await this.auditRepo.createAudit(newAudit as Audit);

    if (!result) {
      throw new BadRequestException(AuditError.AUDIT_ERROR);
    }

    return AuditOk.AUDIT_CREATED;
  }

  async countAllAudits(): Promise<AuditLogsCount> {
    const countAudits: AuditLogsCount = await this.auditRepo.getAuditStats();

    return countAudits;
  }

  async delete(id: string): Promise<string> {
    const audit = await this.auditRepo.findOneAuditById(id);

    if (!audit) {
      throw new NotFoundException(AuditError.AUDIT_NOT_FOUND);
    }

    const auditDeleted = await this.auditRepo.removeAudit(id);

    if (!auditDeleted) {
      return AuditError.AUDIT_ERROR;
    }

    return AuditOk.AUDIT_REMOVED;
  }
}
