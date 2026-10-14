import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinancialChartComponent } from './financial-chart.component';

describe('FinancialChartComponent', () => {
  let fixture: ComponentFixture<FinancialChartComponent>;
  let component: FinancialChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FinancialChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the financial chart component', () => {
    expect(component).toBeTruthy();
  });

  it('should render chart title and subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.chart-title')?.textContent?.trim()).toBe(
      'Financial Activity & Rent Streams',
    );
    expect(compiled.querySelector('.chart-subtitle')?.textContent?.trim()).toBe(
      'Monthly collection performance across all portfolio units in Nairobi',
    );
  });

  it('should toggle legend states when clicking legend pills', () => {
    expect(component.showCollected()).toBe(true);
    component.toggleCollected();
    expect(component.showCollected()).toBe(false);

    expect(component.showOverdue()).toBe(true);
    component.toggleOverdue();
    expect(component.showOverdue()).toBe(false);
  });
});
