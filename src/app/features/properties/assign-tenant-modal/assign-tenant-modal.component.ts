import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { EMPTY, catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { PropertyItem, PropertyUnit } from '@app/features/properties/models/properties.models';
import { TenantSearchResult, TenancyStatus } from '@app/features/tenants/models/tenants.interface';
import { TenantsService } from '@app/features/tenants/services/tenants.service';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';

@Component({
  selector: 'app-assign-tenant-modal',
  standalone: true,
  imports: [DecimalPipe, MatAutocompleteModule, ReactiveFormsModule, ...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './assign-tenant-modal.component.html',
  styleUrl: './assign-tenant-modal.component.scss',
})
export class AssignTenantModalComponent implements OnInit {
  private readonly tenantsService = inject(TenantsService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly destroyRef = inject(DestroyRef);

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly assigned = new EventEmitter<void>();

  readonly property = input.required<PropertyItem>();
  readonly unit = input.required<PropertyUnit>();
  readonly tenants = signal<TenantSearchResult[]>([]);
  readonly isLoadingTenants = signal(false);
  readonly tenantsError = signal('');
  readonly isSubmitting = signal(false);
  readonly formError = signal('');
  readonly statusOptions: { value: TenancyStatus; label: string }[] = [
    { value: 'ACTIVE', label: 'Active (Lease Incepted)' },
    { value: 'NOTICE', label: 'Notice' },
    { value: 'ENDED', label: 'Ended' },
  ];
  readonly form = new FormGroup({
    tenantId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    startDate: new FormControl<Date | null>(new Date(), { validators: Validators.required }),
    status: new FormControl<TenancyStatus>('ACTIVE', { nonNullable: true, validators: Validators.required }),
    notes: new FormControl('', { nonNullable: true }),
  });
  readonly tenantSearchControl = new FormControl<string | TenantSearchResult>('', { nonNullable: true });

  ngOnInit(): void {
    this.tenantSearchControl.valueChanges.pipe(
      tap((value) => {
        if (typeof value === 'string') {
          this.form.controls.tenantId.setValue('');
          this.tenantsError.set('');
        }
      }),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        if (typeof value !== 'string') return EMPTY;
        const query = value.trim();
        if (query.length < 2) {
          this.tenants.set([]);
          this.isLoadingTenants.set(false);
          return EMPTY;
        }

        this.isLoadingTenants.set(true);
        this.tenantsError.set('');
        return this.tenantsService.searchTenants(query, 1, 10).pipe(
          catchError((error: unknown) => {
            console.error('Failed to search tenants for assignment:', error);
            this.tenants.set([]);
            this.tenantsError.set(this.errorMessage(error, 'Could not search tenants. Please try again.'));
            this.snackbarService.error(this.tenantsError());
            this.isLoadingTenants.set(false);
            return EMPTY;
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((response) => {
      this.tenants.set(response.data);
      this.isLoadingTenants.set(false);
    });
  }

  close(): void {
    if (!this.isSubmitting()) this.closed.emit();
  }

  tenantName(tenant: TenantSearchResult): string {
    return `${tenant.firstName} ${tenant.lastName}`;
  }

  displayTenant = (value: string | TenantSearchResult | null): string => {
    if (!value) return '';
    return typeof value === 'string'
      ? value
      : `${this.tenantName(value)} — ${value.email} (${value.phone})`;
  };

  selectTenant(tenant: TenantSearchResult): void {
    this.form.controls.tenantId.setValue(tenant.id);
    this.form.controls.tenantId.markAsTouched();
    this.tenantSearchControl.setValue(tenant, { emitEvent: false });
    this.tenantsError.set('');
  }

  assignTenant(): void {
    if (this.isSubmitting() || this.isLoadingTenants() || this.tenantsError()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.formError.set('');
    const formValue = this.form.getRawValue();
    const startDate = formValue.startDate;
    if (!startDate) return;

    this.tenantsService.createTenancy({
      status: formValue.status,
      propertyId: this.property().id,
      propertyUnit: this.unit().unitNumber,
      tenantId: formValue.tenantId,
      startDate: this.formatDate(startDate),
      notes: formValue.notes.trim(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.snackbarService.success('Tenant assigned successfully.');
        this.assigned.emit();
      },
      error: (error: unknown) => {
        console.error('Failed to assign tenant to property unit:', error);
        const message = this.errorMessage(error, 'Could not assign tenant. Please try again.');
        this.formError.set(message);
        this.snackbarService.error(message);
        this.isSubmitting.set(false);
      },
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      return error.error.message;
    }
    return fallback;
  }
}
