import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import * as echarts from 'echarts';

@Component({
  selector: 'app-financial-chart',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card appearance="outlined" class="chart-card">
      <mat-card-header class="chart-header">
        <div class="header-titles">
          <mat-card-title class="chart-title">Financial Activity & Rent Streams</mat-card-title>
          <p class="chart-subtitle">
            Monthly collection performance across all portfolio units in Nairobi
          </p>

          <!-- Interactive Legend Pill Buttons -->
          <div class="legend-container">
            <button
              type="button"
              class="legend-pill"
              [class.active-collected]="showCollected()"
              [class.inactive]="!showCollected()"
              [attr.aria-pressed]="showCollected()"
              (click)="toggleCollected()"
            >
              <span class="legend-dot dot-collected"></span>
              <span class="legend-label" [class.struck]="!showCollected()">Collected</span>
            </button>

            <button
              type="button"
              class="legend-pill"
              [class.active-overdue]="showOverdue()"
              [class.inactive]="!showOverdue()"
              [attr.aria-pressed]="showOverdue()"
              (click)="toggleOverdue()"
            >
              <span class="legend-dot dot-overdue"></span>
              <span class="legend-label" [class.struck]="!showOverdue()">Overdue</span>
            </button>
          </div>
        </div>

        <div class="header-actions">
          <button mat-stroked-button class="date-filter-btn" type="button">
            <mat-icon class="calendar-icon">calendar_today</mat-icon>
            <span class="date-text">{{ dateRange() }}</span>
            <mat-icon class="dropdown-icon">arrow_drop_down</mat-icon>
          </button>
        </div>
      </mat-card-header>

      <mat-card-content class="chart-content">
        <div #chartContainer class="echarts-container"></div>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .chart-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
      padding: 6px 0;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 18px 24px 0;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-titles {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .chart-title {
      font-size: 20px;
      font-weight: 600;
      color: #0f172a;
      letter-spacing: -0.01em;
      margin: 0;
    }

    .chart-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }

    .legend-container {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
    }

    .legend-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      border: 1px solid transparent;
      outline: none;
      user-select: none;
    }

    .legend-pill.active-collected {
      background-color: #e0e7ff;
      color: #4f46e5;
      border-color: rgba(79, 70, 229, 0.25);
      box-shadow: 0 1px 2px rgba(79, 70, 229, 0.08);
    }

    .legend-pill.active-overdue {
      background-color: #fee2e2;
      color: #e11d48;
      border-color: rgba(225, 29, 72, 0.25);
      box-shadow: 0 1px 2px rgba(225, 29, 72, 0.08);
    }

    .legend-pill.inactive {
      background-color: #f1f5f9;
      color: #94a3b8;
      border-color: #e2e8f0;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
      transition: opacity 0.2s;
    }

    .dot-collected {
      background-color: #4f46e5;
    }

    .dot-overdue {
      background-color: #f43f5e;
    }

    .legend-pill.inactive .legend-dot {
      opacity: 0.35;
    }

    .legend-label.struck {
      text-decoration: line-through;
    }

    .header-actions {
      display: flex;
      align-items: center;
    }

    .date-filter-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 38px;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background-color: #ffffff;
      color: #1e293b;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .date-filter-btn:hover {
      border-color: #4f46e5;
      background-color: #f8faff;
    }

    .calendar-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #4f46e5;
    }

    .dropdown-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #64748b;
      margin-left: -2px;
    }

    .chart-content {
      padding: 16px 20px 20px;
    }

    .echarts-container {
      width: 100%;
      height: 300px;
      min-height: 280px;
    }
  `,
})
export class FinancialChartComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');

  private chartInstance: echarts.ECharts | null = null;

  readonly dateRange = signal('Jul 01 - Dec 31, 2026');
  readonly showCollected = signal(true);
  readonly showOverdue = signal(true);

  constructor() {
    afterNextRender(() => {
      this.initChart();
    });

    this.destroyRef.onDestroy(() => {
      if (this.chartInstance) {
        try {
          this.chartInstance.dispose();
        } catch {
          // Ignore cleanup errors in headless test environments
        }
        this.chartInstance = null;
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', this.onResize);
      }
    });
  }

  private onResize = (): void => {
    if (this.chartInstance) {
      try {
        this.chartInstance.resize();
      } catch {
        // Ignore resize errors in test environments
      }
    }
  };

  private initChart(): void {
    const el = this.chartContainer()?.nativeElement;
    if (!el) return;

    // Safeguard for headless test environments (e.g. JSDOM without canvas context)
    if (typeof document !== 'undefined') {
      try {
        const testCanvas = document.createElement('canvas');
        if (!testCanvas.getContext || !testCanvas.getContext('2d')) {
          return;
        }
      } catch {
        return;
      }
    }

    try {
      this.chartInstance = echarts.init(el);

      const option: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        animationDuration: 750,
        grid: {
          left: '2%',
          right: '2%',
          bottom: '3%',
          top: '12%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: 'rgba(79, 70, 229, 0.04)',
            },
          },
          backgroundColor: '#0f172a',
          borderColor: '#1e293b',
          borderWidth: 1,
          padding: [10, 14],
          textStyle: {
            color: '#f8fafc',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 12,
          },
          extraCssText:
            'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2); border-radius: 10px;',
          formatter: (params: any) => {
            if (!Array.isArray(params) || params.length === 0) return '';
            const month = params[0].name;
            let html = `<div style="font-weight: 700; margin-bottom: 6px; font-size: 13px; color: #ffffff;">${month} 2026</div>`;
            params.forEach((item: any) => {
              const marker = `<span style="display:inline-block;margin-right:6px;border-radius:9999px;width:8px;height:8px;background-color:${item.color};"></span>`;
              html += `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:3px;font-size:12px;">
                <span style="color:#94a3b8;display:flex;align-items:center;">${marker}${item.seriesName}</span>
                <span style="font-weight:600;color:#f8fafc;">KES ${item.value}M</span>
              </div>`;
            });
            return html;
          },
        },
        xAxis: {
          type: 'category',
          data: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          axisTick: { show: false },
          axisLine: {
            lineStyle: {
              color: '#c7c4d8',
              opacity: 0.5,
            },
          },
          axisLabel: {
            color: '#464555',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            margin: 12,
          },
        },
        yAxis: {
          type: 'value',
          max: 20,
          interval: 5,
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#e2e7ff',
              opacity: 0.8,
            },
          },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            formatter: '{value}M',
            color: '#777587',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 11,
            fontWeight: 500,
            margin: 8,
          },
        },
        series: [
          {
            name: 'Collected',
            type: 'bar',
            barWidth: 20,
            barGap: '30%',
            itemStyle: {
              color: '#4f46e5',
              borderRadius: [6, 6, 0, 0],
            },
            emphasis: {
              itemStyle: {
                color: '#3525cd',
              },
            },
            data: [13.8, 14.2, 14.5, 14.82, 15.1, 15.6],
          },
          {
            name: 'Overdue',
            type: 'bar',
            barWidth: 20,
            itemStyle: {
              color: '#f43f5e',
              borderRadius: [6, 6, 0, 0],
            },
            emphasis: {
              itemStyle: {
                color: '#e11d48',
              },
            },
            data: [1.8, 1.5, 1.6, 1.42, 1.2, 0.9],
          },
        ],
      };

      this.chartInstance.setOption(option);
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', this.onResize);
      }
    } catch {
      // In environments where canvas rendering fails, handle gracefully
    }
  }

  toggleCollected(): void {
    const nextVal = !this.showCollected();
    this.showCollected.set(nextVal);
    if (this.chartInstance) {
      this.chartInstance.dispatchAction({
        type: 'legendToggleSelect',
        name: 'Collected',
      });
    }
  }

  toggleOverdue(): void {
    const nextVal = !this.showOverdue();
    this.showOverdue.set(nextVal);
    if (this.chartInstance) {
      this.chartInstance.dispatchAction({
        type: 'legendToggleSelect',
        name: 'Overdue',
      });
    }
  }
}
