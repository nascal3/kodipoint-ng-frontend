import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

export interface TenantItem {
  id: number;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  premises: string;
  unit: string;
  unitType: string;
  startDate: string;
  tenure: string;
  contractRent: string;
  rentPeriod: string;
  ledgerBalance: string;
  balanceStatus: 'overdue' | 'settled' | 'credit';
  emergencyContact: string;
  emergencyPhone: string;
  tenancyStatus: 'active' | 'notice' | 'pending';
}

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.scss',
})
export class TenantsComponent {
  readonly activeLeaseholdRate = signal({
    title: 'Active Leasehold Rate',
    percentage: '97.8%',
    unitLabel: 'Occupied Capacity',
    unitRatio: '139 / 142 Units',
  });

  readonly contractedRent = signal({
    title: 'Contracted Rent / Mo',
    currency: 'KES',
    amount: '11.84M',
    collectionLabel: 'Collection Rate',
    collectedLabel: '91.4% Collected',
  });

  readonly expiringLeases = signal({
    title: 'Expiring in 30 Days',
    leasesCount: '8 Leases',
    dispatchLabel: 'Notice Dispatches',
    pendingReview: '8 Pending Review',
  });

  readonly tenants = signal<TenantItem[]>([
    {
      id: 1,
      name: 'John Kamau',
      phone: '+254722 411980',
      email: 'john.kamau@email.com',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      premises: 'Highland Courts',
      unit: 'Apt 4B',
      unitType: '3 Bed',
      startDate: '15 Jan 2023',
      tenure: '24 Mo Fixed',
      contractRent: '145,000',
      rentPeriod: 'Monthly',
      ledgerBalance: '-85,000',
      balanceStatus: 'overdue',
      emergencyContact: 'David W.',
      emergencyPhone: '+254722 411980',
      tenancyStatus: 'notice',
    },
    {
      id: 2,
      name: 'Peter Kimani',
      phone: '+254733 908122',
      email: 'peter.kimani@email.com',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      premises: 'Kilimani Nexus',
      unit: 'Suite 601',
      unitType: 'Comm.',
      startDate: '01 Mar 2022',
      tenure: '36 Mo Fixed',
      contractRent: '320,000',
      rentPeriod: 'Quarterly',
      ledgerBalance: '0',
      balanceStatus: 'settled',
      emergencyContact: 'Peter K.',
      emergencyPhone: '+254733 908122',
      tenancyStatus: 'active',
    },
    {
      id: 3,
      name: 'Linet Kipkemboi',
      phone: '+254728 991433',
      email: 'linet.kipkemboi@email.com',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      premises: 'Westlands Hts',
      unit: 'Penthouse 12A',
      unitType: '',
      startDate: '10 Oct 2021',
      tenure: '20 Days Left',
      contractRent: '210,000',
      rentPeriod: 'Quarterly',
      ledgerBalance: '+310,000',
      balanceStatus: 'credit',
      emergencyContact: 'Linet K.',
      emergencyPhone: '+254728 991433',
      tenancyStatus: 'notice',
    },
    {
      id: 4,
      name: 'Collins Ochieng',
      phone: '+254711 884100',
      email: 'collins.ochieng@email.com',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      premises: 'Riverside Green',
      unit: 'Townhouse 08',
      unitType: '',
      startDate: '01 Dec 2023',
      tenure: '12 Mo Lease',
      contractRent: '180,000',
      rentPeriod: 'Monthly',
      ledgerBalance: '0',
      balanceStatus: 'settled',
      emergencyContact: 'Collins O.',
      emergencyPhone: '+254711 884100',
      tenancyStatus: 'active',
    },
    {
      id: 5,
      name: 'Christine Omondi',
      phone: '+254722 882119',
      email: 'christine.omondi@email.com',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      premises: 'Parklands Plaza',
      unit: 'Comm. Suite 2B',
      unitType: '',
      startDate: 'Pending Draft',
      tenure: '3 Yrs',
      contractRent: '175,000',
      rentPeriod: 'Annually',
      ledgerBalance: 'Escrow Deposit',
      balanceStatus: 'settled',
      emergencyContact: 'Christine O.',
      emergencyPhone: '+254722 882119',
      tenancyStatus: 'pending',
    },
  ]);

  readonly selectedLedger = signal('All Tenants');
  readonly searchQuery = signal('');

  readonly ledgerOptions = [
    'All Tenants',
    'Active Tenancies',
    'Notice Period',
    'Pending Lease',
    'Overdue Balance',
  ];

  displayedColumns: string[] = [
    'tenantProfile',
    'premisesUnit',
    'tenure',
    'contractRent',
    'ledgerBalance',
    'emergency',
    'tenancyStatus',
    'actions',
  ];

  getBalanceStatus(balance: string, status: 'overdue' | 'settled' | 'credit'): string {
    if (status === 'overdue') return `KES ${balance} Overdue`;
    if (status === 'credit') return `KES ${balance} Credit`;
    return `KES ${balance} Settled`;
  }

  getTenancyStatusClass(status: 'active' | 'notice' | 'pending'): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'notice':
        return 'status-notice';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }

  getTenancyStatusLabel(status: 'active' | 'notice' | 'pending'): string {
    switch (status) {
      case 'active':
        return 'Active Tenancy';
      case 'notice':
        return 'Notice Period';
      case 'pending':
        return 'Pending Lease';
      default:
        return '';
    }
  }

  getBalanceClass(status: 'overdue' | 'settled' | 'credit'): string {
    switch (status) {
      case 'overdue':
        return 'balance-overdue';
      case 'credit':
        return 'balance-credit';
      default:
        return 'balance-settled';
    }
  }
}
