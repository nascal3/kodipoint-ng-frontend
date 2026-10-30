import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { City, CreatePropertyRequest, ProjectedRentResponse, PropertiesResponse, Country } from '@app/features/properties/models/properties.models';

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
    createdAt: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Observable<PropertiesResponse> {
    return this.http.get<PropertiesResponse>(
      `${environment.apiUrl}/properties?page=${page}&limit=${limit}&sortBy=${createdAt}&sortOrder=${sortOrder}`
    );
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
