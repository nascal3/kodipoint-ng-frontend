import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  Invoice,
  InvoiceApiItem,
  InvoiceDetails,
  InvoiceListResponse,
  InvoicePagination,
  InvoiceQueryParams,
  InvoiceStatus,
  InvoiceSummaryData,
  InvoiceSummaryResponse,
} from '../models/invoice.model';

const AVATAR_VARIANTS: Invoice['avatarVariant'][] = [
  'primary',
  'secondary',
  'indigo',
  'tertiary',
];

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly http = inject(HttpClient);

  private readonly invoices = signal<Invoice[]>([]);
  private readonly pagination = signal<InvoicePagination | null>(null);

  readonly getInvoices = this.invoices.asReadonly();
  readonly getPagination = this.pagination.asReadonly();

  readonly summaryData = signal<InvoiceSummaryData[]>([
    {
      title: 'Total Invoiced (This Month)',
      value: '16,240,000',
      subtitle: '',
      iconClass: 'receipt_long',
    },
    {
      title: 'Collected (This Month)',
      value: '14,820,000',
      subtitle: '89.2% Settled  •  142 paid units',
      progress: 89.2,
      iconClass: 'check_circle',
    },
    {
      title: 'Unpaid (This Month)',
      value: '1,420,000',
      subtitle: '18 tenancies',
      progress: 10.8,
      iconClass: 'priority_high',
    }
  ]);

  readonly getSummaryData = this.summaryData.asReadonly();

  getInvoiceList(params: InvoiceQueryParams): Observable<InvoiceListResponse> {
    let httpParams = new HttpParams();

    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.propertyId) httpParams = httpParams.set('propertyId', params.propertyId);
    if (params.tenantId) httpParams = httpParams.set('tenantId', params.tenantId);
    if (params.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
    if (params.toDate) httpParams = httpParams.set('toDate', params.toDate);
    if (params.page != null) httpParams = httpParams.set('page', params.page);
    if (params.limit != null) httpParams = httpParams.set('limit', params.limit);

    return this.http.get<InvoiceListResponse>(
      `${environment.apiUrl}/invoices`,
      { params: httpParams },
    ).pipe(
      shareReplay(1),
    );
  }

  loadInvoices(params: InvoiceQueryParams): void {
    this.getInvoiceList(params).subscribe({
      next: (response) => {
        this.invoices.set(response.data.map((item, index) => this.mapApiInvoice(item, index)));
        this.pagination.set(response.pagination);
      },
      error: (error) => {
        console.error('Failed to load invoices', error);
        this.invoices.set([]);
        this.pagination.set(null);
      },
    });
  }

  private mapApiInvoice(item: InvoiceApiItem, index: number): Invoice {
    const subtotal = Number(item.subtotal);
    const totalAmount = Number(item.totalAmount);
    const tenantName = [item.tenant?.firstName, item.tenant?.lastName]
      .filter(Boolean)
      .join(' ') || 'Unknown Tenant';
    const propertyUnit = [
      item.propertyUnit?.unitNumber,
      item.property?.name,
    ].filter(Boolean).join(' • ') || '—';

    return {
      id: item.id,
      invoiceNumber: `#${item.invoiceNumber}`,
      tenant: tenantName,
      tenantInitials: tenantName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || '—',
      avatarVariant: AVATAR_VARIANTS[index % AVATAR_VARIANTS.length],
      propertyUnit,
      dueDate: this.formatDate(item.dueDate),
      daysInfo: this.buildDaysInfo(item),
      breakdown: {
        baseRent: subtotal,
        additionalCharges: totalAmount - subtotal,
      },
      amount: totalAmount,
      status: this.mapStatus(item.status),
      delivery: {
        email: item.tenant?.email,
        emailStatus: item.emailSend ? 'delivered' : 'pending',
        sms: item.smsSent ? item.tenant?.phone : undefined,
        smsStatus: item.smsSent ? 'ok' : 'pending',
      },
      billingCycle: this.formatBillingCycle(item.issueDate),
      issueDate: this.formatDate(item.issueDate),
    };
  }

  private mapStatus(status: string): InvoiceStatus {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'paid';
      case 'OVERDUE':
        return 'overdue';
      case 'ISSUED':
        return 'issued';
      case 'PARTIALLY_PAID':
        return 'partially_paid';
      case 'CANCELLED':
        return 'cancelled';
      case 'DRAFT':
        return 'draft';
      default:
        return 'pending';
    }
  }

  private buildDaysInfo(item: InvoiceApiItem): string {
    const status = item.status?.toUpperCase();
    if (status === 'PAID' && item.paidDate) {
      return `Paid on ${this.formatDate(item.paidDate)}`;
    }

    const due = new Date(item.dueDate);
    if (Number.isNaN(due.getTime())) return '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);

    if (status === 'OVERDUE' || diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    }
    if (diffDays === 0) {
      return 'Due today';
    }
    return `Due in ${diffDays} days`;
  }

  private formatDate(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private formatBillingCycle(issueDate: string): string {
    const date = new Date(issueDate);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date) + ' Billing Cycle';
  }

  getInvoiceSummary(fromDate: Date, toDate: Date): Observable<InvoiceSummaryResponse> {
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const params = new HttpParams()
      .set('fromDate', formatDate(fromDate))
      .set('toDate', formatDate(toDate));

    return this.http.get<InvoiceSummaryResponse>(
      `${environment.apiUrl}/reports/invoice-summary`,
      { params },
    ).pipe(
      shareReplay(1),
    );
  }

  getInvoiceById(id: string): InvoiceDetails | undefined {
    const invoice = this.invoices().find(inv => inv.id === id);
    if (!invoice) return undefined;

    const additional = invoice.breakdown.additionalCharges;

    return {
      ...invoice,
      monthlyBaseRent: invoice.breakdown.baseRent,
      waterAndCommon: additional,
      amenities: 0,
      garbageAndWater: 0,
      totalPayable: invoice.amount,
      deliveryVerificationTrace: {
        email: invoice.delivery.email || '',
        emailStatus: invoice.delivery.emailStatus || 'pending',
        phone: invoice.delivery.sms || '',
        phoneStatus: invoice.delivery.smsStatus === 'ok' ? 'ok' : 'pending'
      }
    } as InvoiceDetails;
  }

  createInvoice(): void {
    // Placeholder for create invoice functionality
    console.log('Create invoice clicked');
  }

  batchSend(): void {
    // Placeholder for batch send functionality
    console.log('Batch send clicked');
  }

  recordPayment(invoiceId: string): void {
    // Placeholder for record payment functionality
    console.log('Record payment for invoice:', invoiceId);
  }

  resendAlert(invoiceId: string): void {
    // Placeholder for resend alert functionality
    console.log('Resend alert for invoice:', invoiceId);
  }

  exportPDF(invoiceId: string): void {
    // Placeholder for PDF export functionality
    console.log('Export PDF for invoice:', invoiceId);
  }

  cancelOrAdjust(invoiceId: string): void {
    // Placeholder for cancel/adjust functionality
    console.log('Cancel or adjust invoice:', invoiceId);
  }
}
