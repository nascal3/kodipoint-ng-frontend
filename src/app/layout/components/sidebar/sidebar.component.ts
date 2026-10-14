import { ChangeDetectionStrategy, Component, model, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
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
    this.collapsed.update((value) => !value);
    this.toggleCollapsed.emit();
  }
}
