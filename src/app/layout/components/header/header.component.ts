import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { UserService } from '@app/core/services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MATERIAL_MODULES],
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
