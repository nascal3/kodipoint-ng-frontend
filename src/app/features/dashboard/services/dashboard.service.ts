import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AllPropertiesIncomeResponse,
  PortfolioOccupancyResponse,
  TotalRentOwedResponse,
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  getTotalRentOwed(): Observable<TotalRentOwedResponse> {
    const toDate = new Date();
    const fromDate = new Date(toDate);
    fromDate.setUTCDate(fromDate.getUTCDate() - 30);

    const params = new HttpParams()
      .set('page', 1)
      .set('limit', 10)
      .set('sortOrder', 'DESC')
      .set('fromDate', fromDate.toISOString().slice(0, 10))
      .set('toDate', toDate.toISOString().slice(0, 10));

    return this.http.get<TotalRentOwedResponse>(
      `${environment.apiUrl}/reports/total-rent-owed`,
      { params },
    );
  }

  getAllPropertiesIncome(): Observable<AllPropertiesIncomeResponse> {
    const toDate = new Date();
    const fromDate = new Date(toDate);
    fromDate.setUTCDate(fromDate.getUTCDate() - 30);

    const params = new HttpParams()
      .set('page', 1)
      .set('limit', 10)
      .set('sortOrder', 'DESC')
      .set('fromDate', fromDate.toISOString().slice(0, 10))
      .set('toDate', toDate.toISOString().slice(0, 10));

    return this.http.get<AllPropertiesIncomeResponse>(
      `${environment.apiUrl}/reports/all-properties-income`,
      { params },
    );
  }

  getPortfolioOccupancy(): Observable<PortfolioOccupancyResponse> {
    return this.http.get<PortfolioOccupancyResponse>(
      `${environment.apiUrl}/properties/portfolio-occupancy`,
    );
  }
}
