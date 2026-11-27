import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, ViewChild, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, debounceTime, distinctUntilChanged, startWith, switchMap, tap } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { MatDatepicker } from '@angular/material/datepicker';
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
  readonly issueDateControl = new FormControl<Date | null>(null, [this.minDateValidator]);
  readonly dueDateControl = new FormControl<Date | null>(null, [this.minDueDateValidator.bind(this)]);
  readonly notesControl = new FormControl('', { nonNullable: true });
  readonly today = new Date();

  @ViewChild('issueDatePicker') issueDatePicker!: MatDatepicker<Date>;
  @ViewChild('dueDatePicker') dueDatePicker!: MatDatepicker<Date>;

  ngOnInit(): void {
    // Subscribe to issue date changes to revalidate due date
    this.issueDateControl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.dueDateControl.updateValueAndValidity();
    });

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

    // Reset invoice fields when tenant changes
    this.issueDateControl.setValue(null);
    this.dueDateControl.setValue(null);
    this.notesControl.setValue('');

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
    // Populate the controls before revealing the section that contains them.
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);

    this.issueDateControl.setValue(today);
    this.dueDateControl.setValue(dueDate);
    this.selectedTenancy.set(tenancy);
  }

  reviewInvoice(): void {
    if (this.isGenerating()) return;

  }

  getTenantInitials(tenant: Tenant | TenantSearchResult): string {
    return `${tenant.firstName.charAt(0)}${tenant.lastName.charAt(0)}`.toUpperCase();
  }

  getActiveTenancies(tenant: Tenant): Tenancy[] {
    return tenant.tenancies?.filter(t => t.status === 'ACTIVE' || t.status === 'NOTICE') || [];
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

  private minDateValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value as Date | null;
    if (!value) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate < today ? { pastDate: true } : null;
  }

  private minDueDateValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value as Date | null;
    if (!value) return null;

    const issueDate = this.issueDateControl.value;
    if (!issueDate) return null;

    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);

    const issueDateOnly = new Date(issueDate);
    issueDateOnly.setHours(0, 0, 0, 0);

    return selectedDate < issueDateOnly ? { dueDateBeforeIssueDate: true } : null;
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      return error.error.message;
    }
    return fallback;
  }
}
