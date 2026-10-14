import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { SummaryCardComponent } from './components/summary-card/summary-card.component';
import { FinancialChartComponent } from './components/financial-chart/financial-chart.component';
import { InvoiceTableComponent } from './components/invoice-table/invoice-table.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        SummaryCardComponent,
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
    const cards = compiled.querySelectorAll('app-summary-card');
    expect(cards.length).toBe(3);
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
