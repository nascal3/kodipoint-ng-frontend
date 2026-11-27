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

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceItems?: InvoiceLineItem[];
  tenant: string;
  tenantInitials: string;
  avatarVariant: 'primary' | 'secondary' | 'tertiary' | 'error' | 'indigo';
  propertyUnit: string;
  currency: string;
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
  balanceBroughtForward: string;
  prepaymentBroughtForward: string;
  totalPayable?: number;
}

export interface InvoiceDetails extends Invoice {
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
  managerId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  identificationDoc?: string;
  identificationDocNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceProperty {
  id: string;
  managerId?: string;
  name: string;
  propertyUseType?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryId?: string;
  description?: string;
  currency: string;
  monthlyRent?: string;
  unitCount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoicePropertyUnit {
  id: string;
  managerId?: string;
  propertyId?: string;
  propertyUseType?: string;
  unitNumber: string;
  stub?: string;
  bedroomCount?: number;
  status?: string;
  marketRent?: string;
  billingFrequency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceApiInvoiceItem {
  id: string;
  invoiceId: string;
  unitChargePropertyUnitId?: string;
  unitChargePropertyChargeId?: string;
  unitChargeValidFrom?: string;
  description: string;
  quantity: string;
  unitAmount: string;
  totalAmount: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInvoiceRequest {
  tenancyId: string;
  issueDate: string;
  dueDate: string;
  notes: string;
}

export interface InvoicePreview {
  tenancyId: string;
  propertyId: string;
  tenantId: string;
  invoiceItems: Pick<
    InvoiceApiInvoiceItem, 'description' | 'quantity' | 'unitAmount' | 'totalAmount'
  >[];
  calculation: {
    rent: string;
    serviceCharges: string;
    balanceBroughtForward: string;
    subtotal: string;
    totalAmount: string;
    availablePrepaymentCredit: string;
    prepaymentCreditApplied: string;
    amountPaid: string;
    balanceDue: string;
    projectedStatus: 'PAID' | 'PARTIALLY_PAID' | 'ISSUED';
  };
  balanceCarryForward: {
    sourceInvoiceId: string;
    sourceInvoiceNumber: string;
    amount: string;
  }[];
  prepaymentsToApply: {
    paymentId: string;
    paymentDate: string | null;
    amount: string;
  }[];
}

export interface CreateInvoiceResponse {
  invoice: Pick<InvoiceApiItem, 'id' | 'invoiceNumber'>;
}

export type InvoiceDeliveryChannel = 'EMAIL' | 'SMS';

export interface InvoiceApiItem {
  id: string;
  managerId?: string;
  propertyId?: string;
  tenancyId?: string;
  tenantId?: string;
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
  createdAt?: string;
  updatedAt?: string;
  tenant?: InvoiceTenant;
  property?: InvoiceProperty;
  propertyUnit?: InvoicePropertyUnit;
  invoiceItems?: InvoiceApiInvoiceItem[];
  balanceBroughtForward: string;
  prepaymentBroughtForward: string;
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
