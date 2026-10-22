import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { formatFixed } from '../../core/math/rounding';
import { Solution, Step, show } from '../../core/steps/solution';
import { AlertBanner } from '../alert-banner/alert-banner';
import { Formula } from '../formula/formula';
import { Icon } from '../icon/icon';
import { Kpi } from '../kpi/kpi';
import { ResultCard } from '../result-card/result-card';

/** Dibuja una `Solution`: fórmula → sustitución → procedimiento → resultado de cada paso, y al final la respuesta e interpretación. */
@Component({
  selector: 'app-solution-view',
  imports: [AlertBanner, Formula, Icon, Kpi, ResultCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solution-view.html',
  styleUrl: './solution-view.css',
})
export class SolutionView {
  readonly solution = input.required<Solution>();
  readonly decimals = input(4);

  protected readonly expandAll = signal(false);
  protected readonly primary = computed(() => this.solution().answer.filter((a) => a.primary));

  protected toggleAll(): void {
    this.expandAll.update((v) => !v);
  }

  protected stepValue(step: Step): string {
    return step.resultText ?? show(step.result, this.decimals(), step.unit);
  }

  protected kpiValue(value: number, text?: string): string {
    return text ?? formatFixed(value, this.decimals());
  }
}
