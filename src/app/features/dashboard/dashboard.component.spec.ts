import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { TotalRentOwedCardComponent } from './components/total-rent-owed-card/total-rent-owed-card.component';
import { PortfolioOccupancyCardComponent } from './components/portfolio-occupancy-card/portfolio-occupancy-card.component';
import { TotalRemittanceCardComponent } from './components/total-remittance-card/total-remittance-card.component';
import { FinancialChartComponent } from './components/financial-chart/financial-chart.component';
import { InvoiceTableComponent } from './components/invoice-table/invoice-table.component';
import { SnackbarService } from '../../shared/components/snackbar/snackbar.service';
import { DashboardService } from './services/dashboard.service';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  const dashboardService = {
    getTotalRentOwed: vi.fn().mockReturnValue(
      of({
        summary: {
          totalOwed: '0.00',
          totalOutstandingInvoices: 0,
          totalProperties: 0,
        },
      }),
    ),
    getPortfolioOccupancy: vi.fn().mockReturnValue(
      of({
        occupancyPercentage: 0,
        occupiedUnits: 0,
        totalUnits: 0,
        vacantUnits: 0,
      }),
    ),
    getAllPropertiesIncome: vi.fn().mockReturnValue(
      of({
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
      }),
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        TotalRentOwedCardComponent,
        PortfolioOccupancyCardComponent,
        TotalRemittanceCardComponent,
        FinancialChartComponent,
        InvoiceTableComponent,
      ],
      providers: [
        { provide: DashboardService, useValue: dashboardService },
        { provide: SnackbarService, useValue: { error: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should show the total rent owed summary from the report', () => {
    expect(component.totalRentOwed()).toBe('KES 0.00');
  });

  it('should render 3 summary cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const totalRentOwedCard = compiled.querySelector('app-total-rent-owed-card');
    const portfolioOccupancyCard = compiled.querySelector('app-portfolio-occupancy-card');
    const totalRemittanceCard = compiled.querySelector('app-total-remittance-card');
    expect(totalRentOwedCard).toBeTruthy();
    expect(portfolioOccupancyCard).toBeTruthy();
    expect(totalRemittanceCard).toBeTruthy();
  });

  it('should show portfolio occupancy from the API response', () => {
    expect(component.portfolioOccupancyValue()).toBe('0');
    expect(component.portfolioOccupancyUnit()).toBe('/ 0 Units');
    expect(component.portfolioOccupancyFooter()).toBe('0% occupied');
  });

  it('should show total remittance from the income report', () => {
    expect(component.totalRemittance()).toBe('KES 0.00');
  });

  it('should render the financial activity chart', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const chart = compiled.querySelector('app-financial-chart');
    expect(chart).toBeTruthy();
  });

  it('should render the invoice table', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const table = compiled.querySelector('app-invoice-table');
    expect(table).toBeTruthy();
  });
});
