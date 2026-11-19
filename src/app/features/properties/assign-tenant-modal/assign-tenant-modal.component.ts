import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, debounceTime, distinctUntilChanged, startWith, switchMap, tap } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { PropertyItem, PropertyUnit } from '@app/features/properties/models/properties.models';
import { TenantSearchResult, TenancyStatus } from '@app/features/tenants/models/tenants.interface';
import { TenantsService } from '@app/features/tenants/services/tenants.service';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';

@Component({
  selector: 'app-assign-tenant-modal',
  standalone: true,
  imports: [DecimalPipe, NgxMatSelectSearchModule, ReactiveFormsModule, ...MATERIAL_MODULES],
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
  readonly selectedTenant = signal<TenantSearchResult | null>(null);
  readonly tenantOptions = computed(() => {
    const selected = this.selectedTenant();
    const results = this.tenants();
    return selected && !results.some((tenant) => tenant.id === selected.id)
      ? [selected, ...results]
      : results;
  });
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
  readonly tenantSearchControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.tenantSearchControl.valueChanges.pipe(
      startWith(this.tenantSearchControl.value),
      tap(() => {
        this.tenantsError.set('');
        this.tenants.set([]);
      }),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        const query = value.trim();
        this.isLoadingTenants.set(true);
        this.tenantsError.set('');
        const request = query.length < 2
          ? this.tenantsService.getTenants(1, 10)
          : this.tenantsService.searchTenants(query, 1, 10);

        return request.pipe(
          catchError((error: unknown) => {
            console.error('Failed to load tenants for assignment:', error);
            this.tenants.set([]);
            this.tenantsError.set(this.errorMessage(error, 'Could not load tenants. Please try again.'));
            this.snackbarService.error(this.tenantsError());
            this.isLoadingTenants.set(false);
            return EMPTY;
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((response) => {
      this.tenants.set(
        response.data
          .slice()
          .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
          .map(({ id, firstName, lastName, email, phone, status, createdAt }) => ({
            id,
            firstName,
            lastName,
            email,
            phone,
            status,
            createdAt,
          })),
      );
      this.isLoadingTenants.set(false);
    });
  }

  close(): void {
    if (!this.isSubmitting()) this.closed.emit();
  }

  tenantName(tenant: TenantSearchResult): string {
    return `${tenant.firstName} ${tenant.lastName}`;
  }

  selectTenant(tenantId: string): void {
    const tenant = this.tenantOptions().find((option) => option.id === tenantId);
    if (!tenant) return;

    this.selectedTenant.set(tenant);
    this.form.controls.tenantId.markAsTouched();
    this.tenantsError.set('');
  }

  tenantSearchMessage(): string {
    return this.tenantSearchControl.value.trim().length < 2
      ? 'Type at least 2 characters to search.'
      : 'No matching tenants found.';
  }

  assignTenant(): void {
    if (this.isSubmitting() || this.isLoadingTenants() || !this.selectedTenant()) return;
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
