import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { type SummaryCardData } from '../../models/dashboard.model';

export type { SummaryCardData };

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card appearance="outlined" class="summary-card">
      <mat-card-content class="card-content">
        <div class="card-header">
          <div class="title-value-group">
            <span class="card-title">{{ data().title }}</span>
            <div class="card-value-container">
              <span class="card-value">{{ data().value }}</span>
              @if (data().unitDetail) {
                <span class="unit-detail">{{ data().unitDetail }}</span>
              }
            </div>
          </div>
          <div class="icon-bubble" [class]="'icon-' + data().iconType">
            <mat-icon class="card-icon">{{ data().icon }}</mat-icon>
          </div>
        </div>

        <div class="card-footer">
          @if (data().footerType === 'calendar') {
            <div class="footer-calendar">
              <mat-icon class="footer-icon">calendar_today</mat-icon>
              <span class="footer-text">{{ data().footerText }}</span>
            </div>
          } @else if (data().footerType === 'badge') {
            <div class="footer-badge">
              <span class="status-pill">
                @if (data().badgeIcon) {
                  <mat-icon class="badge-icon">{{ data().badgeIcon }}</mat-icon>
                }
                <span>{{ data().footerText }}</span>
              </span>
            </div>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .summary-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      height: 100%;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease-in-out;
    }

    .summary-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
      border-color: #cbd5e1;
    }

    .card-content {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      box-sizing: border-box;
      gap: 16px;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .title-value-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .card-title {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #64748b;
    }

    .card-value-container {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .card-value {
      font-size: 26px;
      font-weight: 700;
      line-height: 1.2;
      color: #0f172a;
    }

    .unit-detail {
      font-size: 18px;
      font-weight: 400;
      color: #64748b;
    }

    .icon-bubble {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-bubble mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .icon-primary {
      background-color: #e0e7ff;
      color: #4f46e5;
    }

    .icon-secondary {
      background-color: #d1fae5;
      color: #059669;
    }

    .icon-error {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .card-footer {
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
    }

    .footer-calendar {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .footer-icon {
      font-size: 15px;
      width: 15px;
      height: 15px;
      color: #4f46e5;
    }

    .footer-text {
      font-size: 13px;
      color: #64748b;
      font-weight: 400;
    }

    .footer-badge {
      display: flex;
      align-items: center;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background-color: #d1fae5;
      color: #065f46;
      font-size: 12px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 9999px;
    }

    .badge-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #059669;
    }
  `,
})
export class SummaryCardComponent {
  readonly data = input.required<SummaryCardData>();
}
