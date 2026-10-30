import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { PropertyService } from '@app/features/properties/services/properties.service';
import { DashboardService } from '@app/features/dashboard/services/dashboard.service';
import { Country, PropertyItem } from '@app/features/properties/models/properties.models';
import { EMPTY, Subject, catchError, debounceTime, distinctUntilChanged, map, switchMap, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AddPropertyModalComponent } from '@app/features/properties/add-property-modal/add-property-modal.component';
import { SnackbarService } from '@app/shared/components/snackbar/snackbar.service';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...MATERIAL_MODULES,
    AddPropertyModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.scss',
})
export class PropertiesComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly dashboardService = inject(DashboardService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly propertyFiltersChanged = new Subject<void>();

  readonly projectedRent = signal({
    title: 'Projected Monthly Rent',
    currency: 'KES',
    amount: '18,500,000',
    subtitleLabel: 'Gross portfolio valuation:',
    valuation: 'KES 1.42B',
  });

  readonly occupancyKpi = signal({
    title: 'Portfolio Occupancy',
    percentage: '91.4%',
    unitRatio: '142 / 155 Units',
    progress: 91.4,
    vacantText: '13 Vacant Units',
  });

  readonly collectedVsOwed = signal({
    title: 'Total Collected vs. Owed',
    collectedLabel: 'Collected (91.2%)',
    collectedCurrency: 'KES',
    collectedAmount: '14,820,000',
    owedLabel: 'Owed (8.8%)',
    owedCurrency: 'KES',
    owedAmount: '1,420,000',
    collectedPercent: 91.2,
    owedPercent: 8.8,
    periodNote: 'Based on the last 30 days',
  });

  readonly tenantAvatars = signal([
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  ]);

  readonly properties = signal<PropertyItem[]>([]);
  readonly isAddPropertyModalOpen = signal(false);
  readonly selectedCountry = signal('All Countries');
  readonly selectedStatus = signal('ALL');
  readonly searchQuery = signal('');
  readonly currentView = signal<'grid' | 'list'>('grid');
  readonly countries = signal<Country[]>([]);

  readonly statuses = [
    { code: 'ALL', label: 'All Statuses' },
    { code: 'ACTIVE', label: 'Active' },
    { code: 'MAINTENANCE', label: 'Under Maintenance' },
    { code: 'INACTIVE', label: 'Inactive' },
    { code: 'ARCHIVED', label: 'Deleted' },
  ];

  setView(view: 'grid' | 'list'): void {
    this.currentView.set(view);
  }

  onSearchQueryChange(query: string): void {
    this.searchQuery.set(query);
    this.propertyFiltersChanged.next();
  }

  onCountryChange(country: string): void {
    this.selectedCountry.set(country);
    this.propertyFiltersChanged.next();
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.propertyFiltersChanged.next();
  }

  openAddPropertyModal(): void {
    this.isAddPropertyModalOpen.set(true);
  }

  closeAddPropertyModal(): void {
    this.isAddPropertyModalOpen.set(false);
  }

  onPropertyCreated(): void {
    this.closeAddPropertyModal();
    this.loadProperties();
  }

  ngOnInit(): void {
    this.watchPropertyFilters();
    this.loadCountries();
    this.loadProjectedRent();
    this.loadOccupancyData();
    this.loadTotalRentOwed();
    this.loadProperties();
  }

  private watchPropertyFilters(): void {
    this.propertyFiltersChanged.pipe(
      debounceTime(300),
      map(() => this.getPropertyFilters()),
      distinctUntilChanged((previous, current) =>
        previous.country === current.country
        && previous.status === current.status
        && previous.name === current.name
      ),
      switchMap((filters) => this.propertyService.getProperties(1, 10, 'DESC', filters).pipe(
        catchError((error: unknown) => {
          console.error('Failed to load properties data:', error);
          this.snackbarService.error('Could not load properties. Please try again.');
          return EMPTY;
        })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((response) => {
      this.properties.set(response.data);
    });
  }

  private getPropertyFilters(): { country?: string; status?: string; name?: string } {
    const country = this.selectedCountry();
    const status = this.selectedStatus();
    const name = this.searchQuery().trim();

    return {
      ...(country !== 'All Countries' ? { country } : {}),
      ...(status !== 'ALL' ? { status } : {}),
      ...(name ? { name } : {}),
    };
  }

  private loadCountries(): void {
    this.propertyService.getCountries().subscribe({
      next: (countries) => {
        this.countries.set(countries);
      },
      error: (error) => {
        console.error('Failed to load countries:', error);
        this.snackbarService.error('Could not load countries. Please try again.');
      },
    });
  }

  private loadProjectedRent(): void {
    this.propertyService.getProjectedRent(1, 10, 'DESC').subscribe({
      next: (response) => {
        const summary = response.summary;
        if (summary) {
          this.projectedRent.update((current) => ({
            ...current,
            amount: summary.totalProjectedRent.toLocaleString(),
            valuation: `KES ${summary.totalPotentialRent}`,
          }));
        }
      },
      error: (error) => {
        console.error('Failed to load projected rent data:', error);
        this.snackbarService.error('Could not load projected rent data.');
      },
    });
  }

  private loadOccupancyData(): void {
    this.dashboardService.getPortfolioOccupancy().subscribe({
      next: (response) => {
        const { occupancyPercentage, totalUnits, vacantUnits, occupiedUnits} = response;
        this.occupancyKpi.update((current) => ({
          ...current,
          percentage: `${occupancyPercentage}%`,
          unitRatio: `${occupiedUnits} / ${totalUnits} Units`,
          progress: occupancyPercentage,
          vacantText: `${vacantUnits} Vacant Units`,
        }));
      },
      error: (error) => {
        console.error('Failed to load projected rent data:', error);
        this.snackbarService.error('Could not load portfolio occupancy data.');
      },
    });
  }

  private loadTotalRentOwed(): void {
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 1);
    const toDate = new Date();

    forkJoin({
      owed: this.dashboardService.getTotalRentOwed(fromDate, toDate),
      collected: this.dashboardService.getAllPropertiesIncome(fromDate, toDate),
    }).subscribe({
      next: ({ owed, collected }) => {
        const totalOwed = Number(owed.summary.totalOwed);
        const totalCollected = Number(collected.summary.totalIncome);
        const totalAmount = totalOwed + totalCollected;

        const owedPercent = totalAmount > 0 ? (totalOwed / totalAmount) * 100 : 0;
        const collectedPercent = totalAmount > 0 ? (totalCollected / totalAmount) * 100 : 0;

        this.collectedVsOwed.update((current) => ({
          ...current,
          collectedLabel: `Collected (${collectedPercent.toFixed(1)}%)`,
          collectedAmount: totalCollected.toLocaleString(),
          owedAmount: totalOwed.toLocaleString(),
          collectedPercent,
          owedPercent,
          owedLabel: `Owed (${owedPercent.toFixed(1)}%)`,
        }));
      },
      error: (error) => {
        console.error('Failed to load total rent owed data:', error);
        this.snackbarService.error('Could not load rent collection data.');
      },
    });
  }

  private loadProperties(): void {
    this.propertyService.getProperties(1, 10, 'DESC', this.getPropertyFilters()).subscribe({
      next: (response) => {
        const propertiesData = response.data;
        this.properties.set(propertiesData);
      },
      error: (error) => {
        console.error('Failed to load properties data:', error);
        this.snackbarService.error('Could not load properties. Please try again.');
      },
    });
  }
}
