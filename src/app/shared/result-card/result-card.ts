import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { formatFixed } from '../../core/math/rounding';
import { AnswerItem } from '../../core/steps/solution';
import { Kpi } from '../kpi/kpi';

/** Respuesta final como tarjetas KPI: las principales ocupan todo el ancho. */
@Component({
  selector: 'app-result-card',
  imports: [Kpi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kpis">
      @for (item of items(); track item.label) {
        <app-kpi
          [class.wide]="item.primary"
          [label]="item.label"
          [note]="item.note"
          [value]="valueOf(item)"
          [unit]="item.text ? undefined : item.unit"
          [primary]="!!item.primary"
          [isText]="!!item.text"
        />
      }
    </div>
  `,
  styleUrl: './result-card.css',
})
export class ResultCard {
  readonly items = input.required<AnswerItem[]>();
  readonly decimals = input(4);

  protected valueOf(item: AnswerItem): string {
    return item.text ?? formatFixed(item.value, this.decimals());
  }
}
