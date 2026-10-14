import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceTableComponent } from './invoice-table.component';

describe('InvoiceTableComponent', () => {
  let fixture: ComponentFixture<InvoiceTableComponent>;
  let component: InvoiceTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the invoice table component', () => {
    expect(component).toBeTruthy();
  });

  it('should render table title and subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.table-title')?.textContent?.trim()).toBe(
      'Tenant Invoice Payments & Remittances',
    );
    expect(compiled.querySelector('.table-subtitle')?.textContent?.trim()).toBe(
      'Tenant invoice settlements & payment allocations',
    );
  });

  it('should render invoice rows in the table', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('.table-data-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should filter rows on search input', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const searchInput = compiled.querySelector('.search-input') as HTMLInputElement;

    searchInput.value = 'Sarah Wanjiku';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const rows = compiled.querySelectorAll('.table-data-row');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('INV-2024-089');
  });
});
