import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
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

  private readonly portfolioOccupancyCache = signal<PortfolioOccupancyResponse | null>(null);

  getTotalRentOwed(fromDate: Date, toDate: Date): Observable<TotalRentOwedResponse> {
    const params = new HttpParams()
      .set('page', 1)
      .set('limit', 10)
      .set('fromDate', fromDate.toISOString().slice(0, 10))
      .set('toDate', toDate.toISOString().slice(0, 10));

    return this.http.get<TotalRentOwedResponse>(
      `${environment.apiUrl}/reports/total-rent-owed`,
      { params },
    ).pipe(
      shareReplay(1),
    );
  }

  getAllPropertiesIncome(fromDate: Date, toDate: Date): Observable<AllPropertiesIncomeResponse> {
    const params = new HttpParams()
      .set('page', 1)
      .set('limit', 10)
      .set('fromDate', fromDate.toISOString().slice(0, 10))
      .set('toDate', toDate.toISOString().slice(0, 10));

    return this.http.get<AllPropertiesIncomeResponse>(
      `${environment.apiUrl}/reports/all-properties-income`,
      { params },
    ).pipe(
      shareReplay(1),
    );
  }

  getPortfolioOccupancy(): Observable<PortfolioOccupancyResponse> {
    const cached = this.portfolioOccupancyCache();
    if (cached) {
      return new Observable(subscriber => subscriber.next(cached));
    }

    return this.http.get<PortfolioOccupancyResponse>(
      `${environment.apiUrl}/properties/portfolio-occupancy`,
    ).pipe(
      tap(data => this.portfolioOccupancyCache.set(data)),
      shareReplay(1),
    );
  }
}
