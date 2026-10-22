import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, input, linkedSignal, signal, viewChild } from '@angular/core';
import { parsePairs } from '../../core/parsing/data-parser';
import { COMMON_UNITS } from '../../core/math/units';
import { solveRegression } from '../../core/steps/regression';
import { validatePairs } from '../../core/validation/validation';
import { AlertBanner } from '../../shared/alert-banner/alert-banner';
import { Scatter } from '../../shared/charts/scatter';
import { DataInput } from '../../shared/data-input/data-input';
import { DecimalsSelect } from '../../shared/decimals-select/decimals-select';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorSummary } from '../../shared/error-summary/error-summary';
import { Icon } from '../../shared/icon/icon';
import { NumberField, toNumber } from '../../shared/number-field/number-field';
import { SolutionView } from '../../shared/solution-view/solution-view';

const EJ = { x: '1, 2, 3, 4, 5', y: '2.1, 3.9, 6.2, 7.8, 10.1', ux: 'A', uy: 'V' } as const;

@Component({
  selector: 'app-regression-page',
  imports: [AlertBanner, DataInput, DecimalsSelect, EmptyState, ErrorSummary, Icon, NumberField, Scatter, SolutionView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './regression.page.html',
})
export class RegressionPage {
  private readonly injector = inject(Injector);

  readonly x = input<string>();
  readonly y = input<string>();
  readonly unidadX = input<string>();
  readonly unidadY = input<string>();
  readonly entendido = input<string>();
  readonly aviso = input<string>();

  protected readonly xText = linkedSignal(() => this.x() ?? '');
  protected readonly yText = linkedSignal(() => this.y() ?? '');
  protected readonly unitX = linkedSignal(() => this.unidadX() ?? '');
  protected readonly unitY = linkedSignal(() => this.unidadY() ?? '');
  protected readonly predText = signal('');
  protected readonly decimals = signal(4);
  protected readonly submitted = signal(false);
  protected readonly units = COMMON_UNITS;

  private readonly summary = viewChild(ErrorSummary);
  private readonly resultPanel = viewChild<ElementRef<HTMLElement>>('resultPanel');

  protected readonly pairs = computed(() => parsePairs(this.xText(), this.yText()));
  protected readonly validation = computed(() => validatePairs(this.pairs(), 3));
  protected readonly outcome = computed(() => {
    if (!this.validation().ok) return { solution: null, error: '' };
    const p = this.pairs();
    try {
      const solution = solveRegression({
        x: p.x.values,
        y: p.y.values,
        xLabels: p.x.labels,
        yLabels: p.y.labels,
        unitX: this.unitX().trim() || undefined,
        unitY: this.unitY().trim() || undefined,
        predictAt: toNumber(this.predText()) ?? undefined,
        decimals: this.decimals(),
      });
      return { solution, error: '' };
    } catch (e) {
      return { solution: null, error: (e as Error).message };
    }
  });
  protected readonly line = computed(() => {
    const s = this.outcome().solution;
    if (!s) return null;
    const p = this.pairs();
    // Los valores a y b se recalculan desde la solución para dibujar exactamente la misma recta.
    const b = s.answer.find((a) => a.label.startsWith('Pendiente'))!.value;
    const a = s.answer.find((a) => a.label.startsWith('Intercepto'))!.value;
    return p.x.values.length ? { a, b } : null;
  });
  protected readonly errorItems = computed(() => {
    if (!this.submitted()) return [];
    const items = this.validation().errors.map((e) => ({ message: e.message, fieldId: e.message.startsWith('En y') ? 'y-datos' : 'x-datos' }));
    const o = this.outcome().error;
    return o ? [...items, { message: o, fieldId: 'x-datos' }] : items;
  });
  protected readonly emptyMessage = computed(() => {
    if (this.outcome().error) return this.outcome().error;
    return this.xText().trim() || this.yText().trim() ? 'Corrige los datos señalados para ver la regresión.' : 'Escribe los pares (x, y) o carga el ejemplo de voltaje contra corriente para ver el cálculo.';
  });

  protected loadExample(): void {
    this.xText.set(EJ.x);
    this.yText.set(EJ.y);
    this.unitX.set(EJ.ux);
    this.unitY.set(EJ.uy);
    this.predText.set('');
    this.submitted.set(false);
  }

  protected clear(): void {
    this.xText.set('');
    this.yText.set('');
    this.unitX.set('');
    this.unitY.set('');
    this.predText.set('');
    this.submitted.set(false);
  }

  protected submit(ev: Event): void {
    ev.preventDefault();
    this.submitted.set(true);
    afterNextRender(
      () => {
        if (this.errorItems().length) this.summary()?.focus();
        else this.resultPanel()?.nativeElement.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      },
      { injector: this.injector },
    );
  }
}
