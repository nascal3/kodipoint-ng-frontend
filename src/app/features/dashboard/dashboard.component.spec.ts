import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { TotalRentOwedCardComponent } from './components/total-rent-owed-card/total-rent-owed-card.component';
import { PortfolioOccupancyCardComponent } from './components/portfolio-occupancy-card/portfolio-occupancy-card.component';
import { TotalRemittanceCardComponent } from './components/total-remittance-card/total-remittance-card.component';
import { FinancialChartComponent } from './components/financial-chart/financial-chart.component';
import { InvoiceTableComponent } from './components/invoice-table/invoice-table.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;

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
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the dashboard component', () => {
    expect(component).toBeTruthy();
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
