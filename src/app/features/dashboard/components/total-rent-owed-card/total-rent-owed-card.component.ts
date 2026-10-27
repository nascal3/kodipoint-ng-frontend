import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '@app/shared/material.imports';

@Component({
  selector: 'app-total-rent-owed-card',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './total-rent-owed-card.component.html',
  styleUrl: './total-rent-owed-card.component.scss',
})
export class TotalRentOwedCardComponent {
  readonly value = input.required<string>();
  readonly dateRangeStart = input.required<Date | null>();
  readonly dateRangeEnd = input.required<Date | null>();
}
