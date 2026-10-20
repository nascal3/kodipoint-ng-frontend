import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { InvoiceService } from './services/invoice.service';
import type { Invoice, InvoiceDetails } from './models/invoice.model';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss',
})
export class InvoiceComponent {
  private readonly invoiceService = inject(InvoiceService);

  readonly invoices = this.invoiceService.getInvoices;
  readonly summaryData = this.invoiceService.getSummaryData;

  readonly selectedInvoice = signal<InvoiceDetails | null>(
    this.invoiceService.getInvoiceById(this.invoices()[0]?.id ?? '') ?? null,
  );
  readonly selectedFilter = signal('All Invoices');
  readonly searchQuery = signal('');

  readonly filterOptions = [
    'All Invoices',
    'Paid',
    'Overdue',
    'Sent',
    'Draft',
  ];

  displayedColumns: string[] = [
    'invoiceNumber',
    'tenantProperty',
    'dueDate',
    'breakdown',
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
