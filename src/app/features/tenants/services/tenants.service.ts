import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Tenancy, Tenant, TenantsResponse } from '../models/tenants.interface';

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
}
