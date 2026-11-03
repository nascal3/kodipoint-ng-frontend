import { ChangeDetectionStrategy, Component, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { PropertyService } from '@app/features/properties/services/properties.service';
import { PropertyCharge } from '@app/features/properties/models/properties.models';
import { EMPTY, catchError } from 'rxjs';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';

@Component({
  selector: 'app-property-charges-modal',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_MODULES],
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
  readonly charges = signal<PropertyCharge[]>([]);
  readonly error = signal('');

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

  private loadCharges(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.propertyService.getPropertyCharges(this.propertyId(), 1, 10, 'DESC').subscribe({
      next: (response) => {
        this.charges.set(response.data);
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
