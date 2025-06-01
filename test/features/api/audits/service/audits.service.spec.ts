import { AuditResponseDto } from '@/features/api/audits/dto/response/audit-response.dto';
import {
  AuditError,
  AuditOk,
} from '@/features/api/audits/messages/audit.messages';
import { IAuditRepository } from '@/features/api/audits/repository/audit.interface.repository';
import {
  Audit,
  AuditDocument,
} from '@/features/api/audits/schema/audit.schema';
import { AuditService } from '@/features/api/audits/service/audit.service';
import { TransformDto } from '@/shared/utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@/features/api/audits/repository/audit.repository');
jest.mock('@/shared/utils');

const transformed: AuditResponseDto[] = [
  {
    _id: '1',
    action: 'create',
    details: 'algo',
    module: 'modulo',
    ipAddress: '127.0.0.1',
    dateAudit: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('AuditService', () => {
  let service: AuditService;
  let auditRepo: IAuditRepository;
  let transform: TransformDto<AuditDocument, AuditResponseDto>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: IAuditRepository,
          useValue: {
            getAllAudits: jest.fn(),
            findOneAuditById: jest.fn(),
            createAudit: jest.fn(),
            removeAudit: jest.fn(),
          },
        },
        {
          provide: TransformDto,
          useValue: {
            transformDtoArray: jest.fn(),
            transformDtoObject: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    auditRepo = module.get<IAuditRepository>(IAuditRepository);
    transform =
      module.get<TransformDto<AuditDocument, AuditResponseDto>>(TransformDto);
  });

  describe('getAllAudits', () => {
    it('debe retornar lista transformada de audits', async () => {
      const raw = [{ _id: '1' }] as AuditDocument[];

      auditRepo.getAllAudits = jest.fn().mockResolvedValue(raw);
      transform.transformDtoArray = jest.fn().mockReturnValue(transformed);

      const result = await service.getAllAudits();

      expect(result).toEqual(transformed);
      expect(auditRepo.getAllAudits).toHaveBeenCalled();
      expect(transform.transformDtoArray).toHaveBeenCalledWith(
        raw,
        AuditResponseDto,
      );
    });
  });

  describe('findOne', () => {
    it('debe lanzar NotFoundException si no encuentra el audit', async () => {
      auditRepo.findOneAuditById = jest.fn().mockResolvedValue(null);

      await expect(service.findOne('xxx')).rejects.toThrow(NotFoundException);
    });

    it('debe retornar el audit transformado si existe', async () => {
      const raw = { _id: '1' } as AuditDocument;
      const transformed = {
        _id: '1',
        action: 'create',
        details: 'algo',
        module: 'modulo',
        ipAddress: '127.0.0.1',
        dateAudit: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as AuditResponseDto;

      auditRepo.findOneAuditById = jest.fn().mockResolvedValue(raw);
      transform.transformDtoObject = jest.fn().mockReturnValue(transformed);

      const result = await service.findOne('1');

      expect(result).toEqual(transformed);
    });
  });

  describe('createAudit', () => {
    it('debe lanzar error si falta ipAddress', async () => {
      await expect(
        service.createAudit({
          module: 'mod1',
          action: 'a',
          details: 'x',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar error si falta module', async () => {
      await expect(
        service.createAudit({
          ipAddress: '127.0.0.1',
          action: 'a',
          details: 'x',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe retornar AUDIT_CREATED si todo va bien', async () => {
      const dto = {
        ipAddress: '127.0.0.1',
        module: 'mod1',
        action: 'create',
        details: 'detalle',
        dateAudit: new Date(),
      };

      auditRepo.createAudit = jest.fn().mockResolvedValue({ ...dto } as Audit);

      const result = await service.createAudit(dto);

      expect(result).toBe(AuditOk.AUDIT_CREATED);
    });

    it('debe lanzar error si createAudit falla', async () => {
      const dto = {
        ipAddress: '127.0.0.1',
        module: 'mod1',
        action: 'create',
        details: 'detalle',
        dateAudit: new Date(),
      };

      auditRepo.createAudit = jest.fn().mockResolvedValue(null);

      await expect(service.createAudit(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('delete', () => {
    it('debe lanzar NotFoundException si no existe el audit', async () => {
      auditRepo.findOneAuditById = jest.fn().mockResolvedValue(null);

      await expect(service.delete('xxx')).rejects.toThrow(NotFoundException);
    });

    it('debe retornar AUDIT_REMOVED si se borra correctamente', async () => {
      auditRepo.findOneAuditById = jest.fn().mockResolvedValue({ _id: '1' });
      auditRepo.removeAudit = jest.fn().mockResolvedValue(true);

      const result = await service.delete('1');

      expect(result).toBe(AuditOk.AUDIT_REMOVED);
    });

    it('debe retornar error si falla el borrado', async () => {
      auditRepo.findOneAuditById = jest.fn().mockResolvedValue({ _id: '1' });
      auditRepo.removeAudit = jest.fn().mockResolvedValue(false);

      const result = await service.delete('1');

      expect(result).toBe(AuditError.AUDIT_ERROR);
    });
  });
});
