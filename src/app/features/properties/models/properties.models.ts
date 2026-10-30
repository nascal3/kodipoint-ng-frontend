export interface ProjectedRentProperty {
  property: {
    id: string;
    name: string;
    address: string;
  };
  occupiedUnits: number;
  projectedRent: string;
  currency: string;
}

export interface ProjectedRentResponse {
  summary: {
    totalProjectedRent: string;
    totalPotentialRent: string;
    totalOccupiedUnits: number;
    totalVacantUnits: number;
    totalProperties: number;
  };
  properties: ProjectedRentProperty[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean,
    hasPreviousPage: boolean
  };
}

export interface PropertyItem {
  id: string;
  managerId: string;
  name: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  description: string | null;
  currency: string;
  monthlyRent: string;
  unitCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  occupancyRate: number;
  occupiedUnits: number;
  vacantUnits: number;
  minRent: number;
  maxRent: number;
}

export interface Country {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  countryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyRequest {
  name: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  countryId: string;
  description: string | null;
  currency: string;
  monthlyRent: number;
  unitCount: number;
  status: string;
}

export interface PropertiesResponse {
  data: PropertyItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean,
    hasPreviousPage: boolean
  };
}
