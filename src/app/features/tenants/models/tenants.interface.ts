export interface TenantItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  premises: string;
  unit: string;
  unitType: string;
  startDate: string;
  tenure: string;
  contractRent: string;
  rentPeriod: string;
  emergencyContact: string;
  emergencyPhone: string;
  tenancyStatus: 'active' | 'notice' | 'pending';
}

export interface CreateTenantRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
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
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tenancies: Tenancy[];
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
