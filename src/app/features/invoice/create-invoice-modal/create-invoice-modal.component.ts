import { CdkTrapFocus } from '@angular/cdk/a11y';
import { DatePipe, DecimalPipe, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Injector, OnInit, afterNextRender, computed, inject, output, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, debounceTime, distinctUntilChanged, filter, finalize, map, merge, of, startWith, switchMap, tap, timer } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { TenantsService } from '@app/features/tenants/services/tenants.service';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';
import type { Tenant, TenantSearchResult, Tenancy } from '@app/features/tenants/models/tenants.interface';
import type { CreateInvoiceRequest, CreateInvoiceResponse, InvoiceDeliveryChannel, InvoicePreview } from '../models/invoice.model';
import { InvoiceService } from '../services/invoice.service';

@Component({
  selector: 'app-create-invoice-modal',
  standalone: true,
  imports: [
    CdkTrapFocus,
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    ...MATERIAL_MODULES,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-invoice-modal.component.html',
  styleUrls: ['./create-invoice-modal.component.scss', './invoice-review.scss'],
})
export class CreateInvoiceModalComponent implements OnInit {
  private readonly tenantsService = inject(TenantsService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly previewRefresh = new Subject<void>();
  private readonly dialogTitle = viewChild<ElementRef<HTMLElement>>('dialogTitle');

  readonly closed = output<void>();
  readonly invoiceCreated = output<void>();

  readonly tenants = signal<TenantSearchResult[]>([]);
  readonly selectedTenant = signal<Tenant | null>(null);
  readonly tenantOptions = computed(() => {
    const selected = this.selectedTenant();
    const results = this.tenants();
    // Only include selected tenant in options if it's not already in results
    if (selected && !results.some((tenant) => tenant.id === selected.id)) {
      const selectedSearchResult: TenantSearchResult = {
        id: selected.id,
        firstName: selected.firstName,
        lastName: selected.lastName,
        email: selected.email,
        phone: selected.phone,
        status: selected.status,
        createdAt: selected.createdAt,
      };
      return [selectedSearchResult, ...results];
    }
    return results;
  });
  readonly isLoadingTenants = signal(false);
  readonly tenantsError = signal('');
  readonly selectedTenancy = signal<Tenancy | null>(null);
  readonly tenantSearchControl = new FormControl('', { nonNullable: true });
  readonly tenantIdControl = new FormControl('', { nonNullable: true });
  readonly issueDateControl = new FormControl<Date | null>(null, [Validators.required, this.minDateValidator]);
  readonly dueDateControl = new FormControl<Date | null>(null, [Validators.required, this.minDueDateValidator.bind(this)]);
  readonly notesControl = new FormControl('', { nonNullable: true });
  readonly today = new Date();

  readonly isReviewing = signal(false);
  readonly isPreviewLoading = signal(false);
  readonly preview = signal<InvoicePreview | null>(null);
  readonly previewError = signal('');
  readonly isSubmitting = signal(false);
  readonly submitError = signal('');
  readonly createdInvoice = signal<CreateInvoiceResponse['invoice'] | null>(null);
  readonly sendEmail = signal(false);
  readonly sendSms = signal(false);
  readonly currency = computed(() => this.selectedTenancy()?.property?.currency || 'KES');
  readonly remainingCredit = computed(() => {
    const calculation = this.preview()?.calculation;
    return calculation
      ? Math.max(0, Number(calculation.availablePrepaymentCredit) - Number(calculation.prepaymentCreditApplied))
      : 0;
  });

  ngOnInit(): void {
    // Subscribe to issue date changes to revalidate due date
    this.issueDateControl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.dueDateControl.updateValueAndValidity({ emitEvent: false });
    });

    this.tenantSearchControl.valueChanges.pipe(
      startWith(this.tenantSearchControl.value),
      tap(() => {
        this.tenantsError.set('');
        this.tenants.set([]);
      }),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        const query = value.trim();
        this.isLoadingTenants.set(true);
        this.tenantsError.set('');
        const request = query.length < 2
          ? this.tenantsService.getTenants(1, 10)
          : this.tenantsService.searchTenants(query, 1, 10);

        return request.pipe(
          catchError((error: unknown) => {
            console.error('Failed to load tenants:', error);
            this.tenants.set([]);
            this.tenantsError.set(this.errorMessage(error, 'Could not load tenants. Please try again.'));
            this.snackbarService.error(this.tenantsError());
            this.isLoadingTenants.set(false);
            return EMPTY;
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((response) => {
      this.tenants.set(
        response.data
          .slice()
          .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
          .map(({ id, firstName, lastName, email, phone, status, createdAt }) => ({
            id,
            firstName,
            lastName,
            email,
            phone,
            status,
            createdAt,
          })),
      );
      this.isLoadingTenants.set(false);
    });

    this.loadPreviewOnChange();
  }

  private loadPreviewOnChange(): void {
    const scheduleChanges = merge(
      this.issueDateControl.valueChanges,
      this.dueDateControl.valueChanges,
      this.notesControl.valueChanges,
    ).pipe(
      filter(() => this.isReviewing() && !this.isSubmitting() && !this.createdInvoice()),
      map(() => 300),
    );

    merge(this.previewRefresh.pipe(map(() => 0)), scheduleChanges).pipe(
      switchMap((delay) => {
        this.previewError.set('');
        this.submitError.set('');
        this.isPreviewLoading.set(this.isReviewing());
        if (!this.isReviewing()) return of(null);

        return (delay ? timer(delay) : of(0)).pipe(
          switchMap(() => {
            const request = this.buildInvoiceRequest();
            return request ? this.invoiceService.previewInvoice(request) : of(null);
          }),
          catchError((error: unknown) => {
            this.previewError.set(this.errorMessage(error, 'Could not load the invoice preview. Please try again.'));
            return of(null);
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((preview) => {
      this.preview.set(preview);
      this.isPreviewLoading.set(false);
    });
  }

  close(): void {
    if (this.isSubmitting()) return;
    if (this.createdInvoice()) {
      this.invoiceCreated.emit();
    } else {
      this.closed.emit();
    }
  }

  tenantName(tenant: Tenant | TenantSearchResult): string {
    return `${tenant.firstName} ${tenant.lastName}`;
  }

  selectedTenantForDisplay(): Tenant | TenantSearchResult | null {
    return this.selectedTenant()
      ?? this.tenantOptions().find((tenant) => tenant.id === this.tenantIdControl.value)
      ?? null;
  }

  selectTenant(tenantId: string): void {
    const tenant = this.tenantOptions().find((option) => option.id === tenantId);
    if (!tenant) return;

    this.selectedTenant.set(null);
    this.selectedTenancy.set(null);
    this.tenantsError.set('');

    // Reset invoice fields when tenant changes
    this.issueDateControl.setValue(null);
    this.dueDateControl.setValue(null);
    this.notesControl.setValue('');

    // Fetch full tenant details with tenancies
    this.tenantsService.getTenantById(tenantId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (fullTenant) => {
        if (this.tenantIdControl.value === tenantId) this.selectedTenant.set(fullTenant);
      },
      error: (error) => {
        if (this.tenantIdControl.value !== tenantId) return;
        console.error('Failed to load tenant details:', error);
        this.snackbarService.error('Failed to load tenant details. Please try again.');
      },
    });
  }

  tenantSearchMessage(): string {
    return this.tenantSearchControl.value.trim().length < 2
      ? 'Type at least 2 characters to search.'
      : 'No matching tenants found.';
  }

  selectTenancy(tenancy: Tenancy): void {
    // Populate the controls before revealing the section that contains them.
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 14);

    this.issueDateControl.setValue(today);
    this.dueDateControl.setValue(dueDate);
    this.selectedTenancy.set(tenancy);
  }

  reviewInvoice(): void {
    const tenant = this.selectedTenant();
    if (!tenant || !this.buildInvoiceRequest() || this.isReviewing()) return;

    this.sendEmail.set(Boolean(tenant.email));
    this.sendSms.set(Boolean(tenant.phone));
    this.isReviewing.set(true);
    this.refreshPreview();
    this.focusDialogTitle();
  }

  refreshPreview(): void {
    this.previewRefresh.next();
  }

  backToLeaseSelection(): void {
    if (this.isSubmitting() || this.createdInvoice()) return;
    this.isReviewing.set(false);
    this.refreshPreview();
    this.focusDialogTitle();
  }

  private focusDialogTitle(): void {
    afterNextRender(() => this.dialogTitle()?.nativeElement.focus(), { injector: this.injector });
  }

  generateInvoice(): void {
    if (this.isSubmitting() || this.isPreviewLoading() || !this.preview()) return;
    const request = this.buildInvoiceRequest();
    const created = this.createdInvoice();
    if (!request) return;

    const channels: InvoiceDeliveryChannel[] = [];
    if (this.sendEmail()) channels.push('EMAIL');
    if (this.sendSms()) channels.push('SMS');
    if (created && !channels.length) return;

    this.submitError.set('');
    this.isSubmitting.set(true);
    const fields = [this.issueDateControl, this.dueDateControl, this.notesControl];
    fields.forEach((field) => field.disable({ emitEvent: false }));

    const create = created
      ? of({ invoice: created })
      : this.invoiceService.createInvoice(request);

    create.pipe(
      switchMap(({ invoice }) => {
        this.createdInvoice.set(invoice);
        return channels.length ? this.invoiceService.sendInvoice(invoice.id, channels) : of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isSubmitting.set(false)),
    ).subscribe({
      next: () => {
        this.snackbarService.success(channels.length ? 'Invoice created and queued for delivery.' : 'Invoice created.');
        this.invoiceCreated.emit();
      },
      error: (error: unknown) => {
        const invoice = this.createdInvoice();
        if (invoice) {
          const reason = this.errorMessage(error, 'Could not queue delivery. Please try again.');
          this.submitError.set(`Invoice #${invoice.invoiceNumber} was created. ${reason}`);
        } else {
          fields.forEach((field) => field.enable({ emitEvent: false }));
          this.submitError.set(this.errorMessage(error, 'Could not create the invoice. Please try again.'));
        }
      },
    });
  }

  private buildInvoiceRequest(): CreateInvoiceRequest | null {
    const tenancy = this.selectedTenancy();
    const issueDate = this.issueDateControl.value;
    const dueDate = this.dueDateControl.value;
    if (!tenancy || !issueDate || !dueDate || this.issueDateControl.invalid || this.dueDateControl.invalid) {
      return null;
    }

    return {
      tenancyId: tenancy.id,
      issueDate: formatDate(issueDate, 'yyyy-MM-dd', 'en-US'),
      dueDate: formatDate(dueDate, 'yyyy-MM-dd', 'en-US'),
      notes: this.notesControl.value,
    };
  }

  getTenantInitials(tenant: Tenant | TenantSearchResult): string {
    return `${tenant.firstName.charAt(0)}${tenant.lastName.charAt(0)}`.toUpperCase();
  }

  getActiveTenancies(tenant: Tenant): Tenancy[] {
    return tenant.tenancies?.filter(t => t.status === 'ACTIVE' || t.status === 'NOTICE') || [];
  }

  getTenancyLabel(tenancy: Tenancy): string {
    const propertyName = tenancy.property?.name || 'Unknown Property';
    const unitNumber = tenancy.unit?.unitNumber || 'Unknown Unit';
    return `${propertyName} - Unit ${unitNumber}`;
  }

  getTenancyDetails(tenancy: Tenancy): string {
    const unitType = tenancy.unit?.propertyUseType === 'RESIDENTIAL'
      ? `${tenancy.unit?.bedroomCount} Bedrooms`
      : `${tenancy.unit?.bedroomCount} Rooms`;
    return unitType;
  }

  getTenancyPeriod(tenancy: Tenancy): string {
    const start = this.formatDate(tenancy.startDate);
    const end = tenancy.endDate ? this.formatDate(tenancy.endDate) : 'Ongoing';
    return `${start} – ${end}`;
  }

  getRentAmount(tenancy: Tenancy): string {
    const currency = tenancy.property?.currency || 'KES';
    const rent = tenancy.unit?.marketRent || '0';
    return `${currency} ${new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(Number(rent))}`;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  private minDateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value as Date | null;
    if (!value) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate < today ? { pastDate: true } : null;
  }

  private minDueDateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value as Date | null;
    if (!value) return null;

    const issueDate = this.issueDateControl.value;
    if (!issueDate) return null;

    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);

    const issueDateOnly = new Date(issueDate);
    issueDateOnly.setHours(0, 0, 0, 0);

    return selectedDate < issueDateOnly ? { dueDateBeforeIssueDate: true } : null;
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      return error.error.message;
    }
    return fallback;
  }
}
