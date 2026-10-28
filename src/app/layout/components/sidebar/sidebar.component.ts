import { ChangeDetectionStrategy, Component, inject, model, output, signal } from '@angular/core';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '@app/core/services/theme.service';

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
  imports: [...MATERIAL_MODULES, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.collapsed]': 'collapsed()',
  },
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly themeService = inject(ThemeService);
  readonly collapsed = model(false);
  readonly darkMode = this.themeService.darkMode;
  readonly toggleCollapsed = output<void>();

  readonly navSections = signal<NavSection[]>([
    {
      title: 'GENERAL',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
        { path: '/properties', label: 'Properties', icon: 'domain' },
        { path: '/tenants', label: 'Tenants', icon: 'people' },
        { path: '/invoice', label: 'Invoices', icon: 'receipt_long' },
        { path: '/receipts', label: 'Payments & Receipts', icon: 'payments' },
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
    this.collapsed.update((value) => !value);
    this.toggleCollapsed.emit();
  }

  toggleDarkMode(): void {
    this.themeService.toggle();
  }
}
