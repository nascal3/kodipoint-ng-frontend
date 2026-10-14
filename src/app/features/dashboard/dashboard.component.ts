import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FinancialChartComponent } from './components/financial-chart/financial-chart.component';
import { InvoiceTableComponent } from './components/invoice-table/invoice-table.component';
import { SummaryCardComponent, type SummaryCardData } from './components/summary-card/summary-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SummaryCardComponent, FinancialChartComponent, InvoiceTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  readonly summaryCards = signal<SummaryCardData[]>([
    {
      title: 'Total Rent Owed',
      value: 'KES 1,420,000',
      icon: 'pending_actions',
      iconType: 'error',
      footerType: 'calendar',
      footerText: 'Based on last 30 days',
    },
    {
      title: 'Portfolio Occupancy',
      value: '24',
      unitDetail: '/ 28 Units',
      icon: 'domain',
      iconType: 'secondary',
      footerType: 'badge',
      footerText: '86% occupied',
      badgeIcon: 'check_circle',
    },
    {
      title: 'Total Remittance',
      value: 'KES 14.82M',
      icon: 'payments',
      iconType: 'primary',
      footerType: 'calendar',
      footerText: 'Based on last 30 days',
    },
  ]);
}
