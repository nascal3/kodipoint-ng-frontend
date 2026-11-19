import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateTenantRequest,
  CreateTenancyRequest,
  SendTenantMessageRequest,
  Tenant,
  TenantSearchResponse,
  Tenancy,
  TenantsResponse,
  TenanciesResponse,
  UpdateTenantRequest,
} from '../models/tenants.interface';
import { ProjectedRentResponse } from '@app/features/properties/models/properties.models';

@Injectable({
  providedIn: 'root',
})
export class TenantsService {
  private readonly http = inject(HttpClient);

  getTenants(
    page: number = 1,
    limit: number = 10,
    filters: { status?: string; name?: string } = {}
  ): Observable<TenantsResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);

    if (filters.status) params = params.set('status', filters.status);
    if (filters.name) params = params.set('name', filters.name);

    return this.http.get<TenantsResponse>(`${environment.apiUrl}/tenants`, { params });
  }

  searchTenants(query: string, page: number = 1, limit: number = 10): Observable<TenantSearchResponse> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page)
      .set('limit', limit);

    return this.http.get<TenantSearchResponse>(`${environment.apiUrl}/tenants/search`, { params });
  }

  createTenant(tenant: CreateTenantRequest): Observable<Tenant> {
    return this.http.post<Tenant>(`${environment.apiUrl}/tenants`, tenant);
  }

  createTenancy(tenancy: CreateTenancyRequest): Observable<Tenancy> {
    return this.http.post<Tenancy>(`${environment.apiUrl}/tenancies`, tenancy);
  }

  updateTenant(id: string, tenant: UpdateTenantRequest): Observable<Tenant> {
    return this.http.patch<Tenant>(`${environment.apiUrl}/tenants/${id}`, tenant);
  }

  sendTenantMessage(payload: SendTenantMessageRequest): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/documents/send-tenant-message`, payload);
  }

  getProjectedRent(
    page: number = 1,
    limit: number = 10,
    sortOrder: string = 'DESC'
  ): Observable<ProjectedRentResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('sortOrder', sortOrder);

    return this.http.get<ProjectedRentResponse>(`${environment.apiUrl}/reports/projected-rent`, { params });
  }

  getExpiringTenancies(
    page: number = 1,
    limit: number = 10
  ): Observable<TenanciesResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('status', 'EXPIRING');

    return this.http.get<TenanciesResponse>(`${environment.apiUrl}/tenancies`, { params });
  }

  getActiveTenancies(
    page: number = 1,
    limit: number = 10
  ): Observable<TenanciesResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('status', 'ACTIVE');

    return this.http.get<TenanciesResponse>(`${environment.apiUrl}/tenancies`, { params });
  }
}
