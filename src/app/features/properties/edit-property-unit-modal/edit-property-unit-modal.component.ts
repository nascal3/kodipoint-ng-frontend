import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, FormRecord, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, expand, reduce } from 'rxjs';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { PropertyService } from '@app/features/properties/services/properties.service';
import { PropertyCharge, PropertyItem, PropertyUnit, UnitBillingFrequency, propertyUseType } from '@app/features/properties/models/properties.models';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';

@Component({
  selector: 'app-edit-property-unit-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-property-unit-modal.component.html',
  styleUrl: './edit-property-unit-modal.component.scss',
})
export class EditPropertyUnitModalComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly destroyRef = inject(DestroyRef);

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly updated = new EventEmitter<void>();

  readonly property = input.required<PropertyItem>();
  readonly unit = input.required<PropertyUnit>();
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
  readonly unitForm = new FormGroup({
    unitNumber: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    bedroomCount: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)] }),
    marketRent: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    billingFrequency: new FormControl<UnitBillingFrequency>('MONTHLY', { nonNullable: true, validators: Validators.required }),
    propertyUseType: new FormControl<propertyUseType>('RESIDENTIAL', { nonNullable: true, validators: Validators.required }),
  });

  ngOnInit(): void {
    const unit = this.unit();
    this.unitForm.patchValue({
      unitNumber: unit.unitNumber,
      bedroomCount: unit.bedroomCount,
      marketRent: Number(unit.marketRent),
      billingFrequency: unit.billingFrequency,
      propertyUseType: unit.propertyUseType,
    });
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

  updateUnit(): void {
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
    const selectedChargeIds = selectedCharges.map((charge) => charge.id);
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
    this.propertyService.updatePropertyUnit(this.unit().id, {
      propertyId: this.property().id,
      unitNumber: formValue.unitNumber.trim(),
      bedroomCount: formValue.bedroomCount,
      status: this.unit().status,
      propertyUseType: formValue.propertyUseType,
      marketRent: formValue.marketRent,
      billingFrequency: formValue.billingFrequency,
      propertyChargeIds: selectedChargeIds,
      propertyCharges,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.snackbarService.success('Unit updated successfully');
        this.isSaving.set(false);
        this.updated.emit();
      },
      error: (error: any) => {
        console.error('Failed to update property unit:', error);
        this.formError.set(error.error?.message || 'Could not update unit. Please check the details and try again.');
        this.snackbarService.error(error.error?.message || 'Could not update unit. Please try again.');
        this.isSaving.set(false);
      },
    });
  }

  loadCharges(): void {
    this.isLoadingCharges.set(true);
    this.chargesError.set('');
    this.propertyService.getPropertyCharges(this.property().id, 1, 100, 'ASC').pipe(
      expand((response) => response.pagination.hasNextPage
        ? this.propertyService.getPropertyCharges(this.property().id, response.pagination.page + 1, 100, 'ASC')
        : EMPTY),
      reduce((charges, response) => charges.concat(response.data), [] as PropertyCharge[]),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (charges) => {
        const unitChargeAmounts = new Map(
          this.unit().charges.map((charge) => [charge.id, Number(charge.customAmount ?? charge.effectiveAmount)])
        );
        const activeCharges = charges.filter((charge) => charge.isActive);
        this.charges.set(activeCharges);
        this.selectedChargeIds.set(new Set(unitChargeAmounts.keys()));
        for (const charge of activeCharges) {
          const unitAmount = unitChargeAmounts.get(charge.id);
          this.chargeAmounts.setControl(charge.id, new FormControl(unitAmount ?? Number(charge.amount), {
            nonNullable: true,
            validators: [Validators.required, Validators.min(0)],
          }));
        }
        this.isLoadingCharges.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load property charges for unit update:', error);
        this.chargesError.set('Could not load this property’s charges. Retry before updating the unit.');
        this.snackbarService.error('Could not load property charges. Please try again.');
        this.isLoadingCharges.set(false);
      },
    });
  }
}
