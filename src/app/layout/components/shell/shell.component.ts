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
    if (url.includes('/properties')) {
      this.pageTitle.set('Properties');
    } else if (url.includes('/dashboard')) {
      this.pageTitle.set('Dashboard');
    }else if (url.includes('/tenants')) {
      this.pageTitle.set('Tenants');
    } else {
      this.pageTitle.set('');
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((value) => !value);
  }
}
