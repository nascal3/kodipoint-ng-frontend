import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, FormRecord, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, expand, reduce } from 'rxjs';
import { MatRadioModule } from '@angular/material/radio';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { PropertyService } from '@app/features/properties/services/properties.service';
import { PropertyCharge, UnitBillingFrequency, UnitStatus, propertyUseType } from '@app/features/properties/models/properties.models';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';

@Component({
  selector: 'app-add-property-unit-modal',
  standalone: true,
  imports: [ReactiveFormsModule, MatRadioModule, ...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-property-unit-modal.component.html',
  styleUrl: './add-property-unit-modal.component.scss',
})
export class AddPropertyUnitModalComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly destroyRef = inject(DestroyRef);

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly created = new EventEmitter<void>();

  readonly propertyId = input.required<string>();
  readonly propertyName = input.required<string>();
  readonly propertyUseType = input.required<propertyUseType>();
  readonly charges = signal<PropertyCharge[]>([]);
  readonly chargeAmounts = new FormRecord<FormControl<number>>({});
  readonly selectedChargeIds = signal<Set<string>>(new Set());
  readonly isLoadingCharges = signal(true);
  readonly chargesError = signal('');
  readonly isSaving = signal(false);
  readonly formError = signal('');
  readonly billingFrequencies: { value: UnitBillingFrequency; label: string }[] = [
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'BI_ANNUALLY', label: 'Bi-annually' },
    { value: 'ANNUALLY', label: 'Annually' },
  ];
  readonly unitStatuses: { value: UnitStatus; label: string }[] = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
  ];
  readonly unitForm = new FormGroup({
    unitNumber: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    bedroomCount: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)] }),
    marketRent: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    billingFrequency: new FormControl<UnitBillingFrequency>('MONTHLY', { nonNullable: true, validators: Validators.required }),
    status: new FormControl<UnitStatus>('AVAILABLE', { nonNullable: true, validators: Validators.required }),
    propertyUseType: new FormControl<propertyUseType>('RESIDENTIAL', { nonNullable: true, validators: Validators.required }),
  });

  ngOnInit(): void {
    this.unitForm.patchValue({ propertyUseType: this.propertyUseType() });
    this.loadCharges();
  }

  close(): void {
    if (!this.isSaving()) this.closed.emit();
  }

  toggleCharge(chargeId: string, checked: boolean): void {
    this.selectedChargeIds.update((selected) => {
      const next = new Set(selected);
      if (checked) next.add(chargeId);
      else next.delete(chargeId);
      return next;
    });
  }

  hasInvalidSelectedCharge(): boolean {
    return this.charges().some((charge) =>
      this.selectedChargeIds().has(charge.id) && this.chargeAmounts.controls[charge.id]?.invalid
    );
  }

  createUnit(): void {
    if (this.unitForm.invalid || this.isLoadingCharges() || this.chargesError() || this.isSaving()) {
      this.unitForm.markAllAsTouched();
      return;
    }

    const selectedCharges = this.charges().filter((charge) => this.selectedChargeIds().has(charge.id));
    const selectedChargeControls = selectedCharges.map((charge) => this.chargeAmounts.controls[charge.id]);
    if (selectedChargeControls.some((control) => !control || control.invalid)) {
      selectedChargeControls.forEach((control) => control?.markAsTouched());
      return;
    }

    const formValue = this.unitForm.getRawValue();
    const propertyCharges = selectedCharges.map((charge) => ({
      propertyChargeId: charge.id,
      amount: this.chargeAmounts.controls[charge.id].value,
    }));
    if (propertyCharges.some((charge) => !Number.isFinite(charge.amount) || charge.amount < 0)) {
      this.formError.set('One or more selected property charges have an invalid amount. Update the property charges and try again.');
      return;
    }

    this.isSaving.set(true);
    this.formError.set('');
    this.propertyService.createPropertyUnit({
      propertyId: this.propertyId(),
      unitNumber: formValue.unitNumber.trim(),
      bedroomCount: formValue.bedroomCount,
      status: formValue.status,
      propertyUseType: formValue.propertyUseType,
      marketRent: formValue.marketRent,
      billingFrequency: formValue.billingFrequency,
      propertyCharges,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.snackbarService.success('Unit created successfully');
        this.isSaving.set(false);
        this.created.emit();
      },
      error: (error: unknown) => {
        console.error('Failed to create property unit:', error);
        this.formError.set('Could not create unit. Please check the details and try again.');
        this.snackbarService.error('Could not create unit. Please try again.');
        this.isSaving.set(false);
      },
    });
  }

  loadCharges(): void {
    this.isLoadingCharges.set(true);
    this.chargesError.set('');
    this.propertyService.getPropertyCharges(this.propertyId(), 1, 100, 'ASC').pipe(
      expand((response) => response.pagination.hasNextPage
        ? this.propertyService.getPropertyCharges(this.propertyId(), response.pagination.page + 1, 100, 'ASC')
        : EMPTY),
      reduce((charges, response) => charges.concat(response.data), [] as PropertyCharge[]),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (charges) => {
        const activeCharges = charges.filter((charge) => charge.isActive);
        this.charges.set(activeCharges);
        this.selectedChargeIds.set(new Set(activeCharges.map((charge) => charge.id)));
        for (const charge of activeCharges) {
          this.chargeAmounts.setControl(charge.id, new FormControl(Number(charge.amount), {
            nonNullable: true,
            validators: [Validators.required, Validators.min(0)],
          }));
        }
        this.isLoadingCharges.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load property charges for unit creation:', error);
        this.chargesError.set('Could not load this property’s charges. Retry before creating the unit.');
        this.snackbarService.error('Could not load property charges. Please try again.');
        this.isLoadingCharges.set(false);
      },
    });
  }
}
