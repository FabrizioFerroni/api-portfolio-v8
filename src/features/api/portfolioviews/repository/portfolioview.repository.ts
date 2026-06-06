import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PortfolioView,
  PortfolioViewDocument,
} from '../schema/portfolioview.schema';
import { Model } from 'mongoose';
import { IPortfolioViewRepository } from './portfolioview.interface.repository';
import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import {
  getCurrentMonthRange,
  getPreviousMonthRange,
  getPreviousWeekRange,
  getPreviousYearRange,
} from '@/shared/utils/functions/date.utils';
import { AnalyticsRange } from '../enum/analitycrange.enum';
import { AnalyticsData } from '../interface/analyticdata.interface';

@Injectable()
export class PortfolioViewRepository
  extends MongoDBRepository<PortfolioViewDocument>
  implements IPortfolioViewRepository
{
  constructor(
    @InjectModel(PortfolioView.name)
    private readonly portfolioViewModel: Model<PortfolioViewDocument>,
  ) {
    super(portfolioViewModel);
  }

  async count(): Promise<number> {
    const result = await this.portfolioViewModel.aggregate([
      { $group: { _id: null, total: { $sum: '$viewsCount' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async countThisMonth(): Promise<number> {
    const { start, end } = getCurrentMonthRange();
    const result = await this.portfolioViewModel.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$viewsCount' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async countPreviousMonth(): Promise<number> {
    const { start, end } = getPreviousMonthRange();
    const result = await this.portfolioViewModel.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$viewsCount' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async countPreviousWeek(): Promise<number> {
    const { start, end } = getPreviousWeekRange();
    const result = await this.portfolioViewModel.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$viewsCount' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async countPreviousYear(): Promise<number> {
    const { start, end } = getPreviousYearRange();
    const result = await this.portfolioViewModel.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$viewsCount' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async getAllViews(): Promise<PortfolioViewDocument[]> {
    return this.portfolioViewModel.find().sort({ date: 1 }).exec();
  }

  async trackView(): Promise<void> {
    const today = new Date();
    await this.portfolioViewModel.findOneAndUpdate(
      { date: today },
      {
        $inc: { viewsCount: 1 },
        $setOnInsert: { date: today },
      },
      { upsert: true },
    );
  }

  async getViewsByRange(range: AnalyticsRange): Promise<AnalyticsData[]> {
    const { start, end } = this.getDateRangeByRange(range);

    const results = await this.portfolioViewModel.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
        },
      },
      {
        $project: {
          _id: 0,
          date: 1,
          views: '$viewsCount',
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    return results as AnalyticsData[];
  }

  private getStartDateByRange(range: AnalyticsRange): string {
    const now = new Date();

    const map: Record<AnalyticsRange, () => Date> = {
      week: () =>
        new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6),
      month: () => new Date(now.getFullYear(), now.getMonth(), 1),
      year: () => new Date(now.getFullYear(), 0, 1),
    };

    return map[range]().toISOString().split('T')[0];
  }

  private getDateRangeByRange(range: AnalyticsRange): {
    start: Date;
    end: Date;
  } {
    const now = new Date();
    const todayUTC = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
    );

    const map: Record<AnalyticsRange, () => { start: Date; end: Date }> = {
      week: () => {
        const day = todayUTC.getUTCDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const start = new Date(todayUTC);
        start.setUTCDate(todayUTC.getUTCDate() + diffToMonday);
        const end = new Date(start);
        end.setUTCDate(start.getUTCDate() + 6); // domingo
        return { start, end };
      },
      month: () => ({
        start: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)),
        end: new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0)), // último día del mes
      }),
      year: () => ({
        start: new Date(Date.UTC(now.getFullYear(), 0, 1)),
        end: new Date(Date.UTC(now.getFullYear(), 11, 31)),
      }),
    };

    return map[range]();
  }
}
