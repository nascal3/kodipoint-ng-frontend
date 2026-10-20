import { Injectable, signal } from '@angular/core';
import type { Invoice, InvoiceDetails, InvoiceSummaryData } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly invoices = signal<Invoice[]>([
    {
      id: '1',
      invoiceNumber: '#INV-2026-0891',
      tenant: 'John Doe',
      tenantInitials: 'JD',
      avatarVariant: 'primary',
      propertyUnit: 'Apt 4B • Sapphire Heights',
      dueDate: 'Oct 05, 2026',
      daysInfo: 'Paid on Oct 03',
      breakdown: {
        baseRent: 75000,
        additionalCharges: 3500
      },
      amount: 78500,
      status: 'paid',
      delivery: {
        email: 'john.doe@enterprise.ke',
        emailStatus: 'delivered',
        sms: '+254 712 *** 890',
        smsStatus: 'ok'
      },
      billingCycle: 'October Billing Cycle',
      issueDate: '01 Oct 2026'
    },
    {
      id: '2',
      invoiceNumber: '#INV-2026-0892',
      tenant: 'Faith Mwangi',
      tenantInitials: 'FM',
      avatarVariant: 'secondary',
      propertyUnit: 'Unit 12C • Westland Towers',
      dueDate: 'Oct 05, 2026',
      daysInfo: '3 days overdue',
      breakdown: {
        baseRent: 110000,
        additionalCharges: 12000
      },
      amount: 122000,
      status: 'overdue',
      delivery: {
        email: 'faith.mwangi@email.com',
        emailStatus: 'delivered',
        sms: '+254 722 *** 456',
        smsStatus: 'ok'
      },
      billingCycle: 'October Billing Cycle',
      issueDate: '01 Oct 2026'
    },
    {
      id: '3',
      invoiceNumber: '#INV-2026-0893',
      tenant: 'Amani Tech Ltd',
      tenantInitials: 'AT',
      avatarVariant: 'indigo',
      propertyUnit: 'Suite 201 • Commercial Plaza',
      dueDate: 'Oct 10, 2026',
      daysInfo: 'Due in 2 days',
      breakdown: {
        baseRent: 250000,
        additionalCharges: 45000
      },
      amount: 295000,
      status: 'sent',
      delivery: {
        email: 'accounts@amanitech.co.ke',
        emailStatus: 'delivered',
        sms: '+254 733 *** 789',
        smsStatus: 'ok'
      },
      billingCycle: 'October Billing Cycle',
      issueDate: '01 Oct 2026'
    },
    {
      id: '4',
      invoiceNumber: '#INV-2026-0894',
      tenant: 'Brian Kimani',
      tenantInitials: 'BK',
      avatarVariant: 'tertiary',
      propertyUnit: 'Studio 09 • Eden Valley',
      dueDate: 'Oct 12, 2026',
      daysInfo: 'Staged Draft',
      breakdown: {
        baseRent: 42000,
        additionalCharges: 2000
      },
      amount: 44000,
      status: 'draft',
      delivery: {
        email: 'brian.k@email.com',
        emailStatus: 'pending'
      },
      billingCycle: 'October Billing Cycle',
      issueDate: '01 Oct 2026'
    }
  ]);

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

  getInvoices = this.invoices.asReadonly();
  getSummaryData = this.summaryData.asReadonly();

  getInvoiceById(id: string): InvoiceDetails | undefined {
    const invoice = this.invoices().find(inv => inv.id === id);
    if (!invoice) return undefined;

    return {
      ...invoice,
      monthlyBaseRent: invoice.breakdown.baseRent,
      waterAndCommon: invoice.breakdown.additionalCharges,
      amenities: invoice.breakdown.additionalCharges,
      garbageAndWater: 0,
      totalPayable: invoice.amount,
      deliveryVerificationTrace: {
        email: invoice.delivery.email || '',
        emailStatus: invoice.delivery.emailStatus || 'pending',
        phone: invoice.delivery.sms || '',
        phoneStatus: invoice.delivery.smsStatus || 'pending'
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
