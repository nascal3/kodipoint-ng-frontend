import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { PropertyService } from '@app/features/properties/services/properties.service';
import { CreatePropertyCharge, PropertyCharge } from '@app/features/properties/models/properties.models';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';

@Component({
  selector: 'app-property-charges-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-charges-modal.component.html',
  styleUrl: './property-charges-modal.component.scss',
})
export class PropertyChargesModalComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly snackbarService = inject(SnackbarService);

  @Output() readonly closed = new EventEmitter<void>();

  readonly propertyId = input.required<string>();
  readonly isLoading = signal(true);
  readonly isLoadingMore = signal(false);
  readonly charges = signal<PropertyCharge[]>([]);
  readonly hasMoreCharges = signal(false);
  private readonly currentPage = signal(1);
  readonly error = signal('');
  readonly isEditing = signal(false);
  readonly isCreating = signal(false);
  readonly editingChargeId = signal('');
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);
  readonly deletingChargeId = signal('');
  readonly editForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    description: new FormControl<string | null>(null),
    amount: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    isActive: new FormControl(true, { nonNullable: true }),
  });

  ngOnInit(): void {
    this.loadCharges();
  }

  close(): void {
    this.closed.emit();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  startEdit(charge: PropertyCharge): void {
    this.isCreating.set(false);
    this.editingChargeId.set(charge.id);
    this.editForm.patchValue({
      name: charge.name,
      description: charge.description,
      amount: charge.amount,
      isActive: charge.isActive,
    });
    this.isEditing.set(true);
  }

  startCreate(): void {
    this.editingChargeId.set('');
    this.editForm.reset();
    this.isEditing.set(false);
    this.isCreating.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.isCreating.set(false);
    this.editingChargeId.set('');
    this.editForm.reset();
  }

  createCharge(): void {
    if (this.editForm.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    const formValue = this.editForm.getRawValue();
    const charge: CreatePropertyCharge = {
      propertyId: this.propertyId(),
      name: formValue.name.trim(),
      ...(formValue.description?.trim() ? { description: formValue.description.trim() } : {}),
      amount: Number(formValue.amount),
      isActive: formValue.isActive,
    };

    this.propertyService.createPropertyCharges({ charges: [charge] }).subscribe({
      next: () => {
        this.snackbarService.success('Charge created successfully');
        this.isSaving.set(false);
        this.cancelEdit();
        this.loadCharges();
      },
      error: (error) => {
        console.error('Failed to create property charge:', error);
        this.snackbarService.error('Could not create charge. Please try again.');
        this.isSaving.set(false);
      },
    });
  }

  saveEdit(): void {
    if (this.editForm.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    const chargeId = this.editingChargeId();
    const updates = this.editForm.getRawValue();

    this.propertyService.updatePropertyCharge(chargeId, updates).subscribe({
      next: () => {
        this.snackbarService.success('Charge updated successfully');
        this.isSaving.set(false);
        this.cancelEdit();
        this.loadCharges();
      },
      error: (error) => {
        console.error('Failed to update charge:', error);
        this.snackbarService.error('Could not update charge. Please try again.');
        this.isSaving.set(false);
      },
    });
  }

  deleteCharge(chargeId: string): void {
    if (this.isDeleting()) return;

    this.isDeleting.set(true);
    this.deletingChargeId.set(chargeId);
    this.propertyService.deletePropertyCharge(chargeId).subscribe({
      next: () => {
        this.snackbarService.success('Charge deactivated successfully');
        this.isDeleting.set(false);
        this.deletingChargeId.set('');
        this.loadCharges();
      },
      error: (error) => {
        console.error('Failed to delete charge:', error);
        this.snackbarService.error('Could not deactivate charge. Please try again.');
        this.isDeleting.set(false);
        this.deletingChargeId.set('');
      },
    });
  }

  loadMoreCharges(): void {
    if (this.isLoadingMore() || this.isLoading() || !this.hasMoreCharges()) return;

    const nextPage = this.currentPage() + 1;
    this.isLoadingMore.set(true);
    this.propertyService.getPropertyCharges(this.propertyId(), nextPage, 10, 'DESC').subscribe({
      next: (response) => {
        this.charges.update((charges) => [...charges, ...response.data]);
        this.currentPage.set(response.pagination.page);
        this.hasMoreCharges.set(response.pagination.hasNextPage);
        this.isLoadingMore.set(false);
      },
      error: (error) => {
        console.error('Failed to load more property charges:', error);
        this.snackbarService.error('Could not load more property charges. Please try again.');
        this.isLoadingMore.set(false);
      },
    });
  }

  private loadCharges(): void {
    this.currentPage.set(1);
    this.hasMoreCharges.set(false);
    this.isLoading.set(true);
    this.error.set('');
    this.propertyService.getPropertyCharges(this.propertyId(), 1, 10, 'DESC').subscribe({
      next: (response) => {
        this.charges.set(response.data);
        this.currentPage.set(response.pagination.page);
        this.hasMoreCharges.set(response.pagination.hasNextPage);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load property charges:', error);
        this.error.set('Could not load property charges. Please try again.');
        this.snackbarService.error('Could not load property charges.');
        this.isLoading.set(false);
      },
    });
  }
}
