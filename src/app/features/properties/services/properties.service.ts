import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProjectedRentResponse } from '@app/features/properties/models/properties.models';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
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
}
