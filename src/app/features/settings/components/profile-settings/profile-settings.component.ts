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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { SnackbarService } from '../../../../shared/components/snackbar/snackbar.service';
import {SettingsService} from '../../services/settings.service';
import {UserProfileResponse, UpdateProfileRequest} from '../../models/settings.interface';

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
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.scss',
})
export class ProfileSettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);
  private readonly snackbarService = inject(SnackbarService);

  readonly profileSubmitted = signal(false);
  readonly isUpdatingProfile = signal(false);
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
    organization: new FormControl('', {
      nonNullable: true
    }),
    address: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    billingAddress: new FormControl('', {
      nonNullable: true
    }),
    billingEmail: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email],
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
          billingAddress: user.billingAddress || '',
          billingEmail: user.billingEmail || '',
        });
      },
      error: (error: unknown) => {
        console.error('Failed to load user profile:', error);
      },
    });
  }

  updateProfile(): void {
    this.profileSubmitted.set(true);
    this.profileForm.markAllAsTouched();

    if (this.profileForm.valid && !this.isUpdatingProfile()) {
      const formValue = this.profileForm.getRawValue();
      const profileData: UpdateProfileRequest = {
        email: formValue.email,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        address: formValue.address,
        phone: formValue.phone,
        organization: formValue.organization || '',
        billingAddress: formValue.billingAddress|| '',
        billingEmail: formValue.billingEmail || '',
      };

      this.isUpdatingProfile.set(true);
      this.settingsService
        .updateProfile(profileData)
        .pipe(finalize(() => this.isUpdatingProfile.set(false)))
        .subscribe({
          next: (updatedUser: UserProfileResponse) => {
            this.profileForm.patchValue({
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              email: updatedUser.email,
              phone: updatedUser.phone,
              organization: updatedUser.organization || '',
              address: updatedUser.address,
              billingAddress: updatedUser.billingAddress || '',
              billingEmail: updatedUser.billingEmail || '',
            });
            this.snackbarService.success('Profile updated successfully.');
          },
          error: (error: unknown) => {
            this.snackbarService.error('Failed to update profile. Please try again.');
          },
        });
    }
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
