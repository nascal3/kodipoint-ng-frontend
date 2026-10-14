import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryCardComponent, SummaryCardData } from './summary-card.component';

describe('SummaryCardComponent', () => {
  let fixture: ComponentFixture<SummaryCardComponent>;
  let component: SummaryCardComponent;

  const mockData: SummaryCardData = {
    title: 'Total Rent Owed',
    value: 'KES 1,420,000',
    icon: 'pending_actions',
    iconType: 'error',
    footerType: 'calendar',
    footerText: 'Based on last 30 days',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
  });

  it('should render card title and value', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.card-title')?.textContent?.trim()).toBe('Total Rent Owed');
    expect(compiled.querySelector('.card-value')?.textContent?.trim()).toBe('KES 1,420,000');
  });

  it('should render calendar footer when footerType is calendar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.footer-text')?.textContent?.trim()).toBe(
      'Based on last 30 days',
    );
  });

  it('should render badge footer when footerType is badge', () => {
    const badgeData: SummaryCardData = {
      title: 'Portfolio Occupancy',
      value: '24',
      unitDetail: '/ 28 Units',
      icon: 'domain',
      iconType: 'secondary',
      footerType: 'badge',
      footerText: '86% occupied',
      badgeIcon: 'check_circle',
    };

    fixture.componentRef.setInput('data', badgeData);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.unit-detail')?.textContent?.trim()).toBe('/ 28 Units');
    expect(compiled.querySelector('.status-pill')?.textContent).toContain('86% occupied');
  });
});
