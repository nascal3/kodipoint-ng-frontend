export interface TenantItem {
  id: string;
  tenant: Tenant;
  name: string;
  phone: string;
  email: string;
  premises: string;
  unit: string;
  propertyUseType: string;
  unitType: string;
  currency: string;
  startDate: string;
  tenure: string;
  endDate: string;
  endTenure: string;
  contractRent: string;
  rentPeriod: string;
  emergencyContact: string;
  emergencyPhone: string;
  tenancyStatus: 'active' | 'notice' | 'pending' | 'ended';
}

export type TenantStatus = 'ACTIVE' | 'NOTICE' | 'ENDED';

export interface CreateTenantRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  identificationDoc: 'NATIONAL_ID' | 'PASSPORT';
  identificationDocNumber: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
}

export interface UpdateTenantRequest extends CreateTenantRequest {
  status: TenantStatus;
}

export interface Tenancy {
  id: string;
  managerId: string;
  propertyId: string;
  propertyUnit: string;
  propertyUnitId: string;
  tenantId: string;
  startDate: string;
  endDate: string | null;
  status: string;
  assignedAt: string;
  unassignedAt: string | null;
  createdAt: string;
  updatedAt: string;
  property: {
    name: string;
    currency: string;
  };
  unit: {
    unitNumber: string;
    propertyUseType: string;
    marketRent: string;
    billingFrequency: string;
    bedroomCount: string;
  };
}

export interface Tenant {
  id: string;
  managerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  identificationDoc?: 'NATIONAL_ID' | 'PASSPORT';
  identificationDocNumber?: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tenancies: Tenancy[];
}

export interface SendTenantMessageRequest {
  email: string;
  phone: string;
  sendSms: boolean;
  sendEmail: boolean;
  subject: string;
  message: string;
}

export interface TenantsResponse {
  data: Tenant[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface TenantSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

export interface TenantSearchResponse {
  data: TenantSearchResult[];
  pagination: TenantsResponse['pagination'];
}

export interface TenanciesResponse {
  data: Tenancy[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type TenancyStatus = 'ACTIVE' | 'PENDING' | 'NOTICE' | 'ENDED';

export interface CreateTenancyRequest {
  status: TenancyStatus;
  propertyId: string;
  propertyUnit: string;
  tenantId: string;
  startDate: string;
  notes: string;
}

export interface UnassignTenancyRequest {
  endDate: string;
}
