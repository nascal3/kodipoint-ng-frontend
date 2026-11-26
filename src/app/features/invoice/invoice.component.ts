import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { InvoiceService } from './services/invoice.service';
import type { Invoice, InvoiceDetails, InvoiceQueryParams, InvoiceSummaryResponse } from './models/invoice.model';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...MATERIAL_MODULES,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss',
})
export class InvoiceComponent {
  private readonly invoiceService = inject(InvoiceService);
  private readonly searchInput$ = new Subject<string>();

  readonly invoices = this.invoiceService.getInvoices;
  readonly pagination = this.invoiceService.getPagination;
  readonly invoicesLoading = this.invoiceService.getInvoicesLoading;
  readonly invoiceSummary = signal<InvoiceSummaryResponse['summary'] | null>(null);
  readonly summaryLoading = signal(true);

  readonly page = signal(1);
  readonly pageSize = signal(10);

  constructor() {
    const now = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.invoiceService.getInvoiceSummary(fromDate, toDate).subscribe({
      next: (response) => {
        this.invoiceSummary.set(response.summary);
        this.summaryLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load invoice summary', error);
        this.summaryLoading.set(false);
      },
    });

    this.loadInvoices();

    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.page.set(1);
        this.loadInvoices();
      });
  }

  private formatQueryDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private buildQueryParams(): InvoiceQueryParams {
    const now = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const filter = this.selectedFilter();

    return {
      status: filter === 'all' ? undefined : filter,
      invoiceNumber: this.searchQuery().trim() || undefined,
      fromDate: this.formatQueryDate(fromDate),
      toDate: this.formatQueryDate(toDate),
      page: this.page(),
      limit: this.pageSize(),
    };
  }

  loadInvoices(): void {
    this.invoiceService.loadInvoices(this.buildQueryParams());
  }

  onFilterChange(value: string): void {
    this.selectedFilter.set(value);
    this.page.set(1);
    this.loadInvoices();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.searchInput$.next(value);
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadInvoices();
  }

  readonly selectedInvoice = signal<InvoiceDetails | null>(
    this.invoiceService.getInvoiceById(this.invoices()[0]?.id ?? '') ?? null,
  );
  readonly selectedFilter = signal('all');
  readonly searchQuery = signal('');

  readonly filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Issued', value: 'ISSUED' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
    { label: 'Overdue', value: 'OVERDUE' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  displayedColumns: string[] = [
    'invoiceNumber',
    'tenantProperty',
    'dueDate',
    'amount',
    'status',
    'delivery',
  ];


  selectInvoice(invoice: Invoice): void {
    const details = this.invoiceService.getInvoiceById(invoice.id);
    this.selectedInvoice.set(details || null);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'overdue':
        return 'status-overdue';
      case 'sent':
      case 'issued':
        return 'status-sent';
      case 'draft':
        return 'status-draft';
      case 'partially_paid':
        return 'status-partially-paid';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'paid':
        return 'PAID';
      case 'overdue':
        return 'OVERDUE';
      case 'sent':
        return 'SENT';
      case 'issued':
        return 'ISSUED';
      case 'draft':
        return 'DRAFT';
      case 'partially_paid':
        return 'PARTIALLY PAID';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status.toUpperCase().replace(/_/g, ' ');
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'paid':
        return 'check_circle';
      case 'overdue':
        return 'priority_high';
      case 'sent':
      case 'issued':
        return 'send';
      case 'draft':
        return 'edit';
      case 'partially_paid':
        return 'payments';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help_outline';
    }
  }

  createInvoice(): void {
    this.invoiceService.createInvoice();
  }

  batchSend(): void {
    this.invoiceService.batchSend();
  }

  recordPayment(invoiceId: string): void {
    this.invoiceService.recordPayment(invoiceId);
  }

  resendAlert(invoiceId: string): void {
    this.invoiceService.resendAlert(invoiceId);
  }

  exportPDF(invoiceId: string): void {
    this.invoiceService.exportPDF(invoiceId);
  }

  cancelOrAdjust(invoiceId: string): void {
    this.invoiceService.cancelOrAdjust(invoiceId);
  }

  get filteredInvoices() {
    const invoices = this.invoices();
    const filter = this.selectedFilter();
    const search = this.searchQuery().toLowerCase();

    return invoices.filter(invoice => {
      const matchesFilter =
        filter === 'all' ||
        invoice.status === filter.toLowerCase().replace(/ /g, '_');

      const matchesSearch =
        invoice.tenant.toLowerCase().includes(search) ||
        invoice.invoiceNumber.toLowerCase().includes(search) ||
        invoice.propertyUnit.toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }

  refreshTableData() {
    this.loadInvoices();
  }

  get unpaidPercentage(): number {
    const summary = this.invoiceSummary();
    if (!summary) return 0;
    const totalInvoiced = Number(summary.totalInvoiced);
    return totalInvoiced > 0 ? (Number(summary.totalUnpaid) / totalInvoiced) * 100 : 0;
  }

  formatKpiAmount(amount?: string): string {
    return new Intl.NumberFormat('en-KE', {
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(Number(amount ?? 0));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(amount);
  }
}
