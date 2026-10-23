import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthTokenService } from '@app/core/services/auth-token.service';
import {UserService} from '@app/core/services/user.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly authTokenService = inject(AuthTokenService);

  readonly pageTitle = signal('');
  sidebarCollapsed = signal(false);

  constructor() {
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
      '/settings': 'SettingsService',
    };

    const title = Object.entries(routeTitleMap).find(([route]) => url.includes(route))?.[1] || '';
    this.pageTitle.set(title);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((value) => !value);
  }

  logout(): void {
    this.authTokenService.removeToken();
    this.userService.clearUser();
    this.router.navigate(['/login']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }
}
