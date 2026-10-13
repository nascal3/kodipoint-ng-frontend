import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, HeaderComponent, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell-container">
      <app-header [pageTitle]="pageTitle" />
      <mat-sidenav-container class="sidenav-container">
        <app-sidebar />
        <mat-sidenav-content class="main-content">
          <router-outlet />
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: `
    .shell-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: var(--mat-sys-surface);
    }

    .sidenav-container {
      flex: 1;
      height: calc(100vh - 64px);
    }

    .main-content {
      padding: 24px;
      background-color: var(--mat-sys-surface);
      overflow-y: auto;
    }
  `,
})
export class ShellComponent {
  pageTitle = '';
}
