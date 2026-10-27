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

  private readonly totalRentOwedCache = signal<TotalRentOwedResponse | null>(null);
  private readonly allPropertiesIncomeCache = signal<AllPropertiesIncomeResponse | null>(null);
  private readonly portfolioOccupancyCache = signal<PortfolioOccupancyResponse | null>(null);
  toDate = new Date();
  fromDate = new Date(this.toDate);

  getTotalRentOwed(): Observable<TotalRentOwedResponse> {
    const cached = this.totalRentOwedCache();
    if (cached) {
      return new Observable(subscriber => subscriber.next(cached));
    }

    this.fromDate.setUTCDate(this.fromDate.getUTCDate() - 30);

    const params = new HttpParams()
      .set('page', 1)
      .set('limit', 10)
      .set('sortOrder', 'DESC')
      .set('fromDate', this.fromDate.toISOString().slice(0, 10))
      .set('toDate', this.toDate.toISOString().slice(0, 10));

    return this.http.get<TotalRentOwedResponse>(
      `${environment.apiUrl}/reports/total-rent-owed`,
      { params },
    ).pipe(
      tap(data => this.totalRentOwedCache.set(data)),
      shareReplay(1),
    );
  }

  getAllPropertiesIncome(): Observable<AllPropertiesIncomeResponse> {
    const cached = this.allPropertiesIncomeCache();
    if (cached) {
      return new Observable(subscriber => subscriber.next(cached));
    }

    this.fromDate.setUTCDate(this.fromDate.getUTCDate() - 30);

    const params = new HttpParams()
      .set('page', 1)
      .set('limit', 10)
      .set('sortOrder', 'DESC')
      .set('fromDate', this.fromDate.toISOString().slice(0, 10))
      .set('toDate', this.toDate.toISOString().slice(0, 10));

    return this.http.get<AllPropertiesIncomeResponse>(
      `${environment.apiUrl}/reports/all-properties-income`,
      { params },
    ).pipe(
      tap(data => this.allPropertiesIncomeCache.set(data)),
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
