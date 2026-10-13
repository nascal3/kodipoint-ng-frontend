import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatSidenavModule, MatListModule, MatIconModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-sidenav mode="side" [opened]="sidenavOpen()" class="app-sidebar">
      <mat-nav-list>
        @for (item of navItems(); track item.path) {
          <a
            mat-list-item
            [routerLink]="item.path"
            routerLinkActive="active"
            class="nav-item"
          >
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </a>
        }
      </mat-nav-list>
    </mat-sidenav>
  `,
  styles: `
    .app-sidebar {
      width: 260px;
      background-color: var(--mat-sys-surface-container);
      border-right: 1px solid var(--mat-sys-outline-variant);
    }

    .nav-item {
      font: var(--mat-sys-body-large);
      color: var(--mat-sys-on-surface-variant);
      margin: 4px 12px;
      border-radius: 8px;
    }

    .nav-item.active {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }

    .nav-item:hover:not(.active) {
      background-color: var(--mat-sys-surface-variant);
    }
  `,
})
export class SidebarComponent {
  readonly sidenavOpen = signal(true);

  readonly navItems = signal<NavItem[]>([
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/properties', label: 'Properties', icon: 'domain' },
    { path: '/tenants', label: 'Tenants', icon: 'people' },
    { path: '/invoices', label: 'Invoices', icon: 'receipt_long' },
    { path: '/payments', label: 'Payments & Receipts', icon: 'payments' },
    { path: '/analytics', label: 'Reports & Analytics', icon: 'analytics' },
    { path: '/performance', label: 'Performance', icon: 'trending_up' },
    { path: '/support', label: 'Support', icon: 'support_agent' },
  ]);
}
