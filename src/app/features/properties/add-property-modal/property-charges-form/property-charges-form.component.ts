import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, input, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { PropertyService } from '@app/features/properties/services/properties.service';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';

type PropertyChargeForm = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
  amount: FormControl<number | null>;
  isActive: FormControl<boolean>;
}>;

@Component({
  selector: 'app-property-charges-form',
  standalone: true,
  imports: [ReactiveFormsModule, ...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-charges-form.component.html',
  styleUrl: './property-charges-form.component.scss',
})
export class PropertyChargesFormComponent {
  private readonly propertyService = inject(PropertyService);
  private readonly snackbarService = inject(SnackbarService);

  @Output() readonly finished = new EventEmitter<void>();
  @Output() readonly submittingChange = new EventEmitter<boolean>();

  readonly propertyId = input.required<string>();
  readonly isSubmitting = signal(false);
  readonly submissionError = signal('');
  readonly chargesForm = new FormGroup({
    charges: new FormArray<PropertyChargeForm>([this.createChargeForm()]),
  });

  get charges(): FormArray<PropertyChargeForm> {
    return this.chargesForm.controls.charges;
  }

  addCharge(): void {
    this.charges.push(this.createChargeForm());
  }

  removeCharge(index: number): void {
    if (this.charges.length > 1) this.charges.removeAt(index);
  }

  submit(): void {
    if (this.chargesForm.invalid || this.isSubmitting()) {
      this.chargesForm.markAllAsTouched();
      return;
    }

    const formValues = this.charges.getRawValue();
    const charges = formValues.flatMap((charge) => {
      if (charge.amount === null) return [];
      return [{
        propertyId: this.propertyId(),
        name: charge.name.trim(),
        ...(charge.description.trim() ? { description: charge.description.trim() } : {}),
        amount: charge.amount,
        isActive: charge.isActive,
      }];
    });
    if (charges.length !== formValues.length) return;

    this.setSubmitting(true);
    this.submissionError.set('');
    this.propertyService.createPropertyCharges({ charges }).subscribe({
      next: () => {
        this.setSubmitting(false);
        this.finished.emit();
      },
      error: (error) => {
        console.error('Failed to create property charges:', error);
        this.submissionError.set('Could not create property charges. Please check the details and try again.');
        this.snackbarService.error('Could not create property charges. Please check the details and try again.');
        this.setSubmitting(false);
      },
    });
  }

  private setSubmitting(isSubmitting: boolean): void {
    this.isSubmitting.set(isSubmitting);
    this.submittingChange.emit(isSubmitting);
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
