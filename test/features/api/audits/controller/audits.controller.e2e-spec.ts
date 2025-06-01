import { AppModule } from '@/app.module';
import { AuditService } from '@/features/api/audits/service/audit.service';
import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

const data = {
  id: '68326ef2df0e49aa96739458',
  action: 'test',
  details: 'test',
  ip: '192.168.0.235',
  module: 'Audit',
  date: '24/05/2025',
};

describe('AuditsController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  const auditService = {
    getAllAudits: jest.fn(),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuditService)
      .useValue(auditService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/audits (GET)', () => {
    it('should return all audits (200)', async () => {
      const mockAudits = {
        message: 'Solicitud exitosa',
        data: [data],
        statusCode: 200,
      };
      auditService.getAllAudits.mockResolvedValue(mockAudits);

      const res = await request(app.getHttpServer()).get('/audits');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockAudits);
    });
  });

  describe('/audits/:id (GET)', () => {
    it('should return one audit (200)', async () => {
      const mockAudit = {
        message: 'Solicitud exitosa',
        data,
        statusCode: 200,
      };
      auditService.findOne.mockResolvedValue(mockAudit);

      const res = await request(app.getHttpServer()).get(
        '/audits/68326ef2df0e49aa96739458',
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockAudit);
    });

    it('should return 404 if audit not found', async () => {
      auditService.findOne.mockImplementation(() => {
        throw new NotFoundException('Audit not found');
      });

      const response = {
        error: 'Not Found',
        message: 'Audit not found',
        statusCode: 404,
      };

      const res = await request(app.getHttpServer()).get(
        '/audits/683cc7f5a41209b893e35740',
      );

      expect(res.status).toBe(404);
      expect(res.body.message).toEqual(response);
    });
  });
});
