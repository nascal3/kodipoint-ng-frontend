import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { DateRange } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import type { InvoiceData, InvoiceRecord } from '../../models/dashboard.model';
import { DATE_RANGE_DATE_PROVIDERS } from '../date-range-date-adapter';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { DashboardService } from '../../services/dashboard.service';

export type { InvoiceRecord };

@Component({
  selector: 'app-invoice-table',
  standalone: true,
  imports: [
    CommonModule,
    MATERIAL_MODULES,
  ],
  providers: DATE_RANGE_DATE_PROVIDERS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoice-table.component.html',
  styleUrl: './invoice-table.component.scss',
})
export class InvoiceTableComponent {
  private readonly dashboardService = inject(DashboardService);

  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);
  readonly maxDate = new Date();
  readonly dateRangeStart = signal(new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1));
  readonly dateRangeEnd = signal(this.maxDate);

  readonly displayedColumns: string[] = ['invoice', 'amounts', 'status', 'payment', 'date', 'action'];

  protected readonly rawData = signal<InvoiceRecord[]>([]);
  protected readonly totalRecordsSignal = signal(0);
  readonly totalRecords = computed(() => this.totalRecordsSignal());
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  constructor() {
    this.loadInvoices();
  }

  private loadInvoices(): void {
    this.dashboardService.getInvoices(
      this.currentPage(),
      this.pageSize(),
      'DESC',
      this.dateRangeStart(),
      this.dateRangeEnd(),
    ).subscribe({
      next: (response) => {
        const transformedData = response.data.map((data) => this.transformInvoiceData(data));
        this.rawData.set(transformedData);
        this.totalRecordsSignal.set(response.pagination.total);
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
      },
    });
  }

  private transformInvoiceData(data: InvoiceData): InvoiceRecord {
    const tenantName = data.tenant.name || 'Unknown Tenant';
    const initials = tenantName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const avatarVariants: Array<'primary' | 'secondary' | 'tertiary' | 'error' | 'indigo'> = [
      'primary', 'secondary', 'tertiary', 'error', 'indigo',
    ];
    const avatarVariant = avatarVariants[data.id.charCodeAt(0) % avatarVariants.length];

    const paymentMethod = data.payment?.method || 'N/A';
    const methodVariant = this.getMethodVariant(paymentMethod);

    const status = this.mapPaymentStatus(data.paymentStatus);

    const propertyUnit = data.property.unit && data.property.name
      ? `Unit ${data.property.unit} • ${data.property.name}`
      : data.property.unit || data.property.name || 'Unknown Property';

    return {
      id: data.id,
      initials,
      avatarVariant,
      invoiceNumber: data.invoiceNumber,
      tenant: tenantName,
      propertyUnit,
      total: parseFloat(data.totalAmount),
      amountPaid: parseFloat(data.amountPaid),
      balance: parseFloat(data.balanceDue),
      status,
      paymentMethod,
      methodVariant,
      reference: data.payment?.reference || 'N/A',
      dateTime: this.formatDateTime(data.dateTime),
    };
  }

  private getMethodVariant(method: string): 'mpesa' | 'rtgs' | 'bank' {
    const lowerMethod = method.toLowerCase();
    if (lowerMethod.includes('mpesa') || lowerMethod.includes('m-pesa')) {
      return 'mpesa';
    }
    if (lowerMethod.includes('rtgs')) {
      return 'rtgs';
    }
    return 'bank';
  }

  private mapPaymentStatus(status: string): 'fully-paid' | 'partially-paid' | 'overdue' {
    switch (status) {
      case 'PAID':
        return 'fully-paid';
      case 'PARTIALLY_PAID':
        return 'partially-paid';
      case 'UNPAID':
        return 'overdue';
      default:
        return 'overdue';
    }
  }

  private formatDateTime(date: Date): string {
    const now = new Date();
    const invoiceDate = new Date(date);
    const diffMs = now.getTime() - invoiceDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${invoiceDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    if (diffDays === 1) {
      return `Yesterday, ${invoiceDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    return invoiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      `, ${invoiceDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }

  readonly dataSource = computed(() => {
    const dataSource = new MatTableDataSource(this.rawData());
    const paginatorRef = this.paginator();
    const sortRef = this.sort();

    if (paginatorRef) {
      dataSource.paginator = paginatorRef;
    }
    if (sortRef) {
      dataSource.sort = sortRef;
    }

    dataSource.filterPredicate = (data: InvoiceRecord, filter: string) => {
      const searchString = `${data.tenant} ${data.invoiceNumber} ${data.propertyUnit} ${data.paymentMethod} ${data.reference} ${data.status}`.toLowerCase();
      return searchString.includes(filter);
    };

    return dataSource;
  });

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    const dataSource = this.dataSource();
    dataSource.filter = filterValue.trim().toLowerCase();
  }

  onDateRangeChange(range: DateRange<Date> | null): void {
    const start = range?.start;
    const end = range?.end;

    if (start && end) {
      this.dateRangeStart.set(start);
      this.dateRangeEnd.set(end);
      this.currentPage.set(1);
      this.loadInvoices();
    }
  }
}
