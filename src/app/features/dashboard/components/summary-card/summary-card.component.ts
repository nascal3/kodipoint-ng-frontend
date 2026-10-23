import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { SummaryCardData } from '../../models/dashboard.model';
import { MATERIAL_MODULES } from '@app/shared/material.imports';

export type { SummaryCardData };

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.scss',
})
export class SummaryCardComponent {
  readonly data = input.required<SummaryCardData>();
}
