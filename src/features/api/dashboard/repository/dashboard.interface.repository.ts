import { Injectable } from '@nestjs/common';
import { DashboardSummaryDto } from '../dto/dashboard-summary.dto';

@Injectable()
export abstract class IDashboardRepository {
  abstract getSummary(): Promise<DashboardSummaryDto>;
}
