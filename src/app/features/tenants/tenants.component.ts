import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, finalize, Subject } from 'rxjs';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';
import { TenantsService } from './services/tenants.service';
import { TenantItem, Tenant, Tenancy } from './models/tenants.interface';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...MATERIAL_MODULES,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.scss',
})
export class TenantsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly tenantsService = inject(TenantsService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly searchChanges = new Subject<string>();
  readonly tenants = signal<TenantItem[]>([]);
  readonly isLoading = signal(false);
  readonly hasLoadError = signal(false);
  readonly pagination = signal({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  readonly activeLeaseholdRate = signal({
    title: 'Active Leasehold Rate',
    percentage: '97.8%',
    unitLabel: 'Occupied Capacity',
    unitRatio: '139 / 142 Units',
  });

  readonly contractedRent = signal({
    title: 'Contracted Rent / Mo',
    currency: 'KES',
    amount: '11.84M',
    collectionLabel: 'Collection Rate',
    collectedLabel: '91.4% Collected',
  });

  readonly expiringLeases = signal({
    title: 'Expiring in 30 Days',
    leasesCount: '8 Leases',
    dispatchLabel: 'Notice Dispatches',
    pendingReview: '8 Pending Review',
  });


  readonly selectedStatus = signal('All');
  readonly searchQuery = signal('');

  readonly statusOptions = ['All', 'ACTIVE', 'NOTICE', 'ENDED'];

  displayedColumns: string[] = [
    'tenantProfile',
    'premisesUnit',
    'tenure',
    'contractRent',
    'emergency',
    'tenancyStatus',
    'actions',
  ];

  getBalanceStatus(balance: string, status: 'overdue' | 'settled' | 'credit'): string {
    if (balance === 'Escrow Deposit') return balance;
    if (status === 'overdue') return `KES ${balance} Overdue`;
    if (status === 'credit') return `KES ${balance} Credit`;
    return `KES ${balance} Settled`;
  }

  getBalanceIcon(balance: string, status: 'overdue' | 'settled' | 'credit'): string {
    if (balance === 'Escrow Deposit') return 'account_balance_wallet';
    if (status === 'overdue') return 'priority_high';
    if (status === 'credit') return 'add_circle';
    return 'check_circle';
  }

  getTenancyStatusClass(status: 'active' | 'notice' | 'pending'): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'notice':
        return 'status-notice';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }

  getTenancyStatusLabel(status: 'active' | 'notice' | 'pending'): string {
    switch (status) {
      case 'active':
        return 'Active Tenancy';
      case 'notice':
        return 'Notice Period';
      case 'pending':
        return 'Pending Lease';
      default:
        return '';
    }
  }

  getBalanceClass(balance: string, status: 'overdue' | 'settled' | 'credit'): string {
    if (balance === 'Escrow Deposit') return 'balance-escrow';
    switch (status) {
      case 'overdue':
        return 'balance-overdue';
      case 'credit':
        return 'balance-credit';
      default:
        return 'balance-settled';
    }
  }

  ngOnInit(): void {
    this.searchChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.resetPageAndLoad();
      });
    this.loadTenants();
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.resetPageAndLoad();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.searchChanges.next(query);
  }

  private resetPageAndLoad(): void {
    this.pagination.update((pagination) => ({ ...pagination, page: 1 }));
    this.loadTenants();
  }

  loadTenants(): void {
    this.isLoading.set(true);
    this.hasLoadError.set(false);
    const statusFilter = this.selectedStatus() === 'All' ? undefined : this.selectedStatus();
    const nameFilter = this.searchQuery().trim() || undefined;

    this.tenantsService
      .getTenants(this.pagination().page, this.pagination().limit, {
        status: statusFilter,
        name: nameFilter,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          const transformedTenants = this.transformTenants(response.data);
          this.tenants.set(transformedTenants);
          this.pagination.set(response.pagination);
        },
        error: () => {
          this.hasLoadError.set(true);
          this.snackbarService.error('Failed to load tenants. Please try again.');
        },
      });
  }

  private transformTenants(apiTenants: Tenant[]): TenantItem[] {
    return apiTenants.map((tenant) => {
      const activeTenancy = tenant.tenancies?.[0];
      return {
        id: tenant.id,
        name: `${tenant.firstName} ${tenant.lastName}`,
        phone: tenant.phone,
        email: tenant.email,
        premises: activeTenancy?.property?.name || 'N/A',
        unit: activeTenancy?.unit?.unitNumber || 'N/A',
        unitType: activeTenancy?.unit?.bedroomCount || 'N/A',
        currency: activeTenancy?.property?.currency || 'N/A',
        startDate: activeTenancy?.startDate ? this.formatDate(activeTenancy.startDate) : 'N/A',
        tenure: activeTenancy?.endDate ? this.calculateTenure(activeTenancy.startDate, activeTenancy.endDate) : 'Active',
        contractRent: activeTenancy?.unit?.marketRent || '0',
        rentPeriod: activeTenancy?.unit?.billingFrequency || 'N/A',
        emergencyContact: tenant.emergencyContactName,
        emergencyPhone: tenant.emergencyContactPhone,
        tenancyStatus: this.mapTenancyStatus(activeTenancy?.status || tenant.status),
      };
    });
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'});
  }

  private calculateTenure(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    return `${months} Mo Fixed`;
  }

  private mapTenancyStatus(status: string): 'active' | 'notice' | 'pending' {
    const statusMap: Record<string, 'active' | 'notice' | 'pending'> = {
      ACTIVE: 'active',
      NOTICE: 'notice',
      PENDING: 'pending',
    };
    return statusMap[status] || 'pending';
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}
