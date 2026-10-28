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
