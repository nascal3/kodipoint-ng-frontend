import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  City,
  CreatePropertyChargesRequest,
  CreatePropertyRequest,
  CreatePropertyResponse,
  CreatePropertyUnitRequest,
  ProjectedRentResponse,
  PropertiesResponse,
  Country,
  PropertyChargesResponse,
  PropertyUnitsResponse,
  UpdatePropertyCharge,
  propertyUseType,
} from '@app/features/properties/models/properties.models';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private readonly http = inject(HttpClient);

  getProjectedRent(
    page: number = 1,
    limit: number = 10,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Observable<ProjectedRentResponse> {
    return this.http.get<ProjectedRentResponse>(
      `${environment.apiUrl}/reports/projected-rent?page=${page}&limit=${limit}&sortOrder=${sortOrder}`
    );
  }

  getProperties(
    page: number = 1,
    limit: number = 10,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    filters: { country?: string; status?: string; name?: string } = {}
  ): Observable<PropertiesResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('sortOrder', sortOrder);

    if (filters.country) params = params.set('country', filters.country);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.name) params = params.set('name', filters.name);

    return this.http.get<PropertiesResponse>(`${environment.apiUrl}/properties`, { params });
  }

  createProperty(property: CreatePropertyRequest): Observable<CreatePropertyResponse> {
    return this.http.post<CreatePropertyResponse>(`${environment.apiUrl}/properties`, property);
  }

  createPropertyUnit(unit: CreatePropertyUnitRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/properties/units`, unit);
  }

  createPropertyCharges(request: CreatePropertyChargesRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/properties/charges`, request);
  }

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${environment.apiUrl}/locations/countries`);
  }

  getCities(countryId: string): Observable<City[]> {
    return this.http.get<City[]>(`${environment.apiUrl}/locations/countries/${encodeURIComponent(countryId)}/cities`);
  }

  getPropertyCharges(
    propertyId: string,
    page: number = 1,
    limit: number = 10,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Observable<PropertyChargesResponse> {
    return this.http.get<PropertyChargesResponse>(
      `${environment.apiUrl}/properties/charges?page=${page}&limit=${limit}&sortOrder=${sortOrder}&propertyId=${propertyId}`
    );
  }

  getPropertyUnits(
    propertyId: string,
    page: number = 1,
    limit: number = 10,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    filters: { propertyUseType?: propertyUseType; status?: string; unitNumber?: string } = {}
  ): Observable<PropertyUnitsResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('sortOrder', sortOrder)
      .set('propertyId', propertyId);

    const filteredParams = Object.entries(filters).reduce(
      (currentParams, [key, value]) => value ? currentParams.set(key, value) : currentParams,
      params
    );

    return this.http.get<PropertyUnitsResponse>(`${environment.apiUrl}/properties/units`, { params: filteredParams });
  }

  updatePropertyCharge(chargeId: string, updates: UpdatePropertyCharge): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/properties/charges/${chargeId}`, updates);
  }

  deletePropertyCharge(chargeId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/properties/charges/${chargeId}`);
  }

  updateProperty(propertyId: string, property: CreatePropertyRequest): Observable<CreatePropertyResponse> {
    return this.http.patch<CreatePropertyResponse>(`${environment.apiUrl}/properties/${propertyId}`, property);
  }
}
