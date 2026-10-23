import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
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
import { MATERIAL_MODULES, ErrorStateMatcher } from '../../../../shared/material.imports';
import { finalize } from 'rxjs';
import { SnackbarService } from '../../../../shared/components/snackbar/snackbar.service';
import {SettingsService} from '../../services/settings.service';
import {UserProfileResponse, UpdateProfileRequest, ChangePasswordRequest} from '../../models/settings.interface';
import {PasswordStrengthService} from '../../../../shared/utils/password-strength.service';

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
    ...MATERIAL_MODULES,
    ReactiveFormsModule,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.scss',
})
export class ProfileSettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);
  private readonly snackbarService = inject(SnackbarService);
  readonly strengthService = inject(PasswordStrengthService);

  readonly profileSubmitted = signal(false);
  readonly isUpdatingProfile = signal(false);
  readonly passwordSubmitted = signal(false);
  readonly isChangingPassword = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly userProfile = signal<UserProfileResponse | null>(null);
  readonly profileInitials = computed(() => {
    const user = this.userProfile();
    return user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '';
  });
  readonly profileName = computed(() => {
    const user = this.userProfile();
    return user ? `${user.firstName} ${user.lastName}`.trim() : '';
  });
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
      currentPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
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
        this.userProfile.set(user);
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
            this.userProfile.set(updatedUser);
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
            const message =
              error instanceof HttpErrorResponse && typeof error.error?.message === 'string'
                ? error.error.message
                : 'Failed to update profile. Please try again.';
            this.snackbarService.error(message);
          },
        });
    }
  }

  changePassword(): void {
    this.passwordSubmitted.set(true);
    this.passwordForm.markAllAsTouched();

    if (this.passwordForm.valid && !this.isChangingPassword()) {
      const formValue = this.passwordForm.getRawValue();
      const passwordData: ChangePasswordRequest = {
        currentPassword: formValue.currentPassword,
        newPassword: formValue.newPassword,
      };

      this.isChangingPassword.set(true);
      this.settingsService
        .changePassword(passwordData)
        .pipe(finalize(() => this.isChangingPassword.set(false)))
        .subscribe({
          next: (updatedUser: UserProfileResponse) => {
            this.userProfile.set(updatedUser);
            this.passwordForm.reset();
            this.passwordForm.markAsPristine();
            this.passwordForm.markAsUntouched();
            this.passwordSubmitted.set(false);
            this.snackbarService.success('Password changed successfully.');
          },
          error: (error: unknown) => {
            const message =
              error instanceof HttpErrorResponse && typeof error.error?.message === 'string'
                ? error.error.message
                : 'Failed to change password. Please try again.';
            this.snackbarService.error(message);
          },
        });
    }
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

  onPasswordInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.strengthService.updatePassword(input.value);
  }
}
