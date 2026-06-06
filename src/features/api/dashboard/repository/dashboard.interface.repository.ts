import { Injectable } from '@nestjs/common';
import { DashboardSummaryDto } from '../dto/dashboard-summary.dto';
import { DashboardMonthlySummaryDto } from '../dto/dashboard-monthly-summary.dto';

@Injectable()
export abstract class IDashboardRepository {
  abstract getSummary(): Promise<DashboardSummaryDto>;
  abstract getMonthlySummary(): Promise<DashboardMonthlySummaryDto>;
}
