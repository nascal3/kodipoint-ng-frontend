import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { PropertyService } from '@app/features/properties/services/properties.service';
import { DashboardService } from '@app/features/dashboard/services/dashboard.service';
import { PropertyItem } from '@app/features/properties/models/properties.models';
import { forkJoin } from 'rxjs';

// export interface PropertyItem {
//   id: number;
//   name: string;
//   subtitle: string;
//   location: string;
//   image: string;
//   occupancy: string;
//   occupancyStatus: 'success' | 'warning' | 'danger';
//   rentRange: string;
//   rentPeriod: string;
//   allocationLabel: string;
//   allocatedUnits: number;
//   totalUnits: number;
//   allocationDisplay: string;
//   vacantDisplay: string;
//   vacantType: 'teal' | 'warning' | 'danger';
//   yield: string;
//   tenantAvatars: string[];
//   additionalTenants: string;
// }

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...MATERIAL_MODULES,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.scss',
})
export class PropertiesComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly dashboardService = inject(DashboardService);

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
  readonly selectedCounty = signal('All Counties');
  readonly selectedStatus = signal('Status: All Statuses');
  readonly searchQuery = signal('');
  readonly currentView = signal<'grid' | 'list'>('grid');

  readonly counties = [
    'All Counties',
    'Nairobi',
    'Kiambu',
    'Mombasa',
  ];

  readonly statuses = [
    'Status: All Statuses',
    'Status: Fully Occupied',
    'Status: Partially Occupied',
    'Status: Vacant',
  ];

  setView(view: 'grid' | 'list'): void {
    this.currentView.set(view);
  }

  ngOnInit(): void {
    this.loadProjectedRent();
    this.loadOccupancyData();
    this.loadTotalRentOwed();
    this.loadProperties();
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
      },
    });
  }

  private loadProperties(): void {
    this.propertyService.getProperties(1, 10, 'createdAt', 'DESC').subscribe({
      next: (response) => {
        const propertiesData = response.data;
        this.properties.update((current) => ({
          ...propertiesData
        }));
      },
      error: (error) => {
        console.error('Failed to load properties data:', error);
      },
    });
  }
}
