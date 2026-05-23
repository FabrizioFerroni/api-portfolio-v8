import { Injectable } from '@nestjs/common';
import { DashboardSummaryDto } from '../dto/dashboard-summary.dto';
import { IDashboardRepository } from '../repository/dashboard.interface.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async getStats(): Promise<DashboardSummaryDto> {
    const response = await this.dashboardRepository.getSummary();

    return response;
  }
}
