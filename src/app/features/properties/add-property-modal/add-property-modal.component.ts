import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { MatRadioModule } from '@angular/material/radio';
import { City, CreatePropertyRequest, Country } from '@app/features/properties/models/properties.models';
import { PropertyService } from '@app/features/properties/services/properties.service';

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

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly created = new EventEmitter<void>();

  readonly isCreatingProperty = signal(false);
  readonly isLoadingCities = signal(false);
  readonly propertyCreationError = signal('');
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
        if (this.propertyForm.controls.countryId.value === countryId) {
          this.isLoadingCities.set(false);
        }
      },
    });
  }

  close(): void {
    if (!this.isCreatingProperty()) this.closed.emit();
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
      next: () => {
        this.isCreatingProperty.set(false);
        this.created.emit();
      },
      error: (error) => {
        console.error('Failed to create property:', error);
        this.propertyCreationError.set('Could not create property. Please check the details and try again.');
        this.isCreatingProperty.set(false);
      },
    });
  }
}
