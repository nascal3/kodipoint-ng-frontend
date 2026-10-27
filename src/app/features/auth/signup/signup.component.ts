import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { AuthTokenService } from '@app/core/services/auth-token.service';
import { UserService } from '@app/core/services/user.service';
import { SignupRequest } from '@app/core/models/auth.interface';
import { MATERIAL_MODULES, ErrorStateMatcher } from '@app/shared/material.imports';
import {PasswordStrengthService} from '@app/shared/utils/password-strength.service';

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return !confirmPassword || password === confirmPassword ? null : { passwordMismatch: true };
};

class PasswordMismatchErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: AbstractControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const isSubmitted = form?.submitted ?? false;
    const showControlError = !!control && control.invalid && (control.touched || isSubmitted);
    const showMismatchError =
      !!control?.parent?.hasError('passwordMismatch') &&
      (control.dirty || control.touched || isSubmitted);

    return showControlError || showMismatchError;
  }
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    MATERIAL_MODULES,
    ReactiveFormsModule,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private readonly authService = inject(AuthService);
  private readonly authTokenService = inject(AuthTokenService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  readonly strengthService = inject(PasswordStrengthService);

  readonly passwordVisible = signal(false);
  readonly confirmPasswordVisible = signal(false);
  readonly signupMessage = signal('');
  readonly isSubmitting = signal(false);
  readonly confirmPasswordErrorStateMatcher = new PasswordMismatchErrorStateMatcher();
  readonly signupForm = new FormGroup(
    {
      firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      phone: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/^\+\d{1,3}\d{6,14}$/)
        ],
      }),
      address: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/(?=.*\d)(?=.*[^A-Za-z0-9])/),
        ],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
        updateOn: 'change',
      }),
      terms: new FormControl(false, {
        nonNullable: true,
        validators: [Validators.requiredTrue],
      }),
    },
    { validators: passwordsMatchValidator },
  );

  togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible.update((visible) => !visible);
  }

  onSubmit(): void {
    this.signupForm.markAllAsTouched();
    this.signupMessage.set('');

    if (this.signupForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);

    const signupData: SignupRequest = {
      firstName: this.signupForm.value.firstName!,
      lastName: this.signupForm.value.lastName!,
      email: this.signupForm.value.email!,
      phone: this.signupForm.value.phone!,
      address: this.signupForm.value.address!,
      password: this.signupForm.value.password!,
    };

    this.authService.signup(signupData).subscribe({
      next: (response) => {
        if (response.user) {
          this.userService.setUser(response.user);
        }
        this.authTokenService.setToken(response.accessToken);
        this.router.navigate(['/settings']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        const errorMessage = error.error?.message || error.message || 'Registration failed. Please try again.';
        this.signupMessage.set(errorMessage);
      }
    });
  }

  googleSignUp(): void {
    this.signupMessage.set('');
    this.signupForm.controls.terms.markAsTouched();

    if (!this.signupForm.controls.terms.value) {
      return;
    }

    this.isSubmitting.set(true);
    this.authService.googleLogin();
  }

  onPasswordInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.strengthService.updatePassword(input.value);
  }
}
