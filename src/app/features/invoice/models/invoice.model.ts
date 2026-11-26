export interface InvoiceSummaryData {
  title: string;
  value: string;
  subtitle: string;
  progress?: number;
  progressLabel?: string;
  iconClass?: string;
}

export interface InvoiceSummaryResponse {
  summary: {
    totalInvoiced: string;
    totalCollected: string;
    totalUnpaid: string;
    settledPercentage: number;
    paidUnits: number;
    unpaidTenancies: number;
    currency: string;
  };
}

export type InvoiceStatus =
  | 'paid'
  | 'overdue'
  | 'sent'
  | 'issued'
  | 'draft'
  | 'partially_paid'
  | 'cancelled'
  | 'pending';

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
  status: InvoiceStatus;
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

export interface InvoiceTenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface InvoiceProperty {
  id: string;
  name: string;
}

export interface InvoicePropertyUnit {
  id: string;
  unitNumber: string;
}

export interface InvoiceApiItem {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  totalAmount: string;
  amountPaid: string;
  balanceDue: string;
  status: string;
  notes?: string;
  smsSent?: string;
  emailSend?: string;
  paidDate?: string;
  tenant?: InvoiceTenant;
  property?: InvoiceProperty;
  propertyUnit?: InvoicePropertyUnit;
}

export interface InvoicePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface InvoiceListResponse {
  data: InvoiceApiItem[];
  pagination: InvoicePagination;
}

export interface InvoiceQueryParams {
  status?: string;
  invoiceNumber?: string;
  propertyId?: string;
  tenantId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}
