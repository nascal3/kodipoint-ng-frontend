import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FinancialChartComponent } from './components/financial-chart/financial-chart.component';
import { InvoiceTableComponent } from './components/invoice-table/invoice-table.component';
import { TotalRentOwedCardComponent } from './components/total-rent-owed-card/total-rent-owed-card.component';
import { PortfolioOccupancyCardComponent } from './components/portfolio-occupancy-card/portfolio-occupancy-card.component';
import { TotalRemittanceCardComponent } from './components/total-remittance-card/total-remittance-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TotalRentOwedCardComponent, PortfolioOccupancyCardComponent, TotalRemittanceCardComponent, FinancialChartComponent, InvoiceTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly totalRentOwed = signal('KES 1,420,000');
  readonly totalRentOwedFooter = signal('Based on last 30 days');

  readonly portfolioOccupancyValue = signal('24');
  readonly portfolioOccupancyUnit = signal('/ 28 Units');
  readonly portfolioOccupancyFooter = signal('86% occupied');

  readonly totalRemittance = signal('KES 14.82M');
  readonly totalRemittanceFooter = signal('Based on last 30 days');
}
