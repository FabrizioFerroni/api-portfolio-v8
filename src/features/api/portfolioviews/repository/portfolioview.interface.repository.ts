import { MongoDBRepository } from '@/config/database/mongodb/mongo.base.repository';
import { PortfolioViewDocument } from '../schema/portfolioview.schema';
import { AnalyticsRange } from '../enum/analitycrange.enum';
import { AnalyticsData } from '../interface/analyticdata.interface';

export abstract class IPortfolioViewRepository extends MongoDBRepository<PortfolioViewDocument> {
  abstract count(): Promise<number>;
  abstract countThisMonth(): Promise<number>;
  abstract countPreviousMonth(): Promise<number>;
  abstract countPreviousWeek(): Promise<number>;
  abstract countPreviousYear(): Promise<number>;
  abstract getAllViews(): Promise<PortfolioViewDocument[]>;
  abstract trackView(): Promise<void>;
  abstract getViewsByRange(range: AnalyticsRange): Promise<AnalyticsData[]>;
}
