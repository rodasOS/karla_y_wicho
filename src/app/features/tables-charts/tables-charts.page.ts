import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, input, linkedSignal, signal, viewChild } from '@angular/core';
import { FrequencyTable, frequencyByIntervals, frequencyByValue, sturgesClasses, suggestsDiscrete } from '../../core/math/frequency';
import { linearRegression } from '../../core/math/regression';
import { formatFixed } from '../../core/math/rounding';
import { parseData, parsePairs } from '../../core/parsing/data-parser';
import { exact, warn, Warning } from '../../core/steps/solution';
import { validatePairs, validateSeries } from '../../core/validation/validation';
import { AlertBanner } from '../../shared/alert-banner/alert-banner';
import { Histogram } from '../../shared/charts/histogram';
import { Scatter } from '../../shared/charts/scatter';
import { DataInput } from '../../shared/data-input/data-input';
import { DecimalsSelect } from '../../shared/decimals-select/decimals-select';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorSummary } from '../../shared/error-summary/error-summary';
import { Formula } from '../../shared/formula/formula';
import { Icon } from '../../shared/icon/icon';
import { NumberField, toNumber } from '../../shared/number-field/number-field';
import { TabItem, Tabs } from '../../shared/tabs/tabs';

const EJEMPLO_DATOS = '12, 15, 17, 18, 20, 21, 22, 22, 25, 27, 28, 30, 31, 33, 35, 36, 38, 40, 41, 44, 45, 47, 48, 50, 52, 54, 55, 58, 60, 62';
const EJEMPLO_X = '1, 2, 3, 4, 5, 6';
const EJEMPLO_Y = '2.1, 3.9, 6.2, 7.8, 10.1, 12.2';

@Component({
  selector: 'app-tables-charts-page',
  imports: [AlertBanner, DataInput, DecimalsSelect, EmptyState, ErrorSummary, Formula, Histogram, Icon, NumberField, Scatter, Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tables-charts.page.html',
})
export class TablesChartsPage {
  private readonly injector = inject(Injector);

  readonly pestana = input<string>();
  readonly datos = input<string>();
  readonly x = input<string>();
  readonly y = input<string>();
  readonly entendido = input<string>();
  readonly aviso = input<string>();

  protected readonly tabs: TabItem[] = [
    { id: 'datos', label: 'Frecuencias e histograma' },
    { id: 'dispersion', label: 'Diagrama de dispersión' },
  ];
  protected readonly tab = linkedSignal(() => (this.pestana() === 'dispersion' ? 'dispersion' : 'datos'));
  protected readonly decimals = signal(2);
  protected readonly submitted = signal(false);

  // Pestaña de datos
  protected readonly text = linkedSignal(() => this.datos() ?? '');
  protected readonly classMode = signal<'auto' | 'manual'>('auto');
  protected readonly classCount = signal('5');
  protected readonly byValue = signal(false);
  protected readonly xTitle = signal('Valores');

  // Pestaña de dispersión
  protected readonly xText = linkedSignal(() => this.x() ?? '');
  protected readonly yText = linkedSignal(() => this.y() ?? '');
  protected readonly showLine = signal(true);
  protected readonly xAxis = signal('x');
  protected readonly yAxis = signal('y');

  private readonly summary = viewChild(ErrorSummary);
  private readonly resultPanel = viewChild<ElementRef<HTMLElement>>('resultPanel');

  protected readonly parsed = computed(() => parseData(this.text()));
  protected readonly seriesValidation = computed(() => validateSeries(this.parsed(), 1));
  protected readonly discreteHint = computed(() => this.seriesValidation().ok && suggestsDiscrete(this.parsed().values) && !this.byValue());
  protected readonly kError = computed(() => {
    if (this.classMode() !== 'manual') return '';
    const k = toNumber(this.classCount());
    return k === null || !Number.isInteger(k) || k < 1 || k > 100 ? 'El número de clases debe ser un entero entre 1 y 100.' : '';
  });

  protected readonly table = computed<FrequencyTable | null>(() => {
    if (!this.seriesValidation().ok || this.kError()) return null;
    const v = this.parsed().values;
    if (this.byValue()) return frequencyByValue(v);
    return frequencyByIntervals(v, this.classMode() === 'manual' ? (toNumber(this.classCount()) ?? undefined) : undefined);
  });
  protected readonly sturges = computed(() => {
    const t = this.table();
    if (!t || t.kind !== 'intervalos' || !t.sturges) return null;
    const raw = 1 + Math.log2(t.n);
    return { n: t.n, raw, k: sturgesClasses(t.n), width: t.width, min: t.min, max: t.max };
  });

  protected readonly pairs = computed(() => parsePairs(this.xText(), this.yText()));
  protected readonly pairsValidation = computed(() => validatePairs(this.pairs(), 2));
  protected readonly scatter = computed(() => {
    if (!this.pairsValidation().ok) return null;
    const p = this.pairs();
    const x = p.x.values;
    const y = p.y.values;
    const warnings: Warning[] = [];
    let line: { a: number; b: number } | null = null;
    if (this.showLine()) {
      if (x.length < 3) warnings.push(warn('warning', 'n-insuficiente', 'Para trazar la recta de regresión se necesitan al menos 3 pares.'));
      else if (new Set(x).size < 2) warnings.push(warn('warning', 'x-constante', 'Todos los valores de x son iguales: no se puede trazar una recta de regresión.'));
      else {
        const r = linearRegression(x, y);
        line = { a: r.intercept, b: r.slope };
      }
    }
    return { x, y, line, warnings };
  });

  protected readonly errorItems = computed(() => {
    if (!this.submitted()) return [];
    if (this.tab() === 'datos') {
      const items = this.seriesValidation().errors.map((e) => ({ message: e.message, fieldId: 'datos' }));
      if (this.kError()) items.push({ message: this.kError(), fieldId: 'clases' });
      return items;
    }
    return this.pairsValidation().errors.map((e) => ({ message: e.message, fieldId: e.message.startsWith('En y') || e.message.includes('y.') ? 'y-datos' : 'x-datos' }));
  });

  protected readonly emptyMessage = computed(() => {
    if (this.tab() === 'datos') return this.parsed().empty ? 'Escribe tus datos o carga el ejemplo para construir la tabla de frecuencias y el histograma.' : 'Corrige los datos señalados para ver la tabla y el histograma.';
    return this.xText().trim() || this.yText().trim() ? 'Revisa los datos de x e y para ver el diagrama.' : 'Escribe los pares (x, y) o carga el ejemplo para ver el diagrama de dispersión.';
  });

  protected f(v: number, d = this.decimals()): string {
    return formatFixed(v, d);
  }
  protected readonly exact = exact;

  protected loadExample(): void {
    if (this.tab() === 'datos') {
      this.text.set(EJEMPLO_DATOS);
      this.classMode.set('auto');
      this.byValue.set(false);
    } else {
      this.xText.set(EJEMPLO_X);
      this.yText.set(EJEMPLO_Y);
      this.showLine.set(true);
    }
    this.submitted.set(false);
  }

  protected clear(): void {
    if (this.tab() === 'datos') this.text.set('');
    else {
      this.xText.set('');
      this.yText.set('');
    }
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
