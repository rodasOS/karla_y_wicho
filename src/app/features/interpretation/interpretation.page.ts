import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, signal } from '@angular/core';
import { parseData } from '../../core/parsing/data-parser';
import { SD_EXPLANATION, solveSdComparison } from '../../core/steps/interpretation';
import { validateSeries } from '../../core/validation/validation';
import { CORRIENTE } from '../../data/sample-data';
import { AlertBanner } from '../../shared/alert-banner/alert-banner';
import { DataInput } from '../../shared/data-input/data-input';
import { DecimalsSelect } from '../../shared/decimals-select/decimals-select';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { Formula } from '../../shared/formula/formula';
import { Icon } from '../../shared/icon/icon';
import { SolutionView } from '../../shared/solution-view/solution-view';

@Component({
  selector: 'app-interpretation-page',
  imports: [AlertBanner, DataInput, DecimalsSelect, EmptyState, Formula, Icon, SolutionView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './interpretation.page.html',
})
export class InterpretationPage {
  readonly datos = input<string>();
  readonly unidad = input<string>();
  readonly entendido = input<string>();
  readonly aviso = input<string>();

  protected readonly explanation = SD_EXPLANATION;
  protected readonly text = linkedSignal(() => this.datos() ?? '');
  protected readonly unit = linkedSignal(() => this.unidad() ?? '');
  protected readonly decimals = signal(4);

  protected readonly parsed = computed(() => parseData(this.text()));
  protected readonly validation = computed(() => validateSeries(this.parsed(), 2));
  protected readonly solution = computed(() => {
    if (!this.validation().ok) return null;
    const p = this.parsed();
    return solveSdComparison({ values: p.values, labels: p.labels, unit: this.unit(), decimals: this.decimals() });
  });
  protected readonly emptyMessage = computed(() =>
    this.parsed().empty ? 'Escribe una serie de datos o carga el ejemplo para ver σ y s calculadas con tus números.' : 'Se necesitan al menos 2 datos válidos para comparar σ y s.',
  );

  protected loadExample(): void {
    this.text.set(CORRIENTE.datos);
    this.unit.set(CORRIENTE.unidad);
  }
}
