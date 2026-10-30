import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  City,
  CreatePropertyRequest,
  ProjectedRentResponse,
  PropertiesResponse,
  Country
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

  createProperty(property: CreatePropertyRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/properties`, property);
  }

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${environment.apiUrl}/locations/countries`);
  }

  getCities(countryId: string): Observable<City[]> {
    return this.http.get<City[]>(`${environment.apiUrl}/locations/countries/${encodeURIComponent(countryId)}/cities`);
  }
}
