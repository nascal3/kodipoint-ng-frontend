import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthTokenService } from '../../../core/services/auth-token.service';
import {AuthService} from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authTokenService = inject(AuthTokenService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  readonly passwordVisible = signal(false);
  readonly signInMessage = signal('');
  readonly isSubmitting = signal(false);
  readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  onSubmit(): void {
    this.loginForm.markAllAsTouched();
    this.signInMessage.set('');

    if (this.loginForm.invalid) {
      return;
    }

    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.authService.signin(this.loginForm.getRawValue())
      .subscribe({
        next: (response) => {
          if (!response?.accessToken) {
            this.signInMessage.set('The login response did not include an access token.');
            this.isSubmitting.set(false);
            return;
          }

          if (response.user) {
            this.userService.setUser(response.user);
          }

          this.authTokenService.setToken(response.accessToken);
          void this.router.navigate(['/dashboard']);
        },
        error: (error: unknown) => {
          this.signInMessage.set(this.getLoginErrorMessage(error));
          this.isSubmitting.set(false);
        },
      });
  }

  showUnavailableMessage(): void {
    this.signInMessage.set('Authentication is not configured yet.');
  }

  private getLoginErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && typeof error.error === 'object' && error.error !== null) {
      const response = error.error as { message?: unknown; details?: unknown };
      if (typeof response.message === 'string') {
        return response.message;
      }
      if (typeof response.details === 'string') {
        return response.details;
      }
    }

    return 'Unable to sign in. Please check your connection and try again.';
  }
}
