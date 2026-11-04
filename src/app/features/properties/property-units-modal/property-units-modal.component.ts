import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { PropertyItem, PropertyUnit } from '@app/features/properties/models/properties.models';
import { PropertyService } from '@app/features/properties/services/properties.service';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';

@Component({
  selector: 'app-property-units-modal',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-units-modal.component.html',
  styleUrl: './property-units-modal.component.scss',
})
export class PropertyUnitsModalComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly snackbarService = inject(SnackbarService);

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly addUnitRequested = new EventEmitter<void>();

  readonly property = input.required<PropertyItem>();
  readonly units = signal<PropertyUnit[]>([]);
  readonly pagination = signal({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  readonly isLoading = signal(true);
  readonly error = signal('');
  readonly displayedColumns = ['unitNumber', 'bedrooms', 'unitType', 'marketRent', 'billingFrequency', 'status', 'charges'];
  readonly occupiedCount = computed(() => this.units().filter((unit) => unit.status === 'OCCUPIED').length);
  readonly availableCount = computed(() => this.units().filter((unit) => unit.status === 'AVAILABLE').length);
  readonly occupiedRate = computed(() => {
    const count = this.units().length;
    return count ? Math.round((this.occupiedCount() / count) * 100) : 0;
  });
  readonly pageRentTotal = computed(() =>
    this.units().reduce((total, unit) => total + Number(unit.marketRent), 0)
  );

  ngOnInit(): void {
    this.loadUnits(1);
  }

  close(): void {
    this.closed.emit();
  }

  onPageChange(event: PageEvent): void {
    if (this.isLoading()) return;

    const page = event.pageSize === this.pagination().limit
      ? event.pageIndex + 1
      : 1;
    this.pagination.update((current) => ({ ...current, page, limit: event.pageSize }));
    this.loadUnits(page, event.pageSize);
  }

  retry(): void {
    this.loadUnits(this.pagination().page, this.pagination().limit);
  }

  formatRent(amount: number | string): string {
    const value = Number(amount);
    return Number.isFinite(value) ? value.toLocaleString('en-KE') : String(amount);
  }

  formatFrequency(frequency: string): string {
    return frequency.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  exportUnits(): void {
    const columns = ['Unit Number', 'Bedrooms', 'Unit Type', 'Market Rent', 'Billing Frequency', 'Status', 'Charges'];
    const rows = this.units().map((unit) => [
      unit.unitNumber,
      String(unit.bedroomCount),
      unit.propertyUseType,
      unit.marketRent,
      unit.billingFrequency,
      unit.status,
      unit.charges.map((charge) => `${charge.name}: ${charge.effectiveAmount}`).join('; '),
    ]);
    const csv = [columns, ...rows]
      .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','))
      .join('\r\n');
    const blobUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${this.property().name.replace(/[^a-z0-9-_]+/gi, '-')}-units-page-${this.pagination().page}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
  }

  private loadUnits(page: number, limit = this.pagination().limit): void {
    this.isLoading.set(true);
    this.error.set('');
    this.propertyService.getPropertyUnits(this.property().id, page, limit, 'DESC').subscribe({
      next: (response) => {
        this.units.set(response.data);
        this.pagination.set(response.pagination);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load property units:', error);
        this.error.set('Could not load units for this property. Please try again.');
        this.snackbarService.error('Could not load property units.');
        this.isLoading.set(false);
      },
    });
  }
}
