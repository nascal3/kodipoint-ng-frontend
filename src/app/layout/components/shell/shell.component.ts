import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell-layout">
      <app-sidebar class="shell-sidebar" [(collapsed)]="sidebarCollapsed" />
      <div class="shell-main">
        <app-header
          [pageTitle]="pageTitle"
          [sidebarCollapsed]="sidebarCollapsed()"
          (toggleSidebar)="toggleSidebar()"
        />
        <main class="shell-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }

    .shell-layout {
      display: flex;
      height: 100vh;
      width: 100%;
      background-color: #faf8ff;
      overflow: hidden;
    }

    .shell-sidebar {
      flex-shrink: 0;
      height: 100vh;
      z-index: 20;
    }

    .shell-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      min-width: 0;
      overflow: hidden;
    }

    .shell-content {
      flex: 1;
      padding: 24px 32px;
      overflow-y: auto;
      background-color: #faf8ff;
      box-sizing: border-box;
    }

    @media (max-width: 768px) {
      .shell-content {
        padding: 16px;
      }
    }
  `,
})
export class ShellComponent {
  pageTitle = '';
  readonly sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }
}
