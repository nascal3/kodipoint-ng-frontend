import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly userService = inject(UserService);

  readonly pageTitle = input<string | undefined>(undefined);
  readonly userName = this.userService.userName;
  readonly userEmail = this.userService.userEmail;
  readonly userInitials = this.userService.userInitials;
  readonly sidebarCollapsed = input(false);
  readonly toggleSidebar = output<void>();
  readonly profileSelected = output<void>();
  readonly settingsSelected = output<void>();
  readonly logout = output<void>();
}
