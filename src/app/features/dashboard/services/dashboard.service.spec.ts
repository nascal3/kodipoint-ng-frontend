import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DashboardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('requests income for all properties with pagination and date range', () => {
    service.getAllPropertiesIncome().subscribe((response) => {
      expect(response.summary.totalIncome).toBe('0.00');
      expect(response.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    const request = httpTestingController.expectOne(
      (req) => req.url === `${environment.apiUrl}/reports/all-properties-income`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('1');
    expect(request.request.params.get('limit')).toBe('10');
    expect(request.request.params.get('sortOrder')).toBe('DESC');
    expect(request.request.params.has('fromDate')).toBe(true);
    expect(request.request.params.has('toDate')).toBe(true);
    request.flush({
      summary: {
        totalIncome: '0.00',
        totalPayments: 0,
        totalProperties: 0,
      },
      properties: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });
});
