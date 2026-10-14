import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import type { InvoiceRecord } from '../../models/dashboard.model';

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
  templateUrl: './invoice-table.component.html',
  styleUrl: './invoice-table.component.css',
})
export class InvoiceTableComponent {
  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);

  readonly displayedColumns: string[] = ['invoice', 'amounts', 'status', 'payment', 'date', 'action'];

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
    const dataSource = new MatTableDataSource(this.rawData());
    const paginatorRef = this.paginator();
    const sortRef = this.sort();

    if (paginatorRef) {
      dataSource.paginator = paginatorRef;
    }
    if (sortRef) {
      dataSource.sort = sortRef;
    }

    dataSource.filterPredicate = (data: InvoiceRecord, filter: string) => {
      const searchString = `${data.tenant} ${data.invoiceNumber} ${data.propertyUnit} ${data.paymentMethod} ${data.reference} ${data.status}`.toLowerCase();
      return searchString.includes(filter);
    };

    return dataSource;
  });

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    const dataSource = this.dataSource();
    dataSource.filter = filterValue.trim().toLowerCase();
  }
}
