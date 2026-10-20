import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { DATE_RANGE_DATE_PROVIDERS } from '../dashboard/components/date-range-date-adapter';

interface ReceiptAllocation {
  description: string;
  amount: number;
}

interface Receipt {
  id: string;
  receiptNumber: string;
  tenant: string;
  initials: string;
  unit: string;
  property: string;
  channel: string;
  transactionReference: string;
  timestamp: string;
  amount: number;
  allocationStatus: 'allocated' | 'partial';
  outstandingBalance: number;
  invoiceNumber: string;
  allocations: ReceiptAllocation[];
  unallocatedBalance: number;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-receipts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    RouterLink,
  ],
  providers: DATE_RANGE_DATE_PROVIDERS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './receipts.component.html',
  styleUrl: './receipts.component.scss',
})
export class ReceiptsComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly maxDate = new Date();
  readonly dateRangeStart = signal(new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1));
  readonly dateRangeEnd = signal(this.maxDate);
  readonly selectedFilter = signal('all');
  readonly searchQuery = signal('');
  readonly selectedReceipt = signal<Receipt | null>(null);
  readonly filterOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'allocated', label: 'Allocated' },
    { value: 'partial', label: 'Partial' },
  ];
  readonly displayedColumns = [
    'receipt',
    'tenant',
    'channel',
    'timestamp',
    'amount',
    'allocation',
  ];
  readonly receipts: Receipt[] = [
    {
      id: 'RCT-2026-0412',
      receiptNumber: '#RCT-2026-0412',
      tenant: 'John Doe',
      initials: 'JD',
      unit: 'Apt 4B',
      property: 'Sapphire Heights',
      channel: 'M-Pesa',
      transactionReference: 'QHX4910LK7',
      timestamp: '2026-10-05T11:42:00+03:00',
      amount: 78500,
      allocationStatus: 'allocated',
      outstandingBalance: 0,
      invoiceNumber: '#INV-2026-0891',
      allocations: [
        { description: 'October Rent', amount: 75000 },
        { description: 'Service & Amenities Charge', amount: 3500 },
      ],
      unallocatedBalance: 0,
      email: 'john.doe@enterprise.ke',
      phone: '+254 712 *** 890',
    },
    {
      id: 'RCT-2026-0411',
      receiptNumber: '#RCT-2026-0411',
      tenant: 'Sarah Wanjiku',
      initials: 'SW',
      unit: 'Suite 12A',
      property: 'Coral Executive',
      channel: 'Stanbic Wire',
      transactionReference: 'TX-902348',
      timestamp: '2026-10-05T10:15:00+03:00',
      amount: 120000,
      allocationStatus: 'allocated',
      outstandingBalance: 0,
      invoiceNumber: '#INV-2026-0887',
      allocations: [{ description: 'October Rent', amount: 120000 }],
      unallocatedBalance: 0,
      email: 'sarah.wanjiku@email.com',
      phone: '+254 733 *** 221',
    },
    {
      id: 'RCT-2026-0410',
      receiptNumber: '#RCT-2026-0410',
      tenant: 'Michael Otieno',
      initials: 'MO',
      unit: 'Villa 08',
      property: 'Acacia Greens',
      channel: 'M-Pesa',
      transactionReference: 'QKJ881920Z',
      timestamp: '2026-10-04T16:30:00+03:00',
      amount: 95000,
      allocationStatus: 'allocated',
      outstandingBalance: 0,
      invoiceNumber: '#INV-2026-0872',
      allocations: [{ description: 'October Rent', amount: 95000 }],
      unallocatedBalance: 0,
      email: 'michael.otieno@email.com',
      phone: '+254 722 *** 604',
    },
    {
      id: 'RCT-2026-0409',
      receiptNumber: '#RCT-2026-0409',
      tenant: 'Amina Hassan',
      initials: 'AH',
      unit: 'Studio 03',
      property: 'Kilimani Lofts',
      channel: 'M-Pesa',
      transactionReference: 'QM771239XA',
      timestamp: '2026-10-04T14:11:00+03:00',
      amount: 45000,
      allocationStatus: 'partial',
      outstandingBalance: 10000,
      invoiceNumber: '#INV-2026-0869',
      allocations: [{ description: 'October Rent (partial)', amount: 45000 }],
      unallocatedBalance: 0,
      email: 'amina.hassan@email.com',
      phone: '+254 701 *** 553',
    },
    {
      id: 'RCT-2026-0408',
      receiptNumber: '#RCT-2026-0408',
      tenant: 'David Njoroge',
      initials: 'DN',
      unit: 'Shop G4',
      property: 'Westlands Plaza',
      channel: 'Desk Cash',
      transactionReference: 'CSH-0092',
      timestamp: '2026-10-03T09:20:00+03:00',
      amount: 65000,
      allocationStatus: 'allocated',
      outstandingBalance: 0,
      invoiceNumber: '#INV-2026-0861',
      allocations: [{ description: 'October Rent', amount: 65000 }],
      unallocatedBalance: 0,
      email: 'david.njoroge@email.com',
      phone: '+254 710 *** 032',
    },
  ];
  readonly dataSource = new MatTableDataSource(this.receipts);

  constructor() {
    this.selectedReceipt.set(this.receipts[0]);
    this.dataSource.filterPredicate = (receipt, filter) => {
      const criteria = JSON.parse(filter) as {
        allocation: string;
        query: string;
        start: string;
        end: string;
      };
      const query = criteria.query.toLowerCase();
      const receiptDate = new Date(receipt.timestamp);
      const startDate = this.parseFilterDate(criteria.start);
      const endDate = this.endOfDate(this.parseFilterDate(criteria.end));
      return (
        (criteria.allocation === 'all' || receipt.allocationStatus === criteria.allocation) &&
        receiptDate >= startDate &&
        receiptDate <= endDate &&
        `${receipt.tenant} ${receipt.receiptNumber} ${receipt.transactionReference} ${receipt.unit} ${receipt.property}`
          .toLowerCase()
          .includes(query)
      );
    };
    this.applyFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  selectReceipt(receipt: Receipt): void {
    this.selectedReceipt.set(receipt);
  }

  updateDateRangeStart(date: Date | null): void {
    if (date) {
      this.dateRangeStart.set(date);
      this.applyFilters();
    }
  }

  updateDateRangeEnd(date: Date | null): void {
    if (date) {
      this.dateRangeEnd.set(date);
      this.applyFilters();
    }
  }

  applyFilters(): void {
    this.dataSource.filter = JSON.stringify({
      allocation: this.selectedFilter(),
      query: this.searchQuery().trim(),
      start: this.formatDateForFilter(this.dateRangeStart()),
      end: this.formatDateForFilter(this.dateRangeEnd()),
    });
    this.paginator?.firstPage();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  printReceipt(): void {
    window.print();
  }

  countForFilter(filter: string): number {
    return this.receipts.filter(receipt =>
      (filter === 'all' || receipt.allocationStatus === filter) &&
      new Date(receipt.timestamp) >= this.dateRangeStart() &&
      new Date(receipt.timestamp) <= this.endOfDate(this.dateRangeEnd()),
    ).length;
  }

  private endOfDate(date: Date): Date {
    const endOfDate = new Date(date);
    endOfDate.setHours(23, 59, 59, 999);
    return endOfDate;
  }

  private formatDateForFilter(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  private parseFilterDate(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  get filteredCount(): number {
    return this.dataSource.filteredData.length;
  }

  get allocationFilterLabel(): string {
    const option = this.filterOptions.find(item => item.value === this.selectedFilter());
    return `${option?.label ?? 'All Payments'} (${this.filteredCount})`;
  }
}
