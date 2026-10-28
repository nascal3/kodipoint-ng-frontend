import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { ReportsService } from '@app/features/properties/services/properties.service';
import { DashboardService } from '@app/features/dashboard/services/dashboard.service';
import { forkJoin } from 'rxjs';

export interface PropertyItem {
  id: number;
  name: string;
  subtitle: string;
  location: string;
  image: string;
  occupancy: string;
  occupancyStatus: 'success' | 'warning' | 'danger';
  rentRange: string;
  rentPeriod: string;
  allocationLabel: string;
  allocatedUnits: number;
  totalUnits: number;
  allocationDisplay: string;
  vacantDisplay: string;
  vacantType: 'teal' | 'warning' | 'danger';
  yield: string;
  tenantAvatars: string[];
  additionalTenants: string;
}

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
  private readonly reportsService = inject(ReportsService);
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

  readonly properties = signal<PropertyItem[]>([
    {
      id: 1,
      name: 'Highland Residency',
      subtitle: 'Multi-Family Residential Estate',
      location: 'South B • Plainsview Road, Nairobi',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80',
      occupancy: '94% Occupied',
      occupancyStatus: 'success',
      rentRange: 'KES 65K – 85K',
      rentPeriod: '/mo',
      allocationLabel: 'Unit Allocation',
      allocatedUnits: 32,
      totalUnits: 34,
      allocationDisplay: '32 / 34 Units',
      vacantDisplay: '2 Units Vacant',
      vacantType: 'teal',
      yield: '11.2% p.a.',
      tenantAvatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      ],
      additionalTenants: '+29',
    },
    {
      id: 2,
      name: 'Apex Commercial Plaza',
      subtitle: 'Grade-A Commercial Complex',
      location: 'Upper Hill • 3rd Ngong Avenue, Nairobi',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
      occupancy: '89.5% Occupied',
      occupancyStatus: 'success',
      rentRange: 'KES 120K – 240K',
      rentPeriod: '/mo',
      allocationLabel: 'Suite Allocation',
      allocatedUnits: 25,
      totalUnits: 28,
      allocationDisplay: '25 / 28 Units',
      vacantDisplay: '3 Suites Vacant',
      vacantType: 'teal',
      yield: '10.8% p.a.',
      tenantAvatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      ],
      additionalTenants: '+22',
    },
    {
      id: 3,
      name: 'Riverside Garden',
      subtitle: 'Premium 2 & 3 Bed Apartments',
      location: 'Ruaka Bypass • Kiambu County',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80',
      occupancy: '84.4% Occupied',
      occupancyStatus: 'warning',
      rentRange: 'KES 70K – 95K',
      rentPeriod: '/mo',
      allocationLabel: 'Unit Allocation',
      allocatedUnits: 38,
      totalUnits: 45,
      allocationDisplay: '38 / 45 Units',
      vacantDisplay: '7 units Vacant',
      vacantType: 'warning',
      yield: '9.8% p.a.',
      tenantAvatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      ],
      additionalTenants: '+36',
    },
    {
      id: 4,
      name: 'Kilimani Heights',
      subtitle: 'Executive Serviced Residences',
      location: 'Argwings Kodhek • Kilimani, Nairobi',
      image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
      occupancy: '94.4% Occupied',
      occupancyStatus: 'success',
      rentRange: 'KES 90K – 135K',
      rentPeriod: '/mo',
      allocationLabel: 'Unit Allocation',
      allocatedUnits: 34,
      totalUnits: 36,
      allocationDisplay: '34 / 36 Units',
      vacantDisplay: '1 Unit vacant',
      vacantType: 'danger',
      yield: '12.4% p.a.',
      tenantAvatars: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      ],
      additionalTenants: '+32',
    },
    {
      id: 5,
      name: 'Karen Executive Villas',
      subtitle: 'Gated Residential Luxury Villas',
      location: 'Miotoni Road • Karen, Nairobi',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80',
      occupancy: '83.3% Occupied',
      occupancyStatus: 'success',
      rentRange: 'KES 160K – 180K',
      rentPeriod: '/mo',
      allocationLabel: 'Villa Allocation',
      allocatedUnits: 10,
      totalUnits: 12,
      allocationDisplay: '10 / 12 Villas Full',
      vacantDisplay: '2 Units Vacant',
      vacantType: 'teal',
      yield: '8.5% p.a.',
      tenantAvatars: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      ],
      additionalTenants: '+8',
    },
  ]);

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
  }

  private loadProjectedRent(): void {
    this.reportsService.getProjectedRent(1, 10, 'DESC').subscribe({
      next: (response) => {
        const summary = response.summary;
        if (summary) {
          this.projectedRent.update((current) => ({
            ...current,
            amount: summary.totalProjectedRent.toLocaleString(),
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
}
