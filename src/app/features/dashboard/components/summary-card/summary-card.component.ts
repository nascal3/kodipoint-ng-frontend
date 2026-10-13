import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface SummaryCardData {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
}

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card appearance="outlined" class="summary-card">
      <mat-card-content class="card-content">
        <div class="card-header">
          <mat-icon class="card-icon">{{ data().icon }}</mat-icon>
          <span class="card-title">{{ data().title }}</span>
        </div>
        <div class="card-value">{{ data().value }}</div>
        @if (data().subtitle) {
          <div class="card-subtitle">{{ data().subtitle }}</div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .summary-card {
      background-color: var(--mat-sys-surface-container);
      border-color: var(--mat-sys-outline-variant);
      border-radius: 16px;
      height: 100%;
    }

    .card-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: var(--mat-sys-primary);
    }

    .card-title {
      font: var(--mat-sys-label-large);
      color: var(--mat-sys-on-surface-variant);
    }

    .card-value {
      font: var(--mat-sys-headline-medium);
      color: var(--mat-sys-on-surface);
      font-weight: 500;
    }

    .card-subtitle {
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class SummaryCardComponent {
  readonly data = input.required<SummaryCardData>();
}
