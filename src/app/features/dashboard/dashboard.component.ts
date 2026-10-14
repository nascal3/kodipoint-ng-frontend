import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  SummaryCardComponent,
  SummaryCardData,
} from './components/summary-card/summary-card.component';
import { FinancialChartComponent } from './components/financial-chart/financial-chart.component';
import { InvoiceTableComponent } from './components/invoice-table/invoice-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SummaryCardComponent, FinancialChartComponent, InvoiceTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-container">
      <!-- Top KPI Row -->
      <section class="kpi-cards-grid" aria-label="Key Performance Indicators">
        @for (card of summaryCards(); track card.title) {
          <app-summary-card [data]="card" />
        }
      </section>

      <!-- Middle Financial Activity Chart -->
      <section class="financial-chart-section" aria-label="Financial Activity">
        <app-financial-chart />
      </section>

      <!-- Bottom Invoices & Remittances Table -->
      <section class="invoice-table-section" aria-label="Tenant Invoices and Remittances">
        <app-invoice-table />
      </section>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1440px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }

    .kpi-cards-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 20px;
    }

    @media (min-width: 768px) {
      .kpi-cards-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    .financial-chart-section {
      width: 100%;
    }

    .invoice-table-section {
      width: 100%;
    }
  `,
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
