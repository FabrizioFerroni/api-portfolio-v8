import { Injectable } from '@nestjs/common';
import { IDashboardRepository } from './dashboard.interface.repository';
import { DashboardSummaryDto } from '../dto/dashboard-summary.dto';
import { IProjectRepository } from '../../projects/repository/project.interface.repository';
import { ISubscriberRepository } from '../../subscribers/repository/subscriber.interface.repository';
import { IContactRepository } from '../../contacts/repository/contact.interface.repository';
import { IAuditRepository } from '../../audits/repository/audit.interface.repository';

@Injectable()
export class DashboardRepository extends IDashboardRepository {
  constructor(
    private readonly projectRepo: IProjectRepository,
    private readonly subscriberRepo: ISubscriberRepository,
    private readonly contactRepo: IContactRepository,
    private readonly auditRepo: IAuditRepository,
  ) {
    super();
  }

  async getSummary(): Promise<DashboardSummaryDto> {
    const [projects, subscribers, contacts, audits] = await Promise.all([
      this.projectRepo.count(),
      this.subscriberRepo.countSubscribers(),
      this.contactRepo.count(),
      this.auditRepo.countViews(),
    ]);

    return {
      totalProjects: projects,
      totalSubscribers: subscribers,
      totalMessages: contacts,
      totalViews: audits,
    };
  }
}
