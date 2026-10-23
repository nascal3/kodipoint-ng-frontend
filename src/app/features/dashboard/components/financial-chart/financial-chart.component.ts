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
import * as echarts from 'echarts';
import { DATE_RANGE_DATE_PROVIDERS } from '../date-range-date-adapter';
import { MATERIAL_MODULES } from '@app/shared/material.imports';

@Component({
  selector: 'app-financial-chart',
  standalone: true,
  imports: [MATERIAL_MODULES],
  providers: DATE_RANGE_DATE_PROVIDERS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './financial-chart.component.html',
  styleUrl: './financial-chart.component.scss',
})
export class FinancialChartComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');

  private chartInstance: echarts.ECharts | null = null;

  readonly maxDate = new Date();
  readonly dateRangeStart = signal<Date | null>(new Date(this.maxDate.getFullYear(), 6, 1));
  readonly dateRangeEnd = signal<Date | null>(this.maxDate);
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
    const element = this.chartContainer()?.nativeElement;
    if (!element) {
      return;
    }

    if (typeof document !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        if (!canvas.getContext || !canvas.getContext('2d')) {
          return;
        }
      } catch {
        return;
      }
    }

    try {
      this.chartInstance = echarts.init(element);

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
            if (!Array.isArray(params) || params.length === 0) {
              return '';
            }
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
    const nextValue = !this.showCollected();
    this.showCollected.set(nextValue);
    if (this.chartInstance) {
      this.chartInstance.dispatchAction({
        type: 'legendToggleSelect',
        name: 'Collected',
      });
    }
  }

  toggleOverdue(): void {
    const nextValue = !this.showOverdue();
    this.showOverdue.set(nextValue);
    if (this.chartInstance) {
      this.chartInstance.dispatchAction({
        type: 'legendToggleSelect',
        name: 'Overdue',
      });
    }
  }
}
