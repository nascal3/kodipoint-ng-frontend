import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MATERIAL_MODULES } from '@app/shared/material.imports';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-settings.component.html',
  styleUrl: './notification-settings.component.scss',
})
export class NotificationSettingsComponent {}
