import { ChangeDetectionStrategy, Component, model, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.collapsed]': 'collapsed()',
  },
  template: `
    <aside class="sidebar" [class.is-collapsed]="collapsed()" aria-label="Main Navigation">
      <!-- Sidebar Brand Header -->
      <div class="sidebar-header">
        @if (!collapsed()) {
          <a routerLink="/dashboard" class="brand-link" aria-label="KodiPoint Home">
            <svg
              class="brand-logo"
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M14 2L24 7.5V18.5L14 24L4 18.5V7.5L14 2Z" fill="#EEF2FF" />
              <path d="M14 2L24 7.5L14 13L4 7.5L14 2Z" fill="#6366F1" />
              <path d="M4 7.5L14 13V24L4 18.5V7.5Z" fill="#4338CA" />
              <path d="M24 7.5L14 13V24L24 18.5V7.5Z" fill="#4F46E5" />
            </svg>
            <span class="brand-name">kodipoint</span>
          </a>

          <button
            mat-icon-button
            class="toggle-btn"
            (click)="toggleCollapse()"
            aria-label="Collapse sidebar"
            type="button"
          >
            <mat-icon class="toggle-icon">segment</mat-icon>
          </button>
        } @else {
          <a
            routerLink="/dashboard"
            class="brand-logo-collapsed"
            aria-label="KodiPoint Home"
            matTooltip="KodiPoint"
            matTooltipPosition="right"
          >
            <div class="logo-box">
              <svg
                class="brand-logo-white"
                width="22"
                height="22"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M14 2L24 7.5V18.5L14 24L4 18.5V7.5L14 2Z"
                  fill="#EEF2FF"
                  fill-opacity="0.3"
                />
                <path d="M14 2L24 7.5L14 13L4 7.5L14 2Z" fill="#FFFFFF" fill-opacity="0.95" />
                <path d="M4 7.5L14 13V24L4 18.5V7.5Z" fill="#FFFFFF" fill-opacity="0.8" />
                <path d="M24 7.5L14 13V24L24 18.5V7.5Z" fill="#FFFFFF" />
              </svg>
            </div>
          </a>
        }
      </div>

      <!-- Navigation Sections -->
      <nav class="sidebar-nav">
        @for (section of navSections(); track section.title) {
          <div class="nav-section">
            @if (!collapsed()) {
              <h2 class="section-title">{{ section.title }}</h2>
            }
            <ul class="nav-list">
              @for (item of section.items; track item.path) {
                <li class="nav-list-item">
                  <a
                    [routerLink]="item.path"
                    [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                    routerLinkActive="active"
                    class="nav-link"
                    [matTooltip]="item.label"
                    [matTooltipDisabled]="!collapsed()"
                    matTooltipPosition="right"
                  >
                    <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                    @if (!collapsed()) {
                      <span class="nav-label">{{ item.label }}</span>
                    }
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </nav>
    </aside>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      width: 250px;
      transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :host.collapsed {
      width: 72px;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background-color: #ffffff;
      border-right: 1px solid #e2e8f0;
      box-sizing: border-box;
      padding: 20px 16px;
      overflow-y: auto;
      overflow-x: hidden;
      transition: padding 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar.is-collapsed {
      padding: 20px 10px;
      align-items: center;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 4px 20px 4px;
      margin-bottom: 8px;
      min-height: 40px;
    }

    .sidebar.is-collapsed .sidebar-header {
      justify-content: center;
      padding: 0 0 20px 0;
      width: 100%;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: #0f172a;
    }

    .brand-logo-collapsed {
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
    }

    .logo-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
      transition: transform 0.15s ease-in-out;
    }

    .logo-box:hover {
      transform: scale(1.04);
    }

    .brand-logo {
      width: 28px;
      height: 28px;
      flex-shrink: 0;
    }

    .brand-logo-white {
      width: 22px;
      height: 22px;
    }

    .brand-name {
      font-size: 19px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #0f172a;
      line-height: 1;
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

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 100%;
    }

    .sidebar.is-collapsed .sidebar-nav {
      gap: 8px;
      align-items: center;
    }

    .nav-section {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      margin: 0;
      padding: 6px 12px;
      white-space: nowrap;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
    }

    .sidebar.is-collapsed .nav-list {
      gap: 6px;
      align-items: center;
    }

    .nav-list-item {
      margin: 0;
      padding: 0;
      width: 100%;
      display: flex;
    }

    .sidebar.is-collapsed .nav-list-item {
      justify-content: center;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      text-decoration: none;
      color: #334155;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s ease-in-out;
      box-sizing: border-box;
      width: 100%;
    }

    .sidebar.is-collapsed .nav-link {
      justify-content: center;
      width: 44px;
      height: 44px;
      padding: 0;
      gap: 0;
    }

    .nav-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #64748b;
      transition: color 0.15s ease-in-out;
      flex-shrink: 0;
    }

    .nav-label {
      line-height: 1.2;
      white-space: nowrap;
    }

    .nav-link:hover:not(.active) {
      background-color: #f8fafc;
      color: #0f172a;

      .nav-icon {
        color: #334155;
      }
    }

    .nav-link.active {
      background-color: #ede9fe;
      color: #4f46e5;
      font-weight: 600;

      .nav-icon {
        color: #4f46e5;
      }
    }
  `,
})
export class SidebarComponent {
  readonly collapsed = model(false);
  readonly toggleCollapsed = output<void>();

  readonly navSections = signal<NavSection[]>([
    {
      title: 'GENERAL',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
        { path: '/properties', label: 'Properties', icon: 'domain' },
        { path: '/tenants', label: 'Tenants', icon: 'people' },
        { path: '/invoices', label: 'Invoices', icon: 'receipt_long' },
        { path: '/payments', label: 'Payments & Receipts', icon: 'payments' },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        { path: '/analytics', label: 'Reports & Analytics', icon: 'bar_chart' },
        { path: '/performance', label: 'Performance', icon: 'trending_up' },
      ],
    },
    {
      title: 'OTHER',
      items: [{ path: '/support', label: 'Support', icon: 'help_outline' }],
    },
  ]);

  toggleCollapse(): void {
    this.collapsed.update((v) => !v);
    this.toggleCollapsed.emit();
  }
}
