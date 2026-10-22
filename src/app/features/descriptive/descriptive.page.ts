import { ChangeDetectionStrategy, Component, Injector, afterNextRender, computed, inject, input, linkedSignal, signal, viewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { parseData } from '../../core/parsing/data-parser';
import { solveDescriptive } from '../../core/steps/descriptive';
import { validateSeries } from '../../core/validation/validation';
import { CORRIENTE } from '../../data/sample-data';
import { COMMON_UNITS } from '../../core/math/units';
import { AlertBanner } from '../../shared/alert-banner/alert-banner';
import { DataInput } from '../../shared/data-input/data-input';
import { DecimalsSelect } from '../../shared/decimals-select/decimals-select';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorSummary } from '../../shared/error-summary/error-summary';
import { Icon } from '../../shared/icon/icon';
import { SolutionView } from '../../shared/solution-view/solution-view';

@Component({
  selector: 'app-descriptive-page',
  imports: [AlertBanner, DataInput, DecimalsSelect, EmptyState, ErrorSummary, Icon, SolutionView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './descriptive.page.html',
})
export class DescriptivePage {
  private readonly injector = inject(Injector);

  // Parámetros de la URL (?datos=…&unidad=…&tipo=…), enlazados por el router.
  readonly datos = input<string>();
  readonly unidad = input<string>();
  readonly tipo = input<string>();
  readonly entendido = input<string>();
  readonly aviso = input<string>();

  protected readonly text = linkedSignal(() => this.datos() ?? '');
  protected readonly unit = linkedSignal(() => this.unidad() ?? '');
  protected readonly kind = linkedSignal<'muestra' | 'poblacion'>(() => (this.tipo() === 'poblacion' ? 'poblacion' : 'muestra'));
  protected readonly decimals = signal(4);
  protected readonly submitted = signal(false);
  protected readonly units = COMMON_UNITS;

  private readonly summary = viewChild(ErrorSummary);
  private readonly resultPanel = viewChild<ElementRef<HTMLElement>>('resultPanel');

  protected readonly parsed = computed(() => parseData(this.text()));
  protected readonly validation = computed(() => validateSeries(this.parsed(), 1));
  protected readonly solution = computed(() => {
    if (!this.validation().ok) return null;
    const p = this.parsed();
    return solveDescriptive({ values: p.values, labels: p.labels, unit: this.unit(), decimals: this.decimals(), kind: this.kind() });
  });
  protected readonly errorItems = computed(() => (this.submitted() ? this.validation().errors.map((e) => ({ message: e.message, fieldId: 'datos' })) : []));
  protected readonly emptyMessage = computed(() =>
    this.parsed().empty ? 'Escribe tus datos o carga el ejemplo de corriente para ver el procedimiento completo.' : 'Corrige los datos señalados para ver el resultado.',
  );

  protected loadExample(): void {
    this.text.set(CORRIENTE.datos);
    this.unit.set(CORRIENTE.unidad);
    this.kind.set('muestra');
    this.submitted.set(false);
  }

  protected clear(): void {
    this.text.set('');
    this.unit.set('');
    this.submitted.set(false);
  }

  protected submit(ev: Event): void {
    ev.preventDefault();
    this.submitted.set(true);
    afterNextRender(
      () => {
        if (this.validation().ok) this.resultPanel()?.nativeElement.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
        else this.summary()?.focus();
      },
      { injector: this.injector },
    );
  }
}
