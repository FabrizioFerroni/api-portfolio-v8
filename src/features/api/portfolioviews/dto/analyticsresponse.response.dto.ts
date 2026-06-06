import { AnalyticsData } from '../interface/analyticdata.interface';

export interface AnalyticsResponse {
  data: AnalyticsData[];
  total: number;
  percentageChange: number;
}
