import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, debounceTime, switchMap } from 'rxjs';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { PropertyItem, PropertyUnit, propertyUseType } from '@app/features/properties/models/properties.models';
import { PropertyService } from '@app/features/properties/services/properties.service';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';

interface UnitRequest {
  page: number;
  limit: number;
  filters: { propertyUseType?: propertyUseType; status?: string; unitNumber?: string };
}

@Component({
  selector: 'app-property-units-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-units-modal.component.html',
  styleUrl: './property-units-modal.component.scss',
})
export class PropertyUnitsModalComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly unitRequests = new Subject<UnitRequest>();
  private readonly unitNumberSearchChanges = new Subject<void>();

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
  readonly selectedStatus = signal('');
  readonly selectedPropertyUseType = signal<propertyUseType | ''>('');
  readonly unitNumberQuery = signal('');
  readonly statusOptions = [
    { value: '', label: 'All Units' },
    { value: 'OCCUPIED', label: 'Occupied' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
  ];
  readonly propertyUseTypeOptions: { value: propertyUseType | ''; label: string }[] = [
    { value: '', label: 'All Unit Types' },
    { value: 'RESIDENTIAL', label: 'Residential' },
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'MIXED', label: 'Mixed' },
  ];
  readonly hasActiveFilters = computed(() =>
    Boolean(this.selectedStatus() || this.selectedPropertyUseType() || this.unitNumberQuery().trim())
  );
  readonly displayedColumns = [
    'unitNumber',
    'bedrooms',
    'unitType',
    'marketRent',
    'billingFrequency',
    'status',
    'tenantLease',
    'actions',
  ];
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
    this.unitRequests.pipe(
      switchMap(({ page, limit, filters }) => this.propertyService.getPropertyUnits(
        this.property().id,
        page,
        limit,
        'DESC',
        filters
      ).pipe(
        catchError((error: unknown) => {
          console.error('Failed to load property units:', error);
          this.error.set('Could not load units for this property. Please try again.');
          this.snackbarService.error('Could not load property units.');
          this.isLoading.set(false);
          return EMPTY;
        })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((response) => {
      this.units.set(response.data);
      this.pagination.set(response.pagination);
      this.isLoading.set(false);
    });

    this.unitNumberSearchChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.applyFilters());

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

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.applyFilters();
  }

  onPropertyUseTypeChange(propertyUseType: propertyUseType | ''): void {
    this.selectedPropertyUseType.set(propertyUseType);
    this.applyFilters();
  }

  onUnitNumberChange(unitNumber: string): void {
    this.unitNumberQuery.set(unitNumber);
    this.unitNumberSearchChanges.next();
  }

  statusLabel(): string {
    return this.statusOptions.find((option) => option.value === this.selectedStatus())?.label ?? 'All Units';
  }

  propertyUseTypeLabel(): string {
    return this.propertyUseTypeOptions.find((option) => option.value === this.selectedPropertyUseType())?.label ?? 'All Unit Types';
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

  getInitials(name: string): string {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
  }

  getAvatarColor(index: number): string {
    return ['blue', 'green', 'purple', 'gold'][index % 4];
  }

  exportUnits(): void {
    const columns = [
      'Unit Number',
      'Bedrooms',
      'Unit Type',
      'Market Rent',
      'Billing Frequency',
      'Status',
      'Active Tenant / Lease',
      'Charges',
    ];
    const rows = this.units().map((unit) => [
      unit.unitNumber,
      String(unit.bedroomCount),
      unit.propertyUseType,
      unit.marketRent,
      unit.billingFrequency,
      unit.status,
      unit.tenantName || (unit.status === 'AVAILABLE' ? 'Vacant - Ready to Lease' : 'No tenant information'),
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
    const selectedPropertyUseType = this.selectedPropertyUseType();
    this.unitRequests.next({
      page,
      limit,
      filters: {
        ...(this.selectedStatus() ? { status: this.selectedStatus() } : {}),
        ...(selectedPropertyUseType ? { propertyUseType: selectedPropertyUseType } : {}),
        ...(this.unitNumberQuery().trim() ? { unitNumber: this.unitNumberQuery().trim() } : {}),
      },
    });
  }

  private applyFilters(): void {
    this.pagination.update((current) => ({ ...current, page: 1 }));
    this.loadUnits(1, this.pagination().limit);
  }
}
