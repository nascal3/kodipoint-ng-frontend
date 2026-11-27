import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, debounceTime, distinctUntilChanged, startWith, switchMap, tap } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { TenantsService } from '@app/features/tenants/services/tenants.service';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';
import type { Tenant, TenantSearchResult, Tenancy } from '@app/features/tenants/models/tenants.interface';

export interface TenantTenancy {
  tenant: Tenant;
  tenancy: Tenancy;
}

@Component({
  selector: 'app-create-invoice-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    ...MATERIAL_MODULES,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-invoice-modal.component.html',
  styleUrl: './create-invoice-modal.component.scss',
})
export class CreateInvoiceModalComponent implements OnInit {
  private readonly tenantsService = inject(TenantsService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly destroyRef = inject(DestroyRef);

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly invoiceCreated = new EventEmitter<TenantTenancy>();

  readonly tenants = signal<TenantSearchResult[]>([]);
  readonly selectedTenant = signal<Tenant | null>(null);
  readonly tenantOptions = computed(() => {
    const selected = this.selectedTenant();
    const results = this.tenants();
    // Only include selected tenant in options if it's not already in results
    if (selected && !results.some((tenant) => tenant.id === selected.id)) {
      const selectedSearchResult: TenantSearchResult = {
        id: selected.id,
        firstName: selected.firstName,
        lastName: selected.lastName,
        email: selected.email,
        phone: selected.phone,
        status: selected.status,
        createdAt: selected.createdAt,
      };
      return [selectedSearchResult, ...results];
    }
    return results;
  });
  readonly isLoadingTenants = signal(false);
  readonly tenantsError = signal('');
  readonly isGenerating = signal(false);
  readonly selectedTenancy = signal<Tenancy | null>(null);
  readonly tenantSearchControl = new FormControl('', { nonNullable: true });
  readonly tenantIdControl = new FormControl('', { nonNullable: true });

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
            console.error('Failed to load tenants:', error);
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
    if (this.isGenerating()) return;
    this.closed.emit();
  }

  tenantName(tenant: Tenant | TenantSearchResult): string {
    return `${tenant.firstName} ${tenant.lastName}`;
  }

  selectedTenantForDisplay(): Tenant | TenantSearchResult | null {
    return this.selectedTenant()
      ?? this.tenantOptions().find((tenant) => tenant.id === this.tenantIdControl.value)
      ?? null;
  }

  selectTenant(tenantId: string): void {
    const tenant = this.tenantOptions().find((option) => option.id === tenantId);
    if (!tenant) return;

    this.selectedTenancy.set(null);
    this.tenantsError.set('');

    // Fetch full tenant details with tenancies
    this.tenantsService.getTenantById(tenantId).subscribe({
      next: (fullTenant) => {
        this.selectedTenant.set(fullTenant);
      },
      error: (error) => {
        console.error('Failed to load tenant details:', error);
        this.snackbarService.error('Failed to load tenant details. Please try again.');
      },
    });
  }

  tenantSearchMessage(): string {
    return this.tenantSearchControl.value.trim().length < 2
      ? 'Type at least 2 characters to search.'
      : 'No matching tenants found.';
  }

  selectTenancy(tenancy: Tenancy): void {
    this.selectedTenancy.set(tenancy);
  }

  generateAndDispatchInvoice(): void {
    if (this.isGenerating()) return;
    const tenant = this.selectedTenant();
    const tenancy = this.selectedTenancy();

    if (!tenant || !tenancy) {
      this.snackbarService.error('Please select a tenant and tenancy.');
      return;
    }

    this.isGenerating.set(true);
    // Simulate invoice generation
    setTimeout(() => {
      this.isGenerating.set(false);
      this.invoiceCreated.emit({ tenant, tenancy });
      this.snackbarService.success('Invoice generated and dispatched successfully.');
      this.close();
    }, 1500);
  }

  getTenantInitials(tenant: Tenant | TenantSearchResult): string {
    return `${tenant.firstName.charAt(0)}${tenant.lastName.charAt(0)}`.toUpperCase();
  }

  getActiveTenancies(tenant: Tenant): Tenancy[] {
    return tenant.tenancies?.filter(t => t.status === 'ACTIVE') || [];
  }

  getTenancyLabel(tenancy: Tenancy): string {
    const propertyName = tenancy.property?.name || 'Unknown Property';
    const unitNumber = tenancy.unit?.unitNumber || 'Unknown Unit';
    return `${propertyName} - Unit ${unitNumber}`;
  }

  getTenancyDetails(tenancy: Tenancy): string {
    const unitType = tenancy.unit?.propertyUseType === 'RESIDENTIAL'
      ? `${tenancy.unit?.bedroomCount} Bedrooms`
      : `${tenancy.unit?.bedroomCount} Rooms`;
    return unitType;
  }

  getTenancyPeriod(tenancy: Tenancy): string {
    const start = this.formatDate(tenancy.startDate);
    const end = tenancy.endDate ? this.formatDate(tenancy.endDate) : 'Ongoing';
    return `${start} – ${end}`;
  }

  getRentAmount(tenancy: Tenancy): string {
    const currency = tenancy.property?.currency || 'KES';
    const rent = tenancy.unit?.marketRent || '0';
    return `${currency} ${new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(Number(rent))}`;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      return error.error.message;
    }
    return fallback;
  }
}
