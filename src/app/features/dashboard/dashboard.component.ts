import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SummaryCardComponent, SummaryCardData } from './components/summary-card/summary-card.component';
import { FinancialChartComponent } from './components/financial-chart/financial-chart.component';
import { InvoiceTableComponent } from './components/invoice-table/invoice-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    RouterLink,
    RouterLinkActive,
    SummaryCardComponent,
    FinancialChartComponent,
    InvoiceTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <mat-toolbar class="dashboard-header">
        <div class="header-left">
          <mat-icon class="logo-icon">apartment</mat-icon>
          <span class="app-name">KodiPoint</span>
          <span class="divider">|</span>
          <span class="page-title">Dashboard</span>
        </div>
        <div class="header-right">
          <button mat-icon-button aria-label="Notifications">
            <mat-icon>notifications</mat-icon>
          </button>
          <div class="user-info">
            <mat-icon class="user-avatar">account_circle</mat-icon>
            <span class="user-name">John Doe</span>
          </div>
        </div>
      </mat-toolbar>

      <div class="dashboard-content">
        <!-- Sidebar -->
        <mat-sidenav-container class="sidenav-container">
          <mat-sidenav mode="side" [opened]="true" class="dashboard-sidebar">
            <mat-nav-list>
              <a
                mat-list-item
                routerLink="/dashboard"
                routerLinkActive="active"
                class="nav-item"
              >
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>
              <a mat-list-item routerLink="/properties" class="nav-item">
                <mat-icon matListItemIcon>domain</mat-icon>
                <span matListItemTitle>Properties</span>
              </a>
              <a mat-list-item routerLink="/tenants" class="nav-item">
                <mat-icon matListItemIcon>people</mat-icon>
                <span matListItemTitle>Tenants</span>
              </a>
              <a mat-list-item routerLink="/invoices" class="nav-item">
                <mat-icon matListItemIcon>receipt_long</mat-icon>
                <span matListItemTitle>Invoices</span>
              </a>
              <a mat-list-item routerLink="/payments" class="nav-item">
                <mat-icon matListItemIcon>payments</mat-icon>
                <span matListItemTitle>Payments & Receipts</span>
              </a>
              <a mat-list-item routerLink="/analytics" class="nav-item">
                <mat-icon matListItemIcon>analytics</mat-icon>
                <span matListItemTitle>Reports & Analytics</span>
              </a>
              <a mat-list-item routerLink="/performance" class="nav-item">
                <mat-icon matListItemIcon>trending_up</mat-icon>
                <span matListItemTitle>Performance</span>
              </a>
              <a mat-list-item routerLink="/support" class="nav-item">
                <mat-icon matListItemIcon>support_agent</mat-icon>
                <span matListItemTitle>Support</span>
              </a>
            </mat-nav-list>
          </mat-sidenav>

          <mat-sidenav-content class="main-content">
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
          </mat-sidenav-content>
        </mat-sidenav-container>
      </div>
    </div>
  `,
  styles: `
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: var(--mat-sys-surface);
    }

    .dashboard-header {
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

    .dashboard-content {
      flex: 1;
      overflow: hidden;
    }

    .sidenav-container {
      height: 100%;
    }

    .dashboard-sidebar {
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

    .main-content {
      padding: 24px;
      background-color: var(--mat-sys-surface);
      overflow-y: auto;
    }

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
  readonly sidenavOpen = signal(true);

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
