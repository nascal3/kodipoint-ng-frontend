import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {SettingsService} from '../../services/settings.service';
import {UserProfileResponse} from '../../models/settings.interface';

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return !confirmPassword || newPassword === confirmPassword ? null : { passwordMismatch: true };
};

class PasswordMismatchErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: AbstractControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const isSubmitted = form?.submitted ?? false;
    const showControlError =
      !!control && control.invalid && (control.dirty || control.touched || isSubmitted);
    const showMismatchError =
      !!control?.parent?.hasError('passwordMismatch') &&
      (control.dirty || control.touched || isSubmitted);

    return showControlError || showMismatchError;
  }
}

class ProfileErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: AbstractControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const isSubmitted = form?.submitted ?? false;
    return !!control && control.invalid && (control.dirty || control.touched || isSubmitted);
  }
}



@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.scss',
})
export class ProfileSettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);

  readonly profileSubmitted = signal(false);
  readonly passwordSubmitted = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly profileErrorStateMatcher = new ProfileErrorStateMatcher();
  readonly confirmPasswordErrorStateMatcher = new PasswordMismatchErrorStateMatcher();
  readonly profileForm = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\+\d[\d\s-]{6,17}$/)],
    }),
    organization: new FormControl(''),
    address: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  readonly passwordForm = new FormGroup(
    {
      newPassword: new FormControl('', {
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
      }),
    },
    { validators: passwordsMatchValidator },
  );

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.settingsService.loadUserProfile().subscribe({
      next: (user: UserProfileResponse) => {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          organization: user.organization || '',
          address: user.address,
        });
      },
      error: (error: unknown) => {
        console.error('Failed to load user profile:', error);
      },
    });
  }

  validateProfile(): void {
    this.profileSubmitted.set(true);
    this.profileForm.markAllAsTouched();
  }

  validatePassword(): void {
    this.passwordSubmitted.set(true);
    this.passwordForm.markAllAsTouched();
  }

  showProfileError(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched || this.profileSubmitted());
  }

  showPasswordError(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched || this.passwordSubmitted());
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((value) => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((value) => !value);
  }
}
