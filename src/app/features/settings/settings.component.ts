import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { AgencySettingsComponent } from './components/agency-settings/agency-settings.component';
import { NotificationSettingsComponent } from './components/notification-settings/notification-settings.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatTabsModule,
    ProfileSettingsComponent,
    NotificationSettingsComponent,
    AgencySettingsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {}
