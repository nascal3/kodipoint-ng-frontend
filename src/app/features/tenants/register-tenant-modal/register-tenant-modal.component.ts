import {ChangeDetectionStrategy, Component, EventEmitter, Output, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MATERIAL_MODULES} from '@app/shared/material.imports';
import {SnackbarService} from '@app/shared/components/snackbar/snackbar.service';
import {CreateTenantRequest} from '../models/tenants.interface';
import {TenantsService} from '../services/tenants.service';

@Component({
  selector: 'app-register-tenant-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register-tenant-modal.component.html',
  styleUrl: './register-tenant-modal.component.scss',
})
export class RegisterTenantModalComponent {
  private readonly tenantsService = inject(TenantsService);
  private readonly snackbarService = inject(SnackbarService);

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly created = new EventEmitter<void>();

  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  readonly tenantForm = new FormGroup({
    firstName: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)]}),
    lastName: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)]}),
    email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
    phone: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)]}),
    address: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)]}),
    emergencyContactName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)]
    }),
    emergencyContactPhone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)]
    }),
    emergencyContactRelationship: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)]
    }),
  });

  close(): void {
    if (this.isSubmitting()) return;
    this.closed.emit();
  }

  registerTenant(): void {
    if (this.isSubmitting()) return;
    if (this.tenantForm.invalid) {
      this.tenantForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submissionError.set('');
    const formValue = this.tenantForm.getRawValue();
    const tenant: CreateTenantRequest = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      email: formValue.email.trim(),
      phone: formValue.phone.trim(),
      address: formValue.address.trim(),
      emergencyContactName: formValue.emergencyContactName.trim(),
      emergencyContactPhone: formValue.emergencyContactPhone.trim(),
      emergencyContactRelationship: formValue.emergencyContactRelationship.trim(),
    };

    this.tenantsService.createTenant(tenant).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.snackbarService.success('Tenant registered successfully.');
        this.created.emit();
      },
      error: (error) => {
        console.error('Failed to register tenant:', error);
        this.isSubmitting.set(false);
        this.submissionError.set('Could not register tenant. Please check the details and try again.');
        this.snackbarService.error('Could not register tenant. Please try again.');
      },
    });
  }
}
