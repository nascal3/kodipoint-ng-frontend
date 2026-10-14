import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { type InvoiceRecord } from '../../models/dashboard.model';

export type { InvoiceRecord };

@Component({
  selector: 'app-invoice-table',
  standalone: true,
  imports: [
    CommonModule,
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
      <div class="table-header-container">
        <div class="header-titles">
          <h2 class="table-title">Tenant Invoice Payments & Remittances</h2>
          <p class="table-subtitle">Tenant invoice settlements & payment allocations</p>
        </div>

        <div class="header-filters">
          <div class="search-input-wrapper">
            <mat-icon class="search-icon">search</mat-icon>
            <input
              type="text"
              class="search-input"
              placeholder="Search tenant or unit..."
              (input)="applyFilter($event)"
              aria-label="Search tenant or unit"
            />
          </div>

          <button mat-stroked-button class="date-filter-btn" type="button">
            <mat-icon class="calendar-icon">calendar_today</mat-icon>
            <span class="date-text">Oct 01 - Oct 31, 2024</span>
            <mat-icon class="dropdown-icon">arrow_drop_down</mat-icon>
          </button>
        </div>
      </div>

      <div class="table-responsive-wrapper">
        <table mat-table [dataSource]="dataSource()" matSort class="invoices-table">
          <!-- Invoice & Tenant Column -->
          <ng-container matColumnDef="invoice">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Invoice & Tenant</th>
            <td mat-cell *matCellDef="let record">
              <div class="tenant-cell">
                <div class="avatar-bubble" [class]="'avatar-' + record.avatarVariant">
                  {{ record.initials }}
                </div>
                <div class="tenant-details">
                  <div class="tenant-primary-line">
                    <span class="invoice-number">{{ record.invoiceNumber }}</span>
                    <span class="bullet-dot">•</span>
                    <span class="tenant-name">{{ record.tenant }}</span>
                  </div>
                  <span class="unit-location">{{ record.propertyUnit }}</span>
                </div>
              </div>
            </td>
          </ng-container>

          <!-- Invoice Total & Amount Paid Column -->
          <ng-container matColumnDef="amounts">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Invoice Total & Amount Paid</th>
            <td mat-cell *matCellDef="let record">
              <div class="amount-cell">
                <span class="total-amount">KES {{ record.total | number: '1.0-0' }}</span>
                <span
                  class="paid-amount"
                  [class.paid-success]="record.status === 'fully-paid'"
                  [class.paid-warning]="record.status === 'partially-paid'"
                >
                  Paid: KES {{ record.amountPaid | number: '1.0-0' }}
                </span>
              </div>
            </td>
          </ng-container>

          <!-- Payment Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Payment Status</th>
            <td mat-cell *matCellDef="let record">
              <div class="status-cell">
                @if (record.status === 'fully-paid') {
                  <span class="status-chip chip-fully-paid">
                    <span class="chip-dot dot-fully-paid"></span>
                    <span>Fully Paid</span>
                  </span>
                } @else if (record.status === 'partially-paid') {
                  <span class="status-chip chip-partially-paid">
                    <span class="chip-dot dot-partially-paid"></span>
                    <span>Partially Paid</span>
                  </span>
                  @if (record.balance > 0) {
                    <span class="balance-text" [class.balance-high]="record.balance > 50000">
                      KES {{ record.balance | number: '1.0-0' }} balance
                    </span>
                  }
                } @else {
                  <span class="status-chip chip-overdue">
                    <span class="chip-dot dot-overdue"></span>
                    <span>Overdue</span>
                  </span>
                }
              </div>
            </td>
          </ng-container>

          <!-- Payment Method & Ref Column -->
          <ng-container matColumnDef="payment">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Payment Method & Ref</th>
            <td mat-cell *matCellDef="let record">
              <div class="payment-cell">
                <div class="method-line">
                  <span class="method-dot" [class]="'method-dot-' + record.methodVariant"></span>
                  <span class="method-name">{{ record.paymentMethod }}</span>
                </div>
                <span class="reference-code">{{ record.reference }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Date & Time Column -->
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date & Time</th>
            <td mat-cell *matCellDef="let record">
              <span class="date-time-text">{{ record.dateTime }}</span>
            </td>
          </ng-container>

          <!-- Action Column -->
          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef class="text-right">Action</th>
            <td mat-cell *matCellDef="let record" class="text-right">
              <div class="action-buttons">
                <button
                  mat-icon-button
                  class="action-btn"
                  aria-label="Download receipt"
                  title="Download Receipt"
                  type="button"
                >
                  <mat-icon class="action-icon">download</mat-icon>
                </button>
                <button
                  mat-icon-button
                  class="action-btn"
                  aria-label="More options"
                  title="More actions"
                  type="button"
                >
                  <mat-icon class="action-icon">more_horiz</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns" class="table-data-row"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell empty-cell" [attr.colspan]="displayedColumns.length">
              No matching invoices found.
            </td>
          </tr>
        </table>
      </div>

      <mat-paginator
        [pageSizeOptions]="[5, 10, 25]"
        [pageSize]="5"
        [length]="totalRecords()"
        showFirstLastButtons
        class="custom-paginator"
      />
    </mat-card>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .table-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
      padding: 20px 24px;
      overflow: hidden;
    }

    .table-header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 20px;
    }

    .header-titles {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .table-title {
      font-size: 20px;
      font-weight: 600;
      color: #0f172a;
      letter-spacing: -0.01em;
      margin: 0;
    }

    .table-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }

    .header-filters {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .search-input-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 38px;
      padding: 0 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background-color: #ffffff;
      width: 240px;
      transition: all 0.15s ease;
    }

    .search-input-wrapper:focus-within {
      border-color: #4f46e5;
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.12);
    }

    .search-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #94a3b8;
    }

    .search-input {
      border: none;
      outline: none;
      font-size: 13px;
      color: #1e293b;
      background: transparent;
      width: 100%;
      font-family: inherit;
    }

    .search-input::placeholder {
      color: #94a3b8;
    }

    .date-filter-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 38px;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background-color: #ffffff;
      color: #1e293b;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .date-filter-btn:hover {
      border-color: #4f46e5;
      background-color: #f8faff;
    }

    .calendar-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #4f46e5;
    }

    .dropdown-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #64748b;
      margin-left: -2px;
    }

    .table-responsive-wrapper {
      width: 100%;
      overflow-x: auto;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
    }

    .invoices-table {
      width: 100%;
      border-collapse: collapse;
      background: transparent;
    }

    .invoices-table th.mat-header-cell {
      background-color: #f8faff;
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .invoices-table td.mat-cell {
      padding: 14px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
      color: #1e293b;
    }

    .table-data-row {
      transition: background-color 0.15s ease;
    }

    .table-data-row:hover {
      background-color: #f8faff;
    }

    .tenant-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar-bubble {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .avatar-primary {
      background-color: #e0e7ff;
      color: #4f46e5;
    }

    .avatar-secondary {
      background-color: #d1fae5;
      color: #059669;
    }

    .avatar-tertiary {
      background-color: #fef3c7;
      color: #d97706;
    }

    .avatar-error {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .avatar-indigo {
      background-color: #ede9fe;
      color: #6366f1;
    }

    .tenant-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .tenant-primary-line {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .invoice-number {
      font-weight: 600;
      color: #4f46e5;
      font-size: 13px;
    }

    .bullet-dot {
      color: #94a3b8;
      font-size: 11px;
    }

    .tenant-name {
      font-weight: 600;
      color: #0f172a;
      font-size: 13px;
    }

    .unit-location {
      font-size: 12px;
      color: #64748b;
    }

    .amount-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .total-amount {
      font-weight: 700;
      color: #0f172a;
      font-size: 13px;
    }

    .paid-amount {
      font-size: 12px;
      font-weight: 500;
    }

    .paid-success {
      color: #059669;
    }

    .paid-warning {
      color: #d97706;
    }

    .status-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
      align-items: flex-start;
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2px 9px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
    }

    .chip-fully-paid {
      background-color: #d1fae5;
      color: #065f46;
    }

    .chip-partially-paid {
      background-color: #fef3c7;
      color: #92400e;
    }

    .chip-overdue {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .chip-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .dot-fully-paid {
      background-color: #059669;
    }

    .dot-partially-paid {
      background-color: #d97706;
    }

    .dot-overdue {
      background-color: #dc2626;
    }

    .balance-text {
      font-size: 11px;
      color: #64748b;
      padding-left: 2px;
    }

    .balance-high {
      color: #dc2626;
      font-weight: 500;
    }

    .payment-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .method-line {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .method-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .method-dot-mpesa {
      background-color: #059669;
    }

    .method-dot-rtgs {
      background-color: #4f46e5;
    }

    .method-dot-bank {
      background-color: #94a3b8;
    }

    .method-name {
      font-size: 13px;
      font-weight: 500;
      color: #1e293b;
    }

    .reference-code {
      font-size: 12px;
      color: #64748b;
    }

    .date-time-text {
      font-size: 13px;
      color: #64748b;
      white-space: nowrap;
    }

    .text-right {
      text-align: right;
    }

    .action-buttons {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 2px;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
    }

    .action-btn:hover {
      color: #4f46e5;
      background-color: #f1f5f9;
    }

    .action-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .empty-cell {
      padding: 32px;
      text-align: center;
      color: #94a3b8;
      font-size: 13px;
    }

    .custom-paginator {
      margin-top: 12px;
      background: transparent;
      border-top: 1px solid #f1f5f9;
      color: #64748b;
      font-size: 12px;
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
      initials: 'SW',
      avatarVariant: 'primary',
      invoiceNumber: 'INV-2024-089',
      tenant: 'Sarah Wanjiku',
      propertyUnit: 'Unit 12A • Kilimani Heights',
      total: 85000,
      amountPaid: 85000,
      balance: 0,
      status: 'fully-paid',
      paymentMethod: 'M-Pesa',
      methodVariant: 'mpesa',
      reference: 'QHX4910LK7',
      dateTime: 'Today, 11:42 AM',
    },
    {
      id: '2',
      initials: 'DK',
      avatarVariant: 'secondary',
      invoiceNumber: 'INV-2024-090',
      tenant: 'David Kimani',
      propertyUnit: 'Penthouse 3 • Riverside Crest',
      total: 220000,
      amountPaid: 220000,
      balance: 0,
      status: 'fully-paid',
      paymentMethod: 'Stanbic RTGS',
      methodVariant: 'rtgs',
      reference: 'TX-902348',
      dateTime: 'Today, 09:15 AM',
    },
    {
      id: '3',
      initials: 'BM',
      avatarVariant: 'tertiary',
      invoiceNumber: 'INV-2024-091',
      tenant: 'Brenda Mutua',
      propertyUnit: 'Unit 5D • Westlands Park',
      total: 90000,
      amountPaid: 65000,
      balance: 25000,
      status: 'partially-paid',
      paymentMethod: 'M-Pesa',
      methodVariant: 'mpesa',
      reference: 'QKA882103V',
      dateTime: 'Yesterday, 04:30 PM',
    },
    {
      id: '4',
      initials: 'JN',
      avatarVariant: 'error',
      invoiceNumber: 'INV-2024-092',
      tenant: 'Joseph Njoroge',
      propertyUnit: 'Unit 8B • Silver Oaks',
      total: 120000,
      amountPaid: 30000,
      balance: 90000,
      status: 'partially-paid',
      paymentMethod: 'Bank Transfer',
      methodVariant: 'bank',
      reference: 'Ref #Pending',
      dateTime: 'Oct 01, 2024 10:15 AM',
    },
    {
      id: '5',
      initials: 'AK',
      avatarVariant: 'indigo',
      invoiceNumber: 'INV-2024-093',
      tenant: 'Amina Khalfan',
      propertyUnit: 'Studio 201 • Lavington Lofts',
      total: 52000,
      amountPaid: 52000,
      balance: 0,
      status: 'fully-paid',
      paymentMethod: 'M-Pesa',
      methodVariant: 'mpesa',
      reference: 'QKC30291PL',
      dateTime: 'Oct 02, 2024, 02:20 PM',
    },
    {
      id: '6',
      initials: 'MO',
      avatarVariant: 'primary',
      invoiceNumber: 'INV-2024-094',
      tenant: 'Michael Otieno',
      propertyUnit: 'Unit 3A • Parkview Suites',
      total: 75000,
      amountPaid: 75000,
      balance: 0,
      status: 'fully-paid',
      paymentMethod: 'M-Pesa',
      methodVariant: 'mpesa',
      reference: 'QKD992311X',
      dateTime: 'Oct 02, 2024, 11:10 AM',
    },
    {
      id: '7',
      initials: 'EK',
      avatarVariant: 'secondary',
      invoiceNumber: 'INV-2024-095',
      tenant: 'Esther Kariuki',
      propertyUnit: 'Unit 14C • Kilimani Heights',
      total: 95000,
      amountPaid: 45000,
      balance: 50000,
      status: 'partially-paid',
      paymentMethod: 'Stanbic RTGS',
      methodVariant: 'rtgs',
      reference: 'TX-902401',
      dateTime: 'Oct 01, 2024, 03:45 PM',
    },
  ]);

  readonly totalRecords = computed(() => 48);

  readonly dataSource = computed(() => {
    const ds = new MatTableDataSource(this.rawData());
    const paginatorRef = this.paginator();
    const sortRef = this.sort();

    if (paginatorRef) ds.paginator = paginatorRef;
    if (sortRef) ds.sort = sortRef;

    ds.filterPredicate = (data: InvoiceRecord, filter: string) => {
      const searchStr =
        `${data.tenant} ${data.invoiceNumber} ${data.propertyUnit} ${data.paymentMethod} ${data.reference} ${data.status}`.toLowerCase();
      return searchStr.includes(filter);
    };

    return ds;
  });

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    const ds = this.dataSource();
    ds.filter = filterValue.trim().toLowerCase();
  }
}
