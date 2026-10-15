import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCheckboxModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  readonly passwordVisible = signal(false);
  readonly signInMessage = signal('');

  togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  showUnavailableMessage(): void {
    this.signInMessage.set('Authentication is not configured yet.');
  }
}
