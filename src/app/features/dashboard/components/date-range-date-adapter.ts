import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import type { MatDateFormats } from '@angular/material/core';

export const DATE_RANGE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: null,
  },
  display: {
    dateInput: 'day-month-year',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

export class DateRangeDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'day-month-year') {
      const month = this.getMonthNames('short')[this.getMonth(date)];
      return `${this.getDate(date)} ${month}, ${this.getYear(date)}`;
    }

    return super.format(date, displayFormat);
  }
}

export const DATE_RANGE_DATE_PROVIDERS = [
  { provide: DateAdapter, useClass: DateRangeDateAdapter },
  { provide: MAT_DATE_FORMATS, useValue: DATE_RANGE_FORMATS },
];
