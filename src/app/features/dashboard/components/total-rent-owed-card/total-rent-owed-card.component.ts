import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MATERIAL_MODULES } from '@app/shared/material.imports';

@Component({
  selector: 'app-total-rent-owed-card',
  standalone: true,
  imports: [MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './total-rent-owed-card.component.html',
  styleUrl: './total-rent-owed-card.component.scss',
})
export class TotalRentOwedCardComponent {
  readonly value = input.required<string>();
}
