import { Injectable } from '@nestjs/common';
import { IDashboardRepository } from './dashboard.interface.repository';
import { DashboardSummaryDto } from '../dto/dashboard-summary.dto';
import { IProjectRepository } from '../../projects/repository/project.interface.repository';
import { ISubscriberRepository } from '../../subscribers/repository/subscriber.interface.repository';
import { IContactRepository } from '../../contacts/repository/contact.interface.repository';
import { IAuditRepository } from '../../audits/repository/audit.interface.repository';
import { DashboardMonthlySummaryDto } from '../dto/dashboard-monthly-summary.dto';
import { IPortfolioViewRepository } from '../../portfolioviews/repository/portfolioview.interface.repository';

@Injectable()
export class DashboardRepository extends IDashboardRepository {
  constructor(
    private readonly projectRepo: IProjectRepository,
    private readonly subscriberRepo: ISubscriberRepository,
    private readonly contactRepo: IContactRepository,
    private readonly portfolioViewRepo: IPortfolioViewRepository,
  ) {
    super();
  }

  async getSummary(): Promise<DashboardSummaryDto> {
    const [projects, subscribers, contacts, audits] = await Promise.all([
      this.projectRepo.count(),
      this.subscriberRepo.countSubscribers(),
      this.contactRepo.count(),
      this.portfolioViewRepo.count(),
    ]);

    return {
      totalProjects: projects,
      totalSubscribers: subscribers,
      totalMessages: contacts,
      totalViews: audits,
    };
  }

  async getMonthlySummary(): Promise<DashboardMonthlySummaryDto> {
    const [current, previous] = await Promise.all([
      Promise.all([
        this.projectRepo.countThisMonth(),
        this.subscriberRepo.countThisMonth(),
        this.contactRepo.countThisMonth(),
        this.portfolioViewRepo.countThisMonth(),
      ]),
      Promise.all([
        this.projectRepo.countPreviousMonth(),
        this.subscriberRepo.countPreviousMonth(),
        this.contactRepo.countPreviousMonth(),
        this.portfolioViewRepo.countPreviousMonth(),
      ]),
    ]);

    const [newProjects, newSubscribers, newMessages, newViews] = current;
    const [prevProjects, prevSubscribers, prevMessages, prevViews] = previous;

    const currentTotal = newProjects + newSubscribers + newMessages + newViews;
    const previousTotal =
      prevProjects + prevSubscribers + prevMessages + prevViews;

    /* const growthRate =
      previousTotal === 0
        ? null
        : parseFloat(
            (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1),
          ); */

    /*  const growthRate =
      previousTotal > 1
        ? 0
        : parseFloat(
            (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1),
          ); */

    const growthRate = (() => {
      if (previousTotal === 0 && currentTotal === 0) return 0;
      if (previousTotal === 0) return null;
      const rate = ((currentTotal - previousTotal) / previousTotal) * 100;
      return parseFloat(Math.max(0, rate).toFixed(2));
    })();

    return {
      newProjects,
      newSubscribers,
      newMessages,
      newViews,
      growthRate,
    };
  }
}
