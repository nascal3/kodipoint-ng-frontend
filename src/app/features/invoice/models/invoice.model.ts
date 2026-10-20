export interface InvoiceSummaryData {
  title: string;
  value: string;
  subtitle: string;
  progress?: number;
  progressLabel?: string;
  iconClass?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenant: string;
  tenantInitials: string;
  avatarVariant: 'primary' | 'secondary' | 'tertiary' | 'error' | 'indigo';
  propertyUnit: string;
  dueDate: string;
  daysInfo?: string; // e.g., "Paid on Oct 03" or "3 days overdue"
  breakdown: {
    baseRent: number;
    additionalCharges: number;
  };
  amount: number;
  status: 'paid' | 'overdue' | 'sent' | 'draft';
  delivery: {
    email?: string;
    emailStatus?: 'delivered' | 'pending';
    sms?: string;
    smsStatus?: 'ok' | 'pending';
  };
  billingCycle?: string;
  issueDate?: string;
  amenities?: number;
  garbageAndWater?: number;
  totalPayable?: number;
}

export interface InvoiceDetails extends Invoice {
  monthlyBaseRent: number;
  waterAndCommon: number;
  amenities: number;
  garbageAndWater: number;
  totalPayable: number;
  deliveryVerificationTrace: {
    email: string;
    emailStatus: 'delivered' | 'pending';
    phone: string;
    phoneStatus: 'ok' | 'pending';
  };
}
