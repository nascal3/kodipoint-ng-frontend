import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { SnackbarService } from '../../shared/components/snackbar/snackbar.service';
import { FinancialChartComponent } from './components/financial-chart/financial-chart.component';
import { InvoiceTableComponent } from './components/invoice-table/invoice-table.component';
import { TotalRentOwedCardComponent } from './components/total-rent-owed-card/total-rent-owed-card.component';
import { PortfolioOccupancyCardComponent } from './components/portfolio-occupancy-card/portfolio-occupancy-card.component';
import { TotalRemittanceCardComponent } from './components/total-remittance-card/total-remittance-card.component';
import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TotalRentOwedCardComponent, PortfolioOccupancyCardComponent, TotalRemittanceCardComponent, FinancialChartComponent, InvoiceTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly snackbarService = inject(SnackbarService);

  readonly maxDate = new Date();
  readonly dateRangeStart = signal<Date | null>(new Date(this.maxDate.getFullYear(), 6, 1));
  readonly dateRangeEnd = signal<Date | null>(this.maxDate);

  readonly totalRentOwed = signal('Loading...');

  readonly portfolioOccupancyValue = signal('Loading...');
  readonly portfolioOccupancyUnit = signal('/ -- Units');
  readonly portfolioOccupancyFooter = signal('Loading...');

  readonly totalRemittance = signal('Loading...');
  readonly totalRemittanceFooter = signal('Based on last 3 months');

  ngOnInit(): void {
    this.dashboardService.getPortfolioOccupancy().subscribe({
      next: ({ occupancyPercentage, occupiedUnits, totalUnits }) => {
        this.portfolioOccupancyValue.set(`${occupiedUnits}`);
        this.portfolioOccupancyUnit.set(`/ ${totalUnits} Units`);
        this.portfolioOccupancyFooter.set(`${occupancyPercentage}% occupied`);
      },
      error: () => {
        this.portfolioOccupancyValue.set('--');
        this.portfolioOccupancyUnit.set('/ -- Units');
        this.portfolioOccupancyFooter.set('Occupancy unavailable');
        this.snackbarService.error('Failed to load portfolio occupancy.');
      },
    });

    this.fetchDashboardData();
  }

  private fetchDashboardData(): void {
    const startDate = this.dateRangeStart();
    const endDate = this.dateRangeEnd();

    if (!startDate || !endDate) {
      return;
    }

    this.dashboardService.getTotalRentOwed(startDate, endDate).subscribe({
      next: ({ summary }) => {
        const amount = new Intl.NumberFormat('en-KE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(summary.totalOwed));

        this.totalRentOwed.set(`KES ${amount}`);
      },
      error: () => {
        this.totalRentOwed.set('--');
        this.snackbarService.error('Failed to load total rent owed.');
      },
    });

    this.dashboardService.getAllPropertiesIncome(startDate, endDate).subscribe({
      next: ({ summary }) => {
        const amount = new Intl.NumberFormat('en-KE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(summary.totalIncome));

        this.totalRemittance.set(`KES ${amount}`);
      },
      error: () => {
        this.totalRemittance.set('--');
        this.snackbarService.error('Failed to load total remittance.');
      },
    });
  }

  onDateRangeChange(range: { start: Date | null; end: Date | null }): void {
    this.dateRangeStart.set(range.start);
    this.dateRangeEnd.set(range.end);
  }
}
