import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '@app/shared/material.imports';

@Component({
  selector: 'app-total-remittance-card',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './total-remittance-card.component.html',
  styleUrl: './total-remittance-card.component.scss',
})
export class TotalRemittanceCardComponent {
  readonly value = input.required<string>();
  readonly dateRangeStart = input.required<Date | null>();
  readonly dateRangeEnd = input.required<Date | null>();
}
