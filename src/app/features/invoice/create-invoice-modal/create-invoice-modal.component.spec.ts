import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';
import { Tenant, Tenancy } from '@app/features/tenants/models/tenants.interface';
import { TenantsService } from '@app/features/tenants/services/tenants.service';
import { CreateInvoiceModalComponent } from './create-invoice-modal.component';

const createTenancy = (id: string, propertyName: string): Tenancy => ({
  id,
  managerId: 'manager-1',
  propertyId: `property-${id}`,
  propertyUnit: `unit-${id}`,
  propertyUnitId: `unit-${id}`,
  tenantId: 'tenant-1',
  startDate: '2024-01-01',
  endDate: null,
  status: 'ACTIVE',
  assignedAt: '2024-01-01',
  unassignedAt: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  property: { name: propertyName, currency: 'KES' },
  unit: {
    unitNumber: id,
    propertyUseType: 'RESIDENTIAL',
    marketRent: '25000',
    billingFrequency: 'MONTHLY',
    bedroomCount: '2',
  },
});

const firstTenancy = createTenancy('1A', 'Maple House');
const secondTenancy = createTenancy('2B', 'Cedar Court');

const createTenant = (tenancies: Tenancy[]): Tenant => ({
  id: 'tenant-1',
  managerId: 'manager-1',
  firstName: 'Alex',
  lastName: 'Tenant',
  email: 'alex@example.com',
  phone: '0700000000',
  status: 'ACTIVE',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  tenancies,
});

describe('CreateInvoiceModalComponent', () => {
  let fixture: ComponentFixture<CreateInvoiceModalComponent>;
  let component: CreateInvoiceModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateInvoiceModalComponent],
      providers: [
        provideNativeDateAdapter(),
        {
          provide: TenantsService,
          useValue: {
            getTenants: vi.fn().mockReturnValue(of({ data: [] })),
            searchTenants: vi.fn().mockReturnValue(of({ data: [] })),
            getTenantById: vi.fn().mockReturnValue(of(createTenant([firstTenancy, secondTenancy]))),
          },
        },
        { provide: SnackbarService, useValue: { error: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateInvoiceModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('keeps the invoice schedule hidden until a tenancy is selected', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.invoice-schedule-section')).toBeNull();
  });

  it('shows the schedule and highlights only the selected tenancy', async () => {
    component.selectedTenant.set(createTenant([firstTenancy, secondTenancy]));
    await fixture.whenStable();

    const cards = fixture.nativeElement.querySelectorAll('.tenancy-card') as NodeListOf<HTMLElement>;
    cards[0].click();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.invoice-schedule-section')).not.toBeNull();
    expect(cards[0].classList.contains('selected')).toBe(true);
    expect(cards[0].getAttribute('aria-pressed')).toBe('true');
    expect(cards[1].classList.contains('selected')).toBe(false);

    const issueDate = component.issueDateControl.value;
    const expectedDueDate = new Date();
    expectedDueDate.setDate(expectedDueDate.getDate() + 14);
    expect(issueDate?.toDateString()).toBe(new Date().toDateString());
    expect(component.dueDateControl.value?.toDateString()).toBe(expectedDueDate.toDateString());

    cards[1].click();
    await fixture.whenStable();

    expect(component.selectedTenancy()).toBe(secondTenancy);
    expect(cards[0].classList.contains('selected')).toBe(false);
    expect(cards[1].classList.contains('selected')).toBe(true);
  });

  it('allows selecting a tenancy with Enter and Space', async () => {
    component.selectedTenant.set(createTenant([firstTenancy, secondTenancy]));
    await fixture.whenStable();

    const cards = fixture.nativeElement.querySelectorAll('.tenancy-card') as NodeListOf<HTMLElement>;
    expect(cards[0].getAttribute('role')).toBe('button');
    expect(cards[0].getAttribute('tabindex')).toBe('0');

    cards[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(component.selectedTenancy()).toBe(firstTenancy);

    cards[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await fixture.whenStable();
    expect(component.selectedTenancy()).toBe(secondTenancy);
  });

  it('clears the selected tenancy and hides the schedule when changing tenant', async () => {
    component.selectedTenant.set(createTenant([firstTenancy, secondTenancy]));
    component.selectTenancy(firstTenancy);
    await fixture.whenStable();

    const changeTenantButton = fixture.nativeElement.querySelector('.change-tenant-button') as HTMLButtonElement;
    changeTenantButton.click();
    await fixture.whenStable();

    expect(component.selectedTenant()).toBeNull();
    expect(component.selectedTenancy()).toBeNull();
    expect(fixture.nativeElement.querySelector('.invoice-schedule-section')).toBeNull();
  });

  it('validates that the due date is not before the issue date', () => {
    component.selectTenancy(firstTenancy);
    const previousDay = new Date();
    previousDay.setDate(previousDay.getDate() - 1);

    component.dueDateControl.setValue(previousDay);

    expect(component.dueDateControl.hasError('dueDateBeforeIssueDate')).toBe(true);
  });
});