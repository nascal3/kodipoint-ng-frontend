import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <div class="header-left">
        @if (sidebarCollapsed()) {
          <button
            mat-icon-button
            class="toggle-btn"
            (click)="toggleSidebar.emit()"
            aria-label="Expand sidebar"
            type="button"
          >
            <mat-icon class="toggle-icon">segment</mat-icon>
          </button>
        }

        <!-- Breadcrumbs -->
        <nav class="breadcrumb-nav" aria-label="Breadcrumb">
          <span class="breadcrumb-root">KodiPoint</span>
          <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
          <span class="breadcrumb-current">{{ pageTitle() || 'Dashboard' }}</span>
        </nav>
      </div>

      <!-- Right Actions: Notifications & User Profile -->
      <div class="header-actions">
        <button mat-icon-button class="notification-btn" aria-label="Notifications" type="button">
          <mat-icon class="bell-icon">notifications_none</mat-icon>
          <span class="notification-dot" aria-hidden="true"></span>
        </button>

        <button
          type="button"
          class="user-profile-trigger"
          [matMenuTriggerFor]="profileMenu"
          aria-label="User profile menu"
        >
          <div class="user-avatar-bubble">
            <span class="avatar-initials">{{ userInitials() }}</span>
          </div>
          <span class="user-name">{{ userName() }}</span>
          <mat-icon class="chevron-icon">keyboard_arrow_down</mat-icon>
        </button>

        <mat-menu #profileMenu="matMenu" class="user-profile-menu-panel" xPosition="before">
          <div class="profile-menu-header" (click)="$event.stopPropagation()">
            <div class="header-name">{{ userName() }}</div>
            <div class="header-email">{{ userEmail() }}</div>
          </div>
          <mat-divider class="menu-divider" />
          <button mat-menu-item class="profile-menu-item" (click)="profileSelected.emit()">
            <mat-icon>person_outline</mat-icon>
            <span>Profile</span>
          </button>
          <button mat-menu-item class="profile-menu-item" (click)="settingsSelected.emit()">
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </button>
          <mat-divider class="menu-divider" />
          <button mat-menu-item class="profile-menu-item logout-item" (click)="logout.emit()">
            <mat-icon>logout</mat-icon>
            <span class="logout-text">Logout</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .app-header {
      background-color: #ffffff;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 32px 0 20px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toggle-btn {
      color: #64748b;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
    }

    .breadcrumb-root {
      color: #475569;
      font-weight: 500;
    }

    .breadcrumb-separator {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #94a3b8;
    }

    .breadcrumb-current {
      color: #4f46e5;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .notification-btn {
      position: relative;
      color: #64748b;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bell-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .notification-dot {
      position: absolute;
      top: 9px;
      right: 10px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #ef4444;
      border: 1.5px solid #ffffff;
    }

    .user-profile-trigger {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
      padding: 4px 12px 4px 6px;
      border-radius: 9999px;
      border: 1.5px solid #dcd7fe;
      background-color: #ffffff;
      height: 42px;
      min-width: 0;
      box-sizing: border-box;
      font-family: inherit;
      outline: none;
      transition:
        background-color 0.15s ease-in-out,
        border-color 0.15s ease-in-out;
    }

    .user-profile-trigger:focus-visible {
      outline: 2px solid #4f46e5;
      outline-offset: 2px;
    }

    .user-profile-trigger:hover {
      background-color: #f8fafc;
      border-color: #c7d2fe;
    }

    .user-avatar-bubble {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #2b22c6;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .avatar-initials {
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }

    .chevron-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #64748b;
    }
  `,
})
export class HeaderComponent {
  readonly pageTitle = input<string | undefined>(undefined);
  readonly userName = input('John Doe');
  readonly userEmail = input('john.doe@estateops.com');
  readonly userInitials = input('JD');
  readonly sidebarCollapsed = input(false);
  readonly toggleSidebar = output<void>();
  readonly profileSelected = output<void>();
  readonly settingsSelected = output<void>();
  readonly logout = output<void>();
}
