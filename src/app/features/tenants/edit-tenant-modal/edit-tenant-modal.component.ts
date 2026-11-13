import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MATERIAL_MODULES} from '@app/shared/material.imports';
import {SnackbarService} from '@app/shared/components/snackbar/snackbar.service';
import {Tenant, TenantStatus, UpdateTenantRequest} from '../models/tenants.interface';
import {TenantsService} from '../services/tenants.service';

@Component({
  selector: 'app-edit-tenant-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-tenant-modal.component.html',
  styleUrl: '../register-tenant-modal/register-tenant-modal.component.scss',
})
export class EditTenantModalComponent {
  private readonly tenantsService = inject(TenantsService);
  private readonly snackbarService = inject(SnackbarService);

  @Input({required: true}) tenant!: Tenant;
  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly saved = new EventEmitter<void>();

  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  readonly statusOptions: TenantStatus[] = ['ACTIVE', 'NOTICE', 'ENDED'];
  readonly tenantForm = new FormGroup({
    firstName: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)]}),
    lastName: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)]}),
    email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\+\d{1,3}\d{6,14}$/)]
    }),
    identificationDoc: new FormControl<'NATIONAL_ID' | 'PASSPORT'>('NATIONAL_ID', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    identificationDocNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    address: new FormControl('', {nonNullable: true}),
    emergencyContactName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)]
    }),
    emergencyContactPhone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\+\d{1,3}\d{6,14}$/)]
    }),
    emergencyContactRelationship: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)]
    }),
    status: new FormControl<TenantStatus>('ACTIVE', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnInit(): void {
    this.tenantForm.patchValue({
      firstName: this.tenant.firstName,
      lastName: this.tenant.lastName,
      email: this.tenant.email,
      phone: this.tenant.phone,
      identificationDoc: this.tenant.identificationDoc ?? 'NATIONAL_ID',
      identificationDocNumber: this.tenant.identificationDocNumber ?? '',
      address: this.tenant.address,
      emergencyContactName: this.tenant.emergencyContactName,
      emergencyContactPhone: this.tenant.emergencyContactPhone,
      emergencyContactRelationship: this.tenant.emergencyContactRelationship,
      status: this.isTenantStatus(this.tenant.status) ? this.tenant.status : 'ACTIVE',
    });
  }

  close(): void {
    if (this.isSubmitting()) return;
    this.closed.emit();
  }

  updateTenant(): void {
    if (this.isSubmitting()) return;
    if (this.tenantForm.invalid) {
      this.tenantForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submissionError.set('');
    const formValue = this.tenantForm.getRawValue();
    const update: UpdateTenantRequest = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      email: formValue.email.trim(),
      phone: formValue.phone.trim(),
      identificationDoc: formValue.identificationDoc,
      identificationDocNumber: formValue.identificationDocNumber.trim(),
      address: formValue.address.trim(),
      emergencyContactName: formValue.emergencyContactName.trim(),
      emergencyContactPhone: formValue.emergencyContactPhone.trim(),
      emergencyContactRelationship: formValue.emergencyContactRelationship.trim(),
      status: formValue.status,
    };

    this.tenantsService.updateTenant(this.tenant.id, update).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.snackbarService.success('Tenant updated successfully.');
        this.saved.emit();
      },
      error: (error: any) => {
        console.error('Failed to update tenant:', error);
        this.isSubmitting.set(false);
        this.submissionError.set(error.error?.message || 'Could not update tenant. Please check the details and try again.');
        this.snackbarService.error(error.error?.message || 'Could not update tenant. Please try again.');
      },
    });
  }

  private isTenantStatus(status: string): status is TenantStatus {
    return this.statusOptions.includes(status as TenantStatus);
  }
}
