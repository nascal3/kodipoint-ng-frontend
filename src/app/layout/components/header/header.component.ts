import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar class="app-header">
      <div class="header-left">
        <mat-icon class="logo-icon">apartment</mat-icon>
        <span class="app-name">KodiPoint</span>
        @if (pageTitle()) {
          <span class="divider">|</span>
          <span class="page-title">{{ pageTitle() }}</span>
        }
      </div>
      <div class="header-right">
        <button mat-icon-button aria-label="Notifications">
          <mat-icon>notifications</mat-icon>
        </button>
        <div class="user-info">
          <mat-icon class="user-avatar">account_circle</mat-icon>
          <span class="user-name">{{ userName() }}</span>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: `
    .app-header {
      background-color: var(--mat-sys-surface-container);
      color: var(--mat-sys-on-surface);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      padding: 0 24px;
      height: 64px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 28px;
      color: var(--mat-sys-primary);
    }

    .app-name {
      font: var(--mat-sys-title-large);
      font-weight: 600;
      color: var(--mat-sys-primary);
    }

    .divider {
      color: var(--mat-sys-outline-variant);
      margin: 0 8px;
    }

    .page-title {
      font: var(--mat-sys-title-medium);
      color: var(--mat-sys-on-surface-variant);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-left: auto;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-avatar {
      font-size: 32px;
      color: var(--mat-sys-primary);
    }

    .user-name {
      font: var(--mat-sys-body-medium);
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }
  `,
})
export class HeaderComponent {
  readonly pageTitle = input<string | undefined>(undefined);
  readonly userName = input('John Doe');
}
