import { Test, TestingModule } from '@nestjs/testing';
import {
  DiskHealthIndicator,
  HttpHealthIndicator,
  HealthCheckService,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus'; // Asegúrate de importar HealthCheckService
import { StatusController } from '@/shared/controllers/status.controller';

// Crear un mock del servicio HealthCheckService
jest.mock('@nestjs/terminus', () => ({
  HealthCheck: jest.fn().mockImplementation(() => (target, key, descriptor) => {
    // Decorador vacío que no hace nada
    return descriptor;
  }),

  /*  HealthCheckService: jest.fn().mockImplementation(() => ({
    check: jest.fn().mockResolvedValue({
      status: 'ok',
      info: {
        database: { status: 'up' },
        memory_heap: { status: 'up' },
        storage_percent: { status: 'up' },
      },
      error: {},
      details: {},
    }),
  })),

  HttpHealthIndicator: jest.fn().mockImplementation(() => ({
    isHealthy: jest.fn().mockResolvedValue({ status: 'up' }),
  })),
  MongooseHealthIndicator: jest.fn().mockImplementation(() => ({
    isHealthy: jest.fn().mockResolvedValue({ status: 'up' }),
  })),
  MemoryHealthIndicator: jest.fn().mockImplementation(() => ({
    isHealthy: jest.fn().mockResolvedValue({ status: 'up' }),
  })),
  DiskHealthIndicator: jest.fn().mockImplementation(() => ({
    isHealthy: jest.fn().mockResolvedValue({ status: 'up' }),
  })), */

  HealthCheckService: jest.fn().mockImplementation(() => ({
    check: jest.fn().mockResolvedValue({
      status: 'ok',
      info: {
        database: { status: 'up' },
        memory_heap: { status: 'up' },
        storage_percent: { status: 'up' },
        http: { status: 'up' },
      },
      error: {},
      details: {
        database: { status: 'up' },
        memory_heap: { status: 'up' },
        storage_percent: { status: 'up' },
        http: { status: 'up' },
      },
    }),
  })),
  HttpHealthIndicator: jest.fn().mockImplementation(() => ({
    pingCheck: jest.fn().mockResolvedValue({ http: { status: 'up' } }),
  })),
  MongooseHealthIndicator: jest.fn().mockImplementation(() => ({
    pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
  })),
  MemoryHealthIndicator: jest.fn().mockImplementation(() => ({
    checkHeap: jest.fn().mockResolvedValue({ memory_heap: { status: 'up' } }),
  })),
  DiskHealthIndicator: jest.fn().mockImplementation(() => ({
    checkStorage: jest
      .fn()
      .mockResolvedValue({ storage_percent: { status: 'up' } }),
  })),
}));

describe('StatusController', () => {
  let controller: StatusController;
  let healthCheckService: HealthCheckService;
  let httpIndicator: HttpHealthIndicator;
  let dbIndicator: MongooseHealthIndicator;
  let memoryIndicator: MemoryHealthIndicator;
  let diskIndicator: DiskHealthIndicator;

  const pingCheckMock = jest.fn().mockResolvedValue({ http: { status: 'up' } });
  const dbCheckMock = jest
    .fn()
    .mockResolvedValue({ database: { status: 'up' } });
  const memoryCheckMock = jest
    .fn()
    .mockResolvedValue({ memory_heap: { status: 'up' } });
  const diskCheckMock = jest
    .fn()
    .mockResolvedValue({ storage_percent: { status: 'up' } });

  const http = { pingCheck: pingCheckMock };
  const db = { pingCheck: dbCheckMock };
  const memory = { checkHeap: memoryCheckMock };
  const disk = { checkStorage: diskCheckMock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusController],
      providers: [
        HealthCheckService,
        HttpHealthIndicator,
        MongooseHealthIndicator,
        MemoryHealthIndicator,
        DiskHealthIndicator,
      ],
    }).compile();

    controller = module.get<StatusController>(StatusController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    httpIndicator = module.get<HttpHealthIndicator>(HttpHealthIndicator);
    dbIndicator = module.get<MongooseHealthIndicator>(MongooseHealthIndicator);
    memoryIndicator = module.get<MemoryHealthIndicator>(MemoryHealthIndicator);
    diskIndicator = module.get<DiskHealthIndicator>(DiskHealthIndicator);
  });

  it('debe responder con un estado ok y tener los checks', async () => {
    const result = await controller.check(); // Llamada al controlador

    // Verificar el resultado del check mockeado
    expect(result.status).toBe('ok');
    expect(result.info).toHaveProperty('database');
    expect(result.info).toHaveProperty('memory_heap');
    expect(result.info).toHaveProperty('storage_percent');
  });

  it('debe llamar a los indicadores de salud', async () => {
    const healthCheckService = {
      check: jest
        .fn()
        .mockImplementation((indicators: any[]) =>
          Promise.all(indicators.map((fn) => fn())),
        ),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [StatusController],
      providers: [
        { provide: HealthCheckService, useValue: healthCheckService },
        { provide: HttpHealthIndicator, useValue: http },
        { provide: MongooseHealthIndicator, useValue: db },
        { provide: MemoryHealthIndicator, useValue: memory },
        { provide: DiskHealthIndicator, useValue: disk },
      ],
    }).compile();

    const controller = moduleRef.get<StatusController>(StatusController);

    await controller.check();

    expect(pingCheckMock).toHaveBeenCalled();
    expect(dbCheckMock).toHaveBeenCalled();
    expect(memoryCheckMock).toHaveBeenCalled();
    expect(diskCheckMock).toHaveBeenCalled();
  });
});
