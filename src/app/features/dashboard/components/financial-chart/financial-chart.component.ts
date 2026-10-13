import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface MonthlyData {
  month: string;
  collected: number;
  overdue: number;
}

@Component({
  selector: 'app-financial-chart',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card appearance="outlined" class="chart-card">
      <mat-card-header class="chart-header">
        <mat-card-title>Financial Activity & Rent Streams</mat-card-title>
        <div class="header-actions">
          <button mat-button class="date-range-btn">
            <mat-icon>calendar_today</mat-icon>
            <span>{{ dateRange() }}</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
        </div>
      </mat-card-header>

      <mat-card-content class="chart-content">
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-color collected"></div>
            <span>Collected</span>
          </div>
          <div class="legend-item">
            <div class="legend-color overdue"></div>
            <span>Overdue</span>
          </div>
        </div>

        <div class="bar-chart">
          @for (data of chartData(); track data.month) {
            <div class="chart-column">
              <div class="bar-group">
                <div
                  class="bar collected"
                  [style.height.%]="calculateHeight(data.collected)"
                  [title]="'Collected: KES ' + formatNumber(data.collected)"
                ></div>
                <div
                  class="bar overdue"
                  [style.height.%]="calculateHeight(data.overdue)"
                  [title]="'Overdue: KES ' + formatNumber(data.overdue)"
                ></div>
              </div>
              <div class="bar-label">{{ data.month }}</div>
            </div>
          }
        </div>

        <div class="y-axis-labels">
          <span>20M</span>
          <span>15M</span>
          <span>10M</span>
          <span>5M</span>
          <span>0</span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .chart-card {
      background-color: var(--mat-sys-surface-container);
      border-color: var(--mat-sys-outline-variant);
      border-radius: 16px;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 0;
    }

    .chart-header mat-card-title {
      font: var(--mat-sys-title-medium);
      color: var(--mat-sys-on-surface);
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .date-range-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
    }

    .chart-content {
      padding: 24px;
    }

    .chart-legend {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .legend-color.collected {
      background-color: var(--mat-sys-primary);
    }

    .legend-color.overdue {
      background-color: var(--mat-sys-error);
    }

    .bar-chart {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      height: 200px;
      margin-bottom: 8px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .chart-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
      max-width: 60px;
    }

    .bar-group {
      display: flex;
      gap: 4px;
      height: 100%;
      align-items: flex-end;
    }

    .bar {
      width: 20px;
      border-radius: 4px 4px 0 0;
      transition: height 0.3s ease;
      min-height: 4px;
    }

    .bar.collected {
      background-color: var(--mat-sys-primary);
    }

    .bar.overdue {
      background-color: var(--mat-sys-error);
    }

    .bar-label {
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }

    .y-axis-labels {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 200px;
      position: absolute;
      left: 24px;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }

    .chart-content {
      position: relative;
    }
  `,
})
export class FinancialChartComponent {
  readonly dateRange = signal('Jul 2024 - Dec 2024');

  readonly chartData = signal<MonthlyData[]>([
    { month: 'Jul', collected: 15000000, overdue: 2000000 },
    { month: 'Aug', collected: 18000000, overdue: 1500000 },
    { month: 'Sep', collected: 12000000, overdue: 3000000 },
    { month: 'Oct', collected: 16000000, overdue: 1800000 },
    { month: 'Nov', collected: 14000000, overdue: 2200000 },
    { month: 'Dec', collected: 17000000, overdue: 1200000 },
  ]);

  readonly maxValue = 20000000;

  calculateHeight(value: number): number {
    return (value / this.maxValue) * 100;
  }

  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'K';
    }
    return value.toString();
  }
}
