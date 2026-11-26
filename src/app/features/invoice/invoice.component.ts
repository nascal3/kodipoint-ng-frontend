import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { InvoiceService } from './services/invoice.service';
import type { Invoice, InvoiceDetails, InvoiceSummaryResponse } from './models/invoice.model';

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

  readonly invoices = this.invoiceService.getInvoices;
  readonly invoiceSummary = signal<InvoiceSummaryResponse['summary'] | null>(null);

  constructor() {
    const now = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.invoiceService.getInvoiceSummary(fromDate, toDate).subscribe({
      next: (response) => this.invoiceSummary.set(response.summary),
      error: (error) => console.error('Failed to load invoice summary', error),
    });
  }

  readonly selectedInvoice = signal<InvoiceDetails | null>(
    this.invoiceService.getInvoiceById(this.invoices()[0]?.id ?? '') ?? null,
  );
  readonly selectedFilter = signal('All Invoices');
  readonly searchQuery = signal('');

  readonly filterOptions = [
    { label: 'All Invoices', value: 'all' },
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
        return 'status-sent';
      case 'draft':
        return 'status-draft';
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
      case 'draft':
        return 'DRAFT';
      default:
        return status.toUpperCase();
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'paid':
        return 'check_circle';
      case 'overdue':
        return 'priority_high';
      case 'sent':
        return 'send';
      case 'draft':
        return 'edit';
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
        filter === 'All Invoices' ||
        invoice.status === filter.toLowerCase();

      const matchesSearch =
        invoice.tenant.toLowerCase().includes(search) ||
        invoice.invoiceNumber.toLowerCase().includes(search) ||
        invoice.propertyUnit.toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }

  refreshTableData() {
    // Implementation for refreshing table data
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
    }).format(Number(amount ?? 0));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatDetailedCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}
