import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { MatRadioModule } from '@angular/material/radio';
import { CreatePropertyRequest } from '@app/features/properties/models/properties.models';
import { PropertyService } from '@app/features/properties/services/properties.service';

@Component({
  selector: 'app-add-property-modal',
  standalone: true,
  imports: [FormsModule, MatRadioModule, ...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-property-modal.component.html',
  styleUrl: './add-property-modal.component.scss',
})
export class AddPropertyModalComponent {
  private readonly propertyService = inject(PropertyService);

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly created = new EventEmitter<void>();

  readonly isCreatingProperty = signal(false);
  readonly propertyCreationError = signal('');
  readonly newProperty: CreatePropertyRequest = {
    name: '',
    addressLine1: '',
    addressLine2: null,
    city: '',
    state: '',
    postalCode: '',
    country: 'Kenya',
    description: null,
    currency: 'KES',
    monthlyRent: 0,
    unitCount: 0,
    status: 'Active',
  };

  readonly countries = [
    { name: 'Kenya', code: 'KE' },
    { name: 'Uganda', code: 'UG' },
    { name: 'Tanzania', code: 'TZ' },
  ];
  readonly states = ['Nairobi County', 'Kiambu County', 'Mombasa County'];
  readonly cities = ['Nairobi', 'Kiambu', 'Mombasa'];
  readonly currencies = [
    { code: 'KES', label: 'KES (Kenyan Shilling)' },
    { code: 'USD', label: 'USD (US Dollar)' },
    { code: 'EUR', label: 'EUR (Euro)' },
  ];
  readonly propertyStatuses = ['Active', 'Maintenance', 'Inactive'];

  close(): void {
    if (!this.isCreatingProperty()) this.closed.emit();
  }

  createProperty(form: NgForm): void {
    if (form.invalid || this.isCreatingProperty()) return;

    this.isCreatingProperty.set(true);
    this.propertyCreationError.set('');
    this.propertyService.createProperty({
      ...this.newProperty,
      addressLine2: this.newProperty.addressLine2 || null,
      description: this.newProperty.description || null,
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
