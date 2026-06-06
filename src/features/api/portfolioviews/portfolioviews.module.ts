import { MongooseModule } from '@nestjs/mongoose';
import {
  PortfolioView,
  PortfolioViewSchema,
} from './schema/portfolioview.schema';
import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/core.module';
import { PortfolioViewService } from './service/portfolioview.service';
import { PortfolioViewRepository } from './repository/portfolioview.repository';
import { IPortfolioViewRepository } from './repository/portfolioview.interface.repository';
import { PortfolioViewController } from './controller/portfolioview.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PortfolioView.name, schema: PortfolioViewSchema },
    ]),
    CoreModule,
  ],
  controllers: [PortfolioViewController],
  providers: [
    PortfolioViewService,
    PortfolioViewRepository,
    {
      provide: IPortfolioViewRepository,
      useClass: PortfolioViewRepository,
    },
  ],
  exports: [
    PortfolioViewService,
    IPortfolioViewRepository,
    PortfolioViewRepository,
  ],
})
export class PortfolioViewModule {}
