import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly pageTitle = signal('');
  sidebarCollapsed = signal(false);

  constructor(private router: Router) {
    this.updatePageTitle();
    this.router.events.subscribe(() => {
      this.updatePageTitle();
    });
  }

  private updatePageTitle(): void {
    const url = this.router.url;
    const routeTitleMap: Record<string, string> = {
      '/properties': 'Properties',
      '/dashboard': 'Dashboard',
      '/tenants': 'Tenants',
      '/invoice': 'Invoice',
      '/receipts': 'Receipts',
    };

    const title = Object.entries(routeTitleMap).find(([route]) => url.includes(route))?.[1] || '';
    this.pageTitle.set(title);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((value) => !value);
  }
}
