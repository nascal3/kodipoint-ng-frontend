export interface TotalRentOwedResponse {
  summary: {
    totalOwed: string;
    totalOutstandingInvoices: number;
    totalProperties: number;
  };
}

export interface AllPropertiesIncomeResponse {
  summary: {
    totalIncome: string;
    totalPayments: number;
    totalProperties: number;
  };
  properties: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PortfolioOccupancyResponse {
  occupancyPercentage: number;
  occupiedUnits: number;
  totalUnits: number;
  vacantUnits: number;
}

export interface SummaryCardData {
  title: string;
  value: string;
  unitDetail?: string;
  icon: string;
  iconType: 'primary' | 'secondary' | 'error';
  footerType: 'calendar' | 'badge';
  footerText: string;
  badgeIcon?: string;
}

export interface MonthlyFinancialData {
  month: string;
  collected: number; // in Millions e.g. 13.8 or exact amount
  overdue: number; // in Millions e.g. 1.8
}

export interface InvoiceRecord {
  id: string;
  initials: string;
  avatarVariant: 'primary' | 'secondary' | 'tertiary' | 'error' | 'indigo';
  invoiceNumber: string;
  tenant: string;
  propertyUnit: string;
  total: number;
  amountPaid: number;
  balance: number;
  status: 'fully-paid' | 'partially-paid' | 'overdue';
  paymentMethod: string;
  methodVariant: 'mpesa' | 'rtgs' | 'bank';
  reference: string;
  dateTime: string;
}
