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

@Injectable()
export class AuditService {
  constructor(
    private readonly auditRepo: IAuditRepository,
    @Inject(TransformDto)
    private readonly transform: TransformDto<AuditDocument, AuditResponseDto>,
  ) {}

  transformArray(data: AuditDocument[]) {
    return this.transform.transformDtoArray(data, AuditResponseDto);
  }

  transformObject(data: AuditDocument) {
    return this.transform.transformDtoObject(data, AuditResponseDto);
  }

  async getAllAudits(): Promise<AuditResponseDto[]> {
    const audits: AuditDocument[] = await this.auditRepo.getAllAudits();
    return this.transformArray(audits);
  }

  async findOne(id: string): Promise<AuditResponseDto> {
    const audit = await this.auditRepo.findOneAuditById(id);

    if (!audit) {
      throw new NotFoundException(AuditError.AUDIT_NOT_FOUND);
    }

    return this.transformObject(audit);
  }

  async createAudit(dto: NewAuditDto): Promise<string> {
    if (!dto.ipAddress) {
      throw new BadRequestException(AuditError.AUDIT_NOT_IP);
    }

    if (!dto.module) {
      throw new BadRequestException(AuditError.AUDIT_NOT_MODULE);
    }

    const newAudit = {};

    for (const key in dto) {
      if (dto[key] ?? false) newAudit[key] = dto[key];
    }

    const result: Audit = await this.auditRepo.createAudit(newAudit as Audit);

    if (!result) {
      throw new BadRequestException(AuditError.AUDIT_ERROR);
    }

    return AuditOk.AUDIT_CREATED;
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
