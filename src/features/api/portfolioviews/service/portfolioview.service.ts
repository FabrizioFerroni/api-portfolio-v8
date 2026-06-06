import { Inject, Injectable, Logger } from '@nestjs/common';
import { IPortfolioViewRepository } from '../repository/portfolioview.interface.repository';
import { TransformDto } from '@/shared/utils';
import { PortfolioViewDocument } from '../schema/portfolioview.schema';
import { AnalyticsResponse } from '../dto/analyticsresponse.response.dto';
import { AnalyticsRange } from '../enum/analitycrange.enum';

@Injectable()
export class PortfolioViewService {
  private readonly logger: Logger = new Logger(PortfolioViewService.name, {
    timestamp: true,
  });

  constructor(
    private readonly portfolioViewRepository: IPortfolioViewRepository,
  ) {}

  async trackView(): Promise<void> {
    await this.portfolioViewRepository.trackView();
  }

  async getAnalytics(range: AnalyticsRange): Promise<AnalyticsResponse> {
    const data = await this.portfolioViewRepository.getViewsByRange(range);
    const total = data.reduce((sum, d) => sum + d.views, 0);
    const percentageChange = await this.calculatePercentageChange(range, total);

    return { data, total, percentageChange };
  }

  private async calculatePercentageChange(
    range: AnalyticsRange,
    currentTotal: number,
  ): Promise<number> {
    const previousTotal = await this.getPreviousPeriodTotal(range);

    if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;

    return Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
  }

  private async getPreviousPeriodTotal(range: AnalyticsRange): Promise<number> {
    // Reutilizamos los métodos existentes del repositorio
    const map: Record<AnalyticsRange, () => Promise<number>> = {
      week: () => this.portfolioViewRepository.countPreviousWeek(),
      month: () => this.portfolioViewRepository.countPreviousMonth(),
      year: () => this.portfolioViewRepository.countPreviousYear(),
    };

    return map[range]();
  }
}
