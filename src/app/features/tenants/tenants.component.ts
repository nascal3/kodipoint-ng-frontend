import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, finalize, Subject } from 'rxjs';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';
import { TenantsService } from './services/tenants.service';
import { TenantItem, Tenant, Tenancy } from './models/tenants.interface';
import { RegisterTenantModalComponent } from './register-tenant-modal/register-tenant-modal.component';
import { EditTenantModalComponent } from './edit-tenant-modal/edit-tenant-modal.component';
import {
  SendTenantMessageModalComponent,
  TenantMessageDraft,
} from './send-tenant-message-modal/send-tenant-message-modal.component';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RegisterTenantModalComponent,
    EditTenantModalComponent,
    SendTenantMessageModalComponent,
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
  readonly isKpiLoading = signal(false);
  readonly pagination = signal({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  readonly activeLeaseholdRate = signal({
    percentage: '--',
    unitRatio: '--',
  });

  readonly tenanciesSummary = signal({
    newTenants: '--',
    activeTenants: '--',
  });

  readonly expiringLeases = signal({
    leasesCount: '--',
    pendingReview: '--',
  });


  readonly selectedStatus = signal('All');
  readonly searchQuery = signal('');
  readonly isTenantRegistrationOpen = signal(false);
  readonly editingTenant = signal<Tenant | null>(null);
  readonly messagingTenant = signal<TenantItem | null>(null);
  readonly sendingTenantMessage = signal(false);
  readonly expandedTenantId = signal<string | null>(null);
  readonly unassigningTenancy = signal<{ tenancy: Tenancy; tenantName: string } | null>(null);
  readonly isUnassigning = signal(false);
  readonly unassignError = signal('');
  readonly unassignEndDate = signal<Date | null>(null);
  readonly minimumUnassignDate = computed(() => {
    const assignedAt = this.unassigningTenancy()?.tenancy.assignedAt;
    if (!assignedAt) return null;

    const assignedDate = this.parseCalendarDate(assignedAt);
    return assignedDate
      ? new Date(assignedDate.getFullYear(), assignedDate.getMonth(), assignedDate.getDate() + 1)
      : null;
  });
  readonly unassignDateFilter = (date: Date | null): boolean => this.isUnassignDateAllowed(date);

  readonly statusOptions = ['All', 'ACTIVE', 'NOTICE', 'ENDED'];

  displayedColumns: string[] = [
    'expand',
    'tenantProfile',
    'identification',
    'emergency',
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

  getTenancyStatusClass(status: 'active' | 'notice' | 'ended'): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'notice':
        return 'status-notice';
      case 'ended':
        return 'status-ended';
      default:
        return '';
    }
  }

  getTenancyStatusLabel(status: 'active' | 'notice' | 'ended'): string {
    switch (status) {
      case 'active':
        return 'Active Tenancy';
      case 'notice':
        return 'Notice Period';
      case 'ended':
        return 'Ended';
      default:
        return '';
    }
  }

  toggleTenantExpansion(tenantId: string): void {
    this.expandedTenantId.update((expandedId) =>
      expandedId === tenantId ? null : tenantId
    );
  }

  isTenantExpanded(tenantId: string): boolean {
    return this.expandedTenantId() === tenantId;
  }

  getAgreementStatusClass(status: string): string {
    return this.getTenancyStatusClass(this.mapTenancyStatus(status));
  }

  getAgreementStatusLabel(status: string): string {
    return this.mapTenancyStatus(status) === 'active'
      ? 'Active Lease'
      : this.getTenancyStatusLabel(this.mapTenancyStatus(status));
  }

  formatAgreementDate(date: string | null): string {
    return date ? this.formatDate(date) : 'Ongoing';
  }

  getPeriodStatusColor(endDate: string | null): string | null {
    const parsedEndDate = this.parseEndDate(endDate);
    if (!parsedEndDate) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsedEndDate.setHours(0, 0, 0, 0);
    return today > parsedEndDate ? '#fb7185' : '#fbbf24';
  }

  private parseEndDate(endDate: string | null): Date | null {
    if (!endDate) {
      return null;
    }

    const isoDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(endDate);
    if (isoDate) {
      const [, year, month, day] = isoDate;
      const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
      if (
        parsedDate.getFullYear() !== Number(year)
        || parsedDate.getMonth() !== Number(month) - 1
        || parsedDate.getDate() !== Number(day)
      ) {
        return null;
      }
      return parsedDate;
    }

    const parsedDate = new Date(endDate);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  getTenancyPeriod(tenancy: import('./models/tenants.interface').Tenancy): string {
    const start = this.formatAgreementDate(tenancy.startDate);
    const end = tenancy.status === 'ACTIVE' && !tenancy.endDate
      ? 'Ongoing'
      : this.formatAgreementDate(tenancy.endDate);
    return `${start} – ${end}`;
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
    this.loadKpiData();
  }

  private loadKpiData(): void {
    this.isKpiLoading.set(true);
    this.loadProjectedRent();
    this.loadExpiringLeases();
    this.loadTenanciesSummary();
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.resetPageAndLoad();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.searchChanges.next(query);
  }

  openTenantRegistration(): void {
    this.isTenantRegistrationOpen.set(true);
  }

  closeTenantRegistration(): void {
    this.isTenantRegistrationOpen.set(false);
  }

  onTenantCreated(): void {
    this.closeTenantRegistration();
    this.loadTenants();
  }

  openTenantEdit(tenant: Tenant): void {
    this.editingTenant.set(tenant);
  }

  closeTenantEdit(): void {
    this.editingTenant.set(null);
  }

  onTenantUpdated(): void {
    this.closeTenantEdit();
    this.loadTenants();
  }

  openTenantMessage(tenant: TenantItem): void {
    this.messagingTenant.set(tenant);
  }

  closeTenantMessage(): void {
    this.messagingTenant.set(null);
  }

  openUnassignConfirmation(tenancy: Tenancy, tenantName: string): void {
    this.unassignError.set('');
    this.unassignEndDate.set(null);
    this.unassigningTenancy.set({ tenancy, tenantName });
  }

  closeUnassignConfirmation(): void {
    if (this.isUnassigning()) return;

    this.unassignError.set('');
    this.unassigningTenancy.set(null);
  }

  confirmUnassign(tenancy: Tenancy): void {
    if (this.isUnassigning()) return;
    const endDate = this.unassignEndDate();
    if (!endDate || !this.isUnassignDateAllowed(endDate)) {
      this.unassignError.set('Choose an end date later than the tenancy assignment date.');
      return;
    }

    this.isUnassigning.set(true);
    this.unassignError.set('');
    this.tenantsService.unassignTenancy(tenancy.id, { endDate: this.formatIsoDate(endDate) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isUnassigning.set(false);
          this.closeUnassignConfirmation();
          this.snackbarService.success('Lease ended successfully.');
          this.loadTenants();
          this.loadKpiData();
        },
        error: (error: unknown) => {
          console.error('Failed to end tenancy:', error);
          this.unassignError.set('Could not end the lease. Please try again.');
          this.snackbarService.error(this.unassignError());
          this.isUnassigning.set(false);
        },
      });
  }

  isUnassignDateAllowed(date: Date | null): boolean {
    const minimumDate = this.minimumUnassignDate();
    return Boolean(date && minimumDate && date >= minimumDate);
  }

  formatLeaseStartDate(date: string | null): string {
    if (!date) return 'N/A';
    const parsedDate = this.parseCalendarDate(date);
    return parsedDate
      ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsedDate)
      : 'N/A';
  }

  onTenantMessageRequested(draft: TenantMessageDraft): void {
    this.sendingTenantMessage.set(true);
    this.tenantsService
      .sendTenantMessage({
        email: draft.recipient.email,
        phone: draft.recipient.phone,
        sendSms: draft.channels.sms,
        sendEmail: draft.channels.email,
        subject: draft.subject,
        message: draft.content,
      })
      .pipe(finalize(() => this.sendingTenantMessage.set(false)))
      .subscribe({
        next: () => {
          this.snackbarService.success('Message sent successfully.');
          this.closeTenantMessage();
        },
        error: () => {
          this.snackbarService.error('Failed to send message. Please try again.');
        },
      });
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

  loadProjectedRent(): void {
    this.tenantsService.getProjectedRent(1, 10, 'DESC').pipe(
      finalize(() => this.isKpiLoading.set(false))
    ).subscribe({
      next: (response) => {
        const { totalOccupiedUnits, totalVacantUnits, totalProperties } = response.summary;
        const totalUnits = totalOccupiedUnits + totalVacantUnits;
        const percentage = totalProperties > 0
          ? ((totalOccupiedUnits / totalUnits) * 100).toFixed(1) + '%'
          : '0%';
        const unitRatio = `${totalOccupiedUnits} / ${totalUnits} Units`;

        this.activeLeaseholdRate.set({ percentage, unitRatio });
      },
      error: () => {
        this.snackbarService.error('Failed to load projected rent data.');
      },
    });
  }

  loadExpiringLeases(): void {
    this.tenantsService.getExpiringTenancies(1, 10).subscribe({
      next: (response) => {
        const totalLeases = response.pagination.total;
        this.expiringLeases.set({
          leasesCount: `${totalLeases} Leases`,
          pendingReview: totalLeases.toString(),
        });
      },
      error: () => {
        this.snackbarService.error('Failed to load expiring leases data.');
      },
    });
  }

  loadTenanciesSummary(): void {
    this.tenantsService.getActiveTenancies(1, 10).pipe(
      finalize(() => this.isKpiLoading.set(false))
    ).subscribe({
      next: (response) => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const newTenantsCount = response.data.filter(tenancy => {
          const createdAt = new Date(tenancy.createdAt);
          return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
        }).length;

        const activeTenantsCount = response.pagination.total;

        this.tenanciesSummary.set({
          newTenants: newTenantsCount.toString(),
          activeTenants: activeTenantsCount.toString(),
        });
      },
      error: () => {
        this.snackbarService.error('Failed to load tenancies summary data.');
      },
    });
  }

  private transformTenants(apiTenants: Tenant[]): TenantItem[] {
    return apiTenants.map((tenant) => {
      const activeTenancy = tenant.tenancies?.[0];
      return {
        id: tenant.id,
        tenant,
        name: `${tenant.firstName} ${tenant.lastName}`,
        phone: tenant.phone,
        email: tenant.email,
        premises: activeTenancy?.property?.name || 'N/A',
        unit: activeTenancy?.unit?.unitNumber || 'N/A',
        propertyUseType: activeTenancy?.unit?.propertyUseType || 'N/A',
        unitType: activeTenancy?.unit?.propertyUseType === 'RESIDENTIAL'
          ? `${activeTenancy?.unit?.bedroomCount} Bedrooms` : `${activeTenancy?.unit?.bedroomCount} Rooms`,
        currency: activeTenancy?.property?.currency || 'N/A',
        startDate: activeTenancy?.startDate ? this.formatDate(activeTenancy.startDate) : 'N/A',
        tenure: activeTenancy?.startDate ? this.calculateTenure(activeTenancy.startDate) : 'N/A',
        endDate: activeTenancy?.endDate ? this.formatDate(activeTenancy.endDate) : 'N/A',
        endTenure: activeTenancy?.endDate ? this.calculateEndTenure(activeTenancy.endDate) : 'N/A',
        contractRent: activeTenancy?.unit?.marketRent || '0',
        rentPeriod: activeTenancy?.unit?.billingFrequency || 'N/A',
        emergencyContact: tenant.emergencyContactName || 'N/A',
        emergencyPhone: tenant.emergencyContactPhone || 'N/A',
        tenancyStatus: this.mapTenancyStatus(activeTenancy?.status || tenant.status),
      };
    });
  }

  private formatIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseCalendarDate(value: string): Date | null {
    const isoDate = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
    const parsedDate = isoDate
      ? new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))
      : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return null;

    const calendarDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
    if (isoDate && this.formatIsoDate(calendarDate) !== `${isoDate[1]}-${isoDate[2]}-${isoDate[3]}`) return null;
    return calendarDate;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'});
  }

  private calculateTenure(startDate: string): string {
    const start = new Date(startDate);
    const now = new Date();
    let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) {
      months--;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0) {
      return remainingMonths > 0 ? `${years} Yrs ${remainingMonths} Mo` : `${years} Yrs`;
    }
    if (remainingMonths > 0) {
      return `${remainingMonths} Mo`;
    }
    const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} Days`;
  }

  private calculateEndTenure(endDate: string): string {
    const end = new Date(endDate);
    const now = new Date();
    const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hasExpired = endMidnight.getTime() < nowMidnight.getTime();
    const suffix = hasExpired ? 'after Expiry' : 'to Expiry';

    let months: number;
    if (hasExpired) {
      months = (nowMidnight.getFullYear() - endMidnight.getFullYear()) * 12
        + (nowMidnight.getMonth() - endMidnight.getMonth());
      if (nowMidnight.getDate() < endMidnight.getDate()) {
        months--;
      }
    } else {
      months = (endMidnight.getFullYear() - nowMidnight.getFullYear()) * 12
        + (endMidnight.getMonth() - nowMidnight.getMonth());
      if (endMidnight.getDate() < nowMidnight.getDate()) {
        months--;
      }
    }

    months = Math.max(months, 0);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0) {
      return remainingMonths > 0 ? `${years} Yrs ${remainingMonths} Mo ${suffix}` : `${years} Yrs ${suffix}`;
    }
    if (remainingMonths > 0) {
      return `${remainingMonths} Mo ${suffix}`;
    }
    const days = Math.ceil(Math.abs(end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} Days ${suffix}`;
  }

  private mapTenancyStatus(status: string): 'active' | 'notice' | 'ended' {
    const statusMap: Record<string, 'active' | 'notice'| 'ended'> = {
      ACTIVE: 'active',
      NOTICE: 'notice',
      ENDED: 'ended',
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
