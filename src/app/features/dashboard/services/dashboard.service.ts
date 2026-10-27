import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AllPropertiesIncomeResponse,
  InvoicesResponse,
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
    const adjustedFromDate = new Date(fromDate);
    adjustedFromDate.setHours(0, 0, 0, 0);

    const adjustedToDate = new Date(toDate);
    adjustedToDate.setHours(23, 59, 59, 999);

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const params = new HttpParams()
      .set('page', 1)
      .set('limit', 10)
      .set('fromDate', formatDate(adjustedFromDate))
      .set('toDate', formatDate(adjustedToDate));

    return this.http.get<TotalRentOwedResponse>(
      `${environment.apiUrl}/reports/total-rent-owed`,
      { params },
    ).pipe(
      shareReplay(1),
    );
  }

  getAllPropertiesIncome(fromDate: Date, toDate: Date): Observable<AllPropertiesIncomeResponse> {
    const adjustedFromDate = new Date(fromDate);
    adjustedFromDate.setHours(0, 0, 0, 0);

    const adjustedToDate = new Date(toDate);
    adjustedToDate.setHours(23, 59, 59, 999);

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const params = new HttpParams()
      .set('page', 1)
      .set('limit', 10)
      .set('fromDate', formatDate(adjustedFromDate))
      .set('toDate', formatDate(adjustedToDate));

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

  getInvoices(
    page: number,
    limit: number,
    sortOrder: 'ASC' | 'DESC',
    fromDate: Date,
    toDate: Date,
  ): Observable<InvoicesResponse> {
    const adjustedFromDate = new Date(fromDate);
    adjustedFromDate.setHours(0, 0, 0, 0);

    const adjustedToDate = new Date(toDate);
    adjustedToDate.setHours(23, 59, 59, 999);

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('sortOrder', sortOrder)
      .set('fromDate', formatDate(adjustedFromDate))
      .set('toDate', formatDate(adjustedToDate));

    return this.http.get<InvoicesResponse>(
      `${environment.apiUrl}/reports/invoices`,
      { params },
    ).pipe(
      shareReplay(1),
    );
  }
}
