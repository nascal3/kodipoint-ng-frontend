import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

export interface InvoiceRecord {
  id: string;
  tenant: string;
  invoiceNumber: string;
  total: number;
  amountPaid: number;
  status: 'fully-paid' | 'partially-paid' | 'overdue';
  paymentMethod: string;
  reference: string;
  date: string;
}

@Component({
  selector: 'app-invoice-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card appearance="outlined" class="table-card">
      <mat-card-header class="table-header">
        <mat-card-title>Tenant Invoice Payments & Remittances</mat-card-title>
      </mat-card-header>

      <mat-card-content class="table-content">
        <div class="table-controls">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search invoices</mat-label>
            <input matInput (input)="applyFilter($event)" placeholder="Search by tenant, invoice..." />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <button mat-button class="date-range-btn">
            <mat-icon>calendar_today</mat-icon>
            <span>Date Range</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
        </div>

        <table mat-table [dataSource]="dataSource()" matSort class="invoice-table">
          <!-- Invoice & Tenant Column -->
          <ng-container matColumnDef="invoice">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Invoice & Tenant</th>
            <td mat-cell *matCellDef="let record">
              <div class="invoice-cell">
                <div class="invoice-number">{{ record.invoiceNumber }}</div>
                <div class="tenant-name">{{ record.tenant }}</div>
              </div>
            </td>
          </ng-container>

          <!-- Invoice Total & Amount Paid Column -->
          <ng-container matColumnDef="amounts">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Invoice Total & Amount Paid</th>
            <td mat-cell *matCellDef="let record">
              <div class="amount-cell">
                <div class="total-amount">KES {{ formatCurrency(record.total) }}</div>
                <div class="paid-amount">Paid: KES {{ formatCurrency(record.amountPaid) }}</div>
              </div>
            </td>
          </ng-container>

          <!-- Payment Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Payment Status</th>
            <td mat-cell *matCellDef="let record">
              <span class="status-badge" [class]="record.status">
                {{ getStatusLabel(record.status) }}
              </span>
            </td>
          </ng-container>

          <!-- Payment Method & Ref Column -->
          <ng-container matColumnDef="payment">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Payment Method & Ref</th>
            <td mat-cell *matCellDef="let record">
              <div class="payment-cell">
                <div class="payment-method">{{ record.paymentMethod }}</div>
                <div class="payment-ref">{{ record.reference }}</div>
              </div>
            </td>
          </ng-container>

          <!-- Date & Time Column -->
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date & Time</th>
            <td mat-cell *matCellDef="let record">
              {{ record.date }}
            </td>
          </ng-container>

          <!-- Action Column -->
          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>Action</th>
            <td mat-cell *matCellDef="let record">
              <button mat-icon-button aria-label="View details" (click)="viewDetails(record)">
                <mat-icon>more_vert</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell empty-cell" [attr.colspan]="displayedColumns.length">
              No matching invoices found.
            </td>
          </tr>
        </table>

        <mat-paginator
          [pageSizeOptions]="[5, 10, 25]"
          pageSize="10"
          showFirstLastButtons
        />
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .table-card {
      background-color: var(--mat-sys-surface-container);
      border-color: var(--mat-sys-outline-variant);
      border-radius: 16px;
    }

    .table-header {
      padding: 20px 24px 0;
    }

    .table-header mat-card-title {
      font: var(--mat-sys-title-medium);
      color: var(--mat-sys-on-surface);
    }

    .table-content {
      padding: 24px;
    }

    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      gap: 16px;
    }

    .search-field {
      flex: 1;
      max-width: 400px;
    }

    .date-range-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
    }

    .invoice-table {
      width: 100%;
    }

    .invoice-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .invoice-number {
      font: var(--mat-sys-body-medium);
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }

    .tenant-name {
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }

    .amount-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .total-amount {
      font: var(--mat-sys-body-medium);
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }

    .paid-amount {
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 9999px;
      font: var(--mat-sys-label-small);
      font-weight: 500;
      display: inline-block;
    }

    .status-badge.fully-paid {
      background-color: #E6F4EA;
      color: #137333;
    }

    .status-badge.partially-paid {
      background-color: #FEF7E0;
      color: #B06000;
    }

    .status-badge.overdue {
      background-color: #FCE8E6;
      color: #C5221F;
    }

    .payment-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .payment-method {
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface);
    }

    .payment-ref {
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }

    .empty-cell {
      padding: 24px;
      text-align: center;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class InvoiceTableComponent {
  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);

  readonly displayedColumns: string[] = [
    'invoice',
    'amounts',
    'status',
    'payment',
    'date',
    'action',
  ];

  protected readonly rawData = signal<InvoiceRecord[]>([
    {
      id: '1',
      tenant: 'John Doe',
      invoiceNumber: 'INV-2024-001',
      total: 45000,
      amountPaid: 45000,
      status: 'fully-paid',
      paymentMethod: 'M-Pesa',
      reference: 'MPESA123456',
      date: 'Dec 15, 2024 10:30 AM',
    },
    {
      id: '2',
      tenant: 'Jane Smith',
      invoiceNumber: 'INV-2024-002',
      total: 52000,
      amountPaid: 26000,
      status: 'partially-paid',
      paymentMethod: 'Bank Transfer',
      reference: 'BANK789012',
      date: 'Dec 14, 2024 2:15 PM',
    },
    {
      id: '3',
      tenant: 'Robert Johnson',
      invoiceNumber: 'INV-2024-003',
      total: 38000,
      amountPaid: 0,
      status: 'overdue',
      paymentMethod: 'RTGS',
      reference: 'RTGS345678',
      date: 'Dec 10, 2024 9:00 AM',
    },
    {
      id: '4',
      tenant: 'Emily Davis',
      invoiceNumber: 'INV-2024-004',
      total: 60000,
      amountPaid: 60000,
      status: 'fully-paid',
      paymentMethod: 'M-Pesa',
      reference: 'MPESA901234',
      date: 'Dec 12, 2024 11:45 AM',
    },
    {
      id: '5',
      tenant: 'Michael Wilson',
      invoiceNumber: 'INV-2024-005',
      total: 48000,
      amountPaid: 24000,
      status: 'partially-paid',
      paymentMethod: 'Bank Transfer',
      reference: 'BANK567890',
      date: 'Dec 13, 2024 3:30 PM',
    },
  ]);

  protected readonly dataSource = computed(() => {
    const ds = new MatTableDataSource(this.rawData());
    const paginatorRef = this.paginator();
    const sortRef = this.sort();
    if (paginatorRef) ds.paginator = paginatorRef;
    if (sortRef) ds.sort = sortRef;
    return ds;
  });

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    const ds = this.dataSource();
    ds.filter = filterValue.trim().toLowerCase();
  }

  viewDetails(record: InvoiceRecord): void {
    console.log('View details for:', record);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'fully-paid': 'Fully Paid',
      'partially-paid': 'Partially Paid',
      'overdue': 'Overdue',
    };
    return labels[status] || status;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('en-KE');
  }
}
