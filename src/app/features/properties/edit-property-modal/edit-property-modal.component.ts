import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input, signal, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { MatRadioModule } from '@angular/material/radio';
import { City, Country, PropertyItem } from '@app/features/properties/models/properties.models';
import { PropertyService } from '@app/features/properties/services/properties.service';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';

@Component({
  selector: 'app-edit-property-modal',
  standalone: true,
  imports: [ReactiveFormsModule, MatRadioModule, ...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-property-modal.component.html',
  styleUrl: './edit-property-modal.component.scss',
})
export class EditPropertyModalComponent {
  private readonly propertyService = inject(PropertyService);
  private readonly snackbarService = inject(SnackbarService);

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly updated = new EventEmitter<void>();

  readonly isUpdatingProperty = signal(false);
  readonly isLoadingCities = signal(false);
  readonly propertyUpdateError = signal('');
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
  readonly countries = input<Country[]>([]);
  readonly property = input<PropertyItem | null>(null);
  readonly cities = signal<City[]>([]);
  readonly currencies = [
    { code: 'KES', label: 'KES (Kenyan Shilling)' },
    { code: 'USD', label: 'USD (US Dollar)' },
    { code: 'EUR', label: 'EUR (Euro)' },
  ];
  readonly propertyStatuses = ['ACTIVE', 'MAINTENANCE', 'INACTIVE'];

  constructor() {
    effect(() => {
      const prop = this.property();
      if (prop) {
        this.propertyForm.patchValue({
          name: prop.name,
          addressLine1: prop.addressLine1,
          addressLine2: prop.addressLine2 || null,
          city: prop.city,
          state: prop.state,
          postalCode: prop.postalCode,
          countryId: prop.country,
          description: prop.description || null,
          currency: prop.currency,
          monthlyRent: Number(prop.monthlyRent),
          unitCount: prop.unitCount,
          status: prop.status,
        });
        // Load cities for the property's country
        if (prop.country) {
          this.loadCities(prop.country);
        }
      }
    });
  }

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
    if (this.isUpdatingProperty()) return;
    this.closed.emit();
  }

  updateProperty(): void {
    if (this.propertyForm.invalid || this.propertyForm.controls.city.disabled || this.isUpdatingProperty()) return;

    const prop = this.property();
    if (!prop?.id) return;

    this.isUpdatingProperty.set(true);
    this.propertyUpdateError.set('');
    const formValue = this.propertyForm.getRawValue();
    this.propertyService.updateProperty(prop.id, {
      ...formValue,
      addressLine2: formValue.addressLine2 || null,
      description: formValue.description || null,
    }).subscribe({
      next: () => {
        this.isUpdatingProperty.set(false);
        this.snackbarService.success('Property updated successfully');
        this.updated.emit();
      },
      error: (error) => {
        console.error('Failed to update property:', error);
        this.propertyUpdateError.set('Could not update property. Please check the details and try again.');
        this.snackbarService.error('Could not update property. Please check the details and try again.');
        this.isUpdatingProperty.set(false);
      },
    });
  }
}
