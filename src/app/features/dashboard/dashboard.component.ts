import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SummaryCardComponent, SummaryCardData } from './components/summary-card/summary-card.component';
import { FinancialChartComponent } from './components/financial-chart/financial-chart.component';
import { InvoiceTableComponent } from './components/invoice-table/invoice-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SummaryCardComponent,
    FinancialChartComponent,
    InvoiceTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-wrapper">
      <!-- Summary Cards Section -->
      <div class="summary-cards-section">
        @for (card of summaryCards(); track card.title) {
          <app-summary-card [data]="card" />
        }
      </div>

      <!-- Financial Chart Section -->
      <div class="chart-section">
        <app-financial-chart />
      </div>

      <!-- Invoice Table Section -->
      <div class="table-section">
        <app-invoice-table />
      </div>
    </div>
  `,
  styles: `
    .content-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .summary-cards-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .chart-section {
      width: 100%;
    }

    .table-section {
      width: 100%;
    }
  `,
})
export class DashboardComponent {
  readonly summaryCards = signal<SummaryCardData[]>([
    {
      title: 'Total Rent Owed',
      value: 'KES 1,420,000',
      subtitle: 'Across 28 units',
      icon: 'account_balance_wallet',
    },
    {
      title: 'Portfolio Occupancy',
      value: '86%',
      subtitle: '24/28 Units occupied',
      icon: 'home',
    },
    {
      title: 'Total Remittance',
      value: 'KES 14.82M',
      subtitle: 'This fiscal year',
      icon: 'payments',
    },
  ]);
}
