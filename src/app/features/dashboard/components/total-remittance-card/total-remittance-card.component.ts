import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MATERIAL_MODULES } from '@app/shared/material.imports';

@Component({
  selector: 'app-total-remittance-card',
  standalone: true,
  imports: [MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './total-remittance-card.component.html',
  styleUrl: './total-remittance-card.component.scss',
})
export class TotalRemittanceCardComponent {
  readonly value = input.required<string>();
}
