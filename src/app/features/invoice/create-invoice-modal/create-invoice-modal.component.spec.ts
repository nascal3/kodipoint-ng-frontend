import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { formatDate } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';
import { Tenant, Tenancy } from '@app/features/tenants/models/tenants.interface';
import { TenantsService } from '@app/features/tenants/services/tenants.service';
import { environment } from '../../../../environments/environment';
import type { InvoicePreview } from '../models/invoice.model';
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
const invoicesUrl = `${environment.apiUrl}/invoices`;
const previewUrl = `${invoicesUrl}/preview`;
const invoicePreview: InvoicePreview = {
  tenancyId: firstTenancy.id,
  propertyId: firstTenancy.propertyId,
  tenantId: firstTenancy.tenantId,
  invoiceItems: [
    { description: 'Monthly rent', quantity: '1', unitAmount: '1200.00', totalAmount: '1200.00' },
    { description: 'Balance brought forward', quantity: '1', unitAmount: '200.00', totalAmount: '200.00' },
  ],
  calculation: {
    rent: '1200.00',
    serviceCharges: '0.00',
    balanceBroughtForward: '200.00',
    subtotal: '1400.00',
    totalAmount: '1400.00',
    availablePrepaymentCredit: '2000.00',
    prepaymentCreditApplied: '1400.00',
    amountPaid: '1400.00',
    balanceDue: '0.00',
    projectedStatus: 'PAID',
  },
  balanceCarryForward: [{ sourceInvoiceId: 'old', sourceInvoiceNumber: 'INV-OLD', amount: '200.00' }],
  prepaymentsToApply: [{ paymentId: 'payment-1', paymentDate: '2024-01-01', amount: '1400.00' }],
};

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
  let http: HttpTestingController;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateInvoiceModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNativeDateAdapter(),
        {
          provide: TenantsService,
          useValue: {
            getTenants: vi.fn().mockReturnValue(of({ data: [] })),
            searchTenants: vi.fn().mockReturnValue(of({ data: [] })),
            getTenantById: vi.fn().mockReturnValue(of(createTenant([firstTenancy, secondTenancy]))),
          },
        },
        { provide: SnackbarService, useValue: { error: vi.fn(), success: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateInvoiceModalComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  async function openReview(notes = '') {
    component.selectedTenant.set(createTenant([firstTenancy]));
    component.selectTenancy(firstTenancy);
    component.notesControl.setValue(notes);
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.modal-submit-button')!.click();
    return http.expectOne({ method: 'POST', url: previewUrl });
  }

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

  it('posts the selected tenancy and local dates and renders the server calculation', async () => {
    const request = await openReview('Invoice notes');
    expect(request.request.body).toEqual({
      tenancyId: firstTenancy.id,
      issueDate: formatDate(component.issueDateControl.value!, 'yyyy-MM-dd', 'en-US'),
      dueDate: formatDate(component.dueDateControl.value!, 'yyyy-MM-dd', 'en-US'),
      notes: 'Invoice notes',
    });
    await fixture.whenStable();
    expect(element.querySelector('.review-feedback')?.textContent).toContain('Loading invoice preview');
    request.flush(invoicePreview);
    await fixture.whenStable();

    expect(element.querySelector('h2')?.textContent).toContain('Review & Confirm Invoice');
    expect(element.querySelector('.review-table')?.textContent).toContain('Monthly rent');
    expect(element.querySelector('.review-settlement')?.textContent).toContain('INV-OLD');
    expect(element.querySelector('.review-settlement')?.textContent).toContain('payment-1');
    expect(element.querySelector('.review-net')?.textContent).toContain('KES 0.00');
    expect(element.querySelector('.review-totals')?.textContent).toContain('KES 600.00');

    element.querySelector<HTMLButtonElement>('.review-actions .modal-cancel-button')!.click();
    await fixture.whenStable();
    expect(element.querySelector('h2')?.textContent).toContain('Create Invoice');
    expect(element.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe('Invoice notes');
    expect(component.selectedTenancy()).toBe(firstTenancy);
  });

  it('cancels a stale preview when review fields change and allows retry on failure', async () => {
    const initialRequest = await openReview();
    await fixture.whenStable();

    const newDueDate = new Date(component.dueDateControl.value!);
    newDueDate.setDate(newDueDate.getDate() + 1);
    component.dueDateControl.setValue(newDueDate);
    const notes = element.querySelector<HTMLTextAreaElement>('#review-notes')!;
    notes.value = 'Revised notes';
    notes.dispatchEvent(new Event('input', { bubbles: true }));

    expect(initialRequest.cancelled).toBe(true);
    const updatedRequest = await vi.waitFor(() => http.expectOne(previewUrl));
    expect(updatedRequest.request.body).toEqual({
      ...initialRequest.request.body,
      dueDate: formatDate(newDueDate, 'yyyy-MM-dd', 'en-US'),
      notes: 'Revised notes',
    });
    updatedRequest.flush({ message: 'Preview unavailable' }, { status: 503, statusText: 'Unavailable' });
    await fixture.whenStable();

    expect(element.querySelector('.review-feedback [role="alert"]')?.textContent).toContain('Preview unavailable');
    expect(element.querySelector<HTMLButtonElement>('.review-actions .modal-submit-button')?.disabled).toBe(true);
    element.querySelector<HTMLButtonElement>('.review-feedback button')!.click();
    http.expectOne(previewUrl).flush(invoicePreview);
    await fixture.whenStable();

    expect(element.querySelector<HTMLButtonElement>('.review-actions .modal-submit-button')?.disabled).toBe(false);
  });

  it('retries delivery without creating a second invoice', async () => {
    const created = vi.fn();
    component.invoiceCreated.subscribe(created);
    const previewRequest = await openReview('Dispatch notes');
    previewRequest.flush(invoicePreview);
    await fixture.whenStable();

    element.querySelectorAll<HTMLInputElement>('.review-footer input')[0].click();
    const submit = element.querySelector<HTMLButtonElement>('.review-actions .modal-submit-button')!;
    submit.click();
    const createRequest = http.expectOne({ method: 'POST', url: invoicesUrl });
    expect(createRequest.request.body).toEqual(previewRequest.request.body);
    createRequest.flush({ invoice: { id: 'invoice-1', invoiceNumber: 'INV-1' } });

    const deliveryUrl = `${invoicesUrl}/invoice-1/send`;
    const deliveryRequest = http.expectOne({ method: 'POST', url: deliveryUrl });
    expect(deliveryRequest.request.body).toEqual({ channels: ['SMS'] });
    deliveryRequest.flush({ message: 'Delivery unavailable' }, { status: 503, statusText: 'Unavailable' });
    await fixture.whenStable();

    expect(element.querySelector('.review-submit-error')?.textContent).toContain('Invoice #INV-1 was created');
    expect(submit.textContent).toContain('Retry Dispatch');
    expect(created).not.toHaveBeenCalled();
    submit.click();
    http.expectNone(invoicesUrl);
    http.expectOne(deliveryUrl).flush({ message: 'Invoice delivery queued' });
    expect(created).toHaveBeenCalledTimes(1);
  });
});
