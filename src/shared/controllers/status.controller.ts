import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HttpHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { SkipResponseInterceptor } from '../decorators/skip-response.decorator';
import { configApp } from '@/config/app/config.app';

@Controller('estado')
@ApiTags('Estado')
export class StatusController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @SkipResponseInterceptor()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () =>
        this.http.pingCheck('http', configApp().frontHost, {
          headers: {
            'User-Agent': 'NestJS Health Check',
          },
        }),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () =>
        this.disk.checkStorage('storage_percent', {
          path: configApp().filesPathRoute,
          thresholdPercent: configApp().diskThreshold,
        }),
    ]);
  }
}
