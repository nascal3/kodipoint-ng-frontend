import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { MatRadioModule } from '@angular/material/radio';
import { City, Country } from '@app/features/properties/models/properties.models';
import { PropertyService } from '@app/features/properties/services/properties.service';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';

type PropertyChargeForm = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
  amount: FormControl<number | null>;
  isActive: FormControl<boolean>;
}>;

@Component({
  selector: 'app-add-property-modal',
  standalone: true,
  imports: [ReactiveFormsModule, MatRadioModule, ...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-property-modal.component.html',
  styleUrl: './add-property-modal.component.scss',
})
export class AddPropertyModalComponent {
  private readonly propertyService = inject(PropertyService);
  private readonly snackbarService = inject(SnackbarService);

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly created = new EventEmitter<void>();

  readonly isCreatingProperty = signal(false);
  readonly isCreatingCharges = signal(false);
  readonly isLoadingCities = signal(false);
  readonly propertyCreationError = signal('');
  readonly chargesCreationError = signal('');
  readonly createdPropertyId = signal('');
  readonly propertyCreated = signal(false);
  readonly propertyForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    addressLine1: new FormControl('', { nonNullable: true, validators: Validators.required }),
    addressLine2: new FormControl<string | null>(null),
    city: new FormControl({ value: '', disabled: true }, { nonNullable: true, validators: Validators.required }),
    state: new FormControl('', { nonNullable: true }),
    postalCode: new FormControl('', { nonNullable: true, validators: Validators.required }),
    countryId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    description: new FormControl<string | null>(null),
    currency: new FormControl('KES', { nonNullable: true, validators: Validators.required }),
    monthlyRent: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    unitCount: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    status: new FormControl('ACTIVE', { nonNullable: true, validators: Validators.required }),
  });
  readonly chargesForm = new FormGroup({
    charges: new FormArray<PropertyChargeForm>([this.createChargeForm()]),
  });

  readonly countries = input<Country[]>([]);
  readonly states = [];
  readonly cities = signal<City[]>([]);
  readonly currencies = [
    { code: 'KES', label: 'KES (Kenyan Shilling)' },
    { code: 'USD', label: 'USD (US Dollar)' },
    { code: 'EUR', label: 'EUR (Euro)' },
  ];
  readonly propertyStatuses = ['ACTIVE', 'MAINTENANCE', 'INACTIVE'];

  onCountrySelected(countryId: string): void {
    this.propertyForm.controls.city.reset('');
    this.loadCities(countryId);
  }

  private loadCities(countryId: string): void {
    this.cities.set([]);
    this.propertyForm.controls.city.disable();
    this.isLoadingCities.set(!!countryId);
    if (!countryId) return;

    this.propertyService.getCities(countryId).subscribe({
      next: (cities) => {
        if (this.propertyForm.controls.countryId.value !== countryId) return;

        this.cities.set(cities);
        this.isLoadingCities.set(false);
        if (cities.length > 0) this.propertyForm.controls.city.enable();
      },
      error: (error) => {
        console.error('Failed to load cities:', error);
        this.snackbarService.error('Could not load cities for this country. Please try again.');
        if (this.propertyForm.controls.countryId.value === countryId) {
          this.isLoadingCities.set(false);
        }
      },
    });
  }

  close(): void {
    if (this.isCreatingProperty() || this.isCreatingCharges()) return;
    if (this.propertyCreated()) {
      this.created.emit();
    } else {
      this.closed.emit();
    }
  }

  createProperty(): void {
    if (this.propertyForm.invalid || this.propertyForm.controls.city.disabled || this.isCreatingProperty()) return;

    this.isCreatingProperty.set(true);
    this.propertyCreationError.set('');
    const formValue = this.propertyForm.getRawValue();
    this.propertyService.createProperty({
      ...formValue,
      addressLine2: formValue.addressLine2 || null,
      description: formValue.description || null,
    }).subscribe({
      next: (property) => {
        this.isCreatingProperty.set(false);
        this.propertyCreated.set(true);
        if (!property?.id) {
          this.propertyCreationError.set('The property was created, but its ID was not returned, so charges cannot be attached.');
          return;
        }
        this.createdPropertyId.set(property.id);
      },
      error: (error) => {
        console.error('Failed to create property:', error);
        this.propertyCreationError.set('Could not create property. Please check the details and try again.');
        this.snackbarService.error('Could not create property. Please check the details and try again.');
        this.isCreatingProperty.set(false);
      },
    });
  }

  get charges(): FormArray<PropertyChargeForm> {
    return this.chargesForm.controls.charges;
  }

  addCharge(): void {
    this.charges.push(this.createChargeForm());
  }

  removeCharge(index: number): void {
    if (this.charges.length > 1) this.charges.removeAt(index);
  }

  createCharges(): void {
    if (!this.createdPropertyId() || this.chargesForm.invalid || this.isCreatingCharges()) {
      this.chargesForm.markAllAsTouched();
      return;
    }

    const formValues = this.charges.getRawValue();
    const charges = formValues.flatMap((charge) => {
      if (charge.amount === null) return [];
      return [{
        propertyId: this.createdPropertyId(),
        name: charge.name.trim(),
        ...(charge.description.trim() ? { description: charge.description.trim() } : {}),
        amount: charge.amount,
        isActive: charge.isActive,
      }];
    });
    if (charges.length !== formValues.length) return;

    this.isCreatingCharges.set(true);
    this.chargesCreationError.set('');
    this.propertyService.createPropertyCharges({ charges }).subscribe({
      next: () => {
        this.isCreatingCharges.set(false);
        this.created.emit();
      },
      error: (error) => {
        console.error('Failed to create property charges:', error);
        this.chargesCreationError.set('Could not create property charges. Please check the details and try again.');
        this.snackbarService.error('Could not create property charges. Please check the details and try again.');
        this.isCreatingCharges.set(false);
      },
    });
  }

  private createChargeForm(): PropertyChargeForm {
    return new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
      description: new FormControl('', { nonNullable: true }),
      amount: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
      isActive: new FormControl(true, { nonNullable: true }),
    });
  }
}
