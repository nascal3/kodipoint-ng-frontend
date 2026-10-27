import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MATERIAL_MODULES } from '@app/shared/material.imports';

@Component({
  selector: 'app-portfolio-occupancy-card',
  standalone: true,
  imports: [MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portfolio-occupancy-card.component.html',
  styleUrl: './portfolio-occupancy-card.component.scss',
})
export class PortfolioOccupancyCardComponent {
  readonly value = input.required<string>();
  readonly unitDetail = input.required<string>();
  readonly footerText = input.required<string>();
}
