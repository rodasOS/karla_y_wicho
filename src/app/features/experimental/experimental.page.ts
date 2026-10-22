import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, input, linkedSignal, signal, viewChild } from '@angular/core';
import { parseData } from '../../core/parsing/data-parser';
import { COMMON_UNITS, compatibleUnits, parseUnit } from '../../core/math/units';
import { solveExperimental } from '../../core/steps/experimental';
import { validateSeries } from '../../core/validation/validation';
import { CORRIENTE } from '../../data/sample-data';
import { AlertBanner } from '../../shared/alert-banner/alert-banner';
import { DataInput } from '../../shared/data-input/data-input';
import { DecimalsSelect } from '../../shared/decimals-select/decimals-select';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorSummary } from '../../shared/error-summary/error-summary';
import { Icon } from '../../shared/icon/icon';
import { SolutionView } from '../../shared/solution-view/solution-view';

@Component({
  selector: 'app-experimental-page',
  imports: [AlertBanner, DataInput, DecimalsSelect, EmptyState, ErrorSummary, Icon, SolutionView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experimental.page.html',
})
export class ExperimentalPage {
  private readonly injector = inject(Injector);

  readonly datos = input<string>();
  readonly unidad = input<string>();
  readonly entendido = input<string>();
  readonly aviso = input<string>();

  protected readonly text = linkedSignal(() => this.datos() ?? '');
  protected readonly unit = linkedSignal(() => this.unidad() ?? '');
  protected readonly convertTo = signal('');
  protected readonly decimals = signal(4);
  protected readonly submitted = signal(false);
  protected readonly units = COMMON_UNITS;

  private readonly summary = viewChild(ErrorSummary);
  private readonly resultPanel = viewChild<ElementRef<HTMLElement>>('resultPanel');

  protected readonly parsed = computed(() => parseData(this.text()));
  protected readonly validation = computed(() => validateSeries(this.parsed(), 2, 'mediciones'));
  protected readonly targets = computed(() => compatibleUnits(this.unit().trim()));
  protected readonly unitNote = computed(() => {
    const u = this.unit().trim();
    return u && !parseUnit(u) ? `No reconozco la unidad "${u}": se usará solo como etiqueta.` : '';
  });
  protected readonly solution = computed(() => {
    if (!this.validation().ok) return null;
    const p = this.parsed();
    // Si la conversión no es válida, el resultado trae una advertencia explicándolo.
    const target = this.convertTo().trim();
    return solveExperimental({ values: p.values, labels: p.labels, unit: this.unit(), convertTo: target || undefined, decimals: this.decimals() });
  });
  protected readonly errorItems = computed(() => (this.submitted() ? this.validation().errors.map((e) => ({ message: e.message, fieldId: 'datos' })) : []));
  protected readonly emptyMessage = computed(() =>
    this.parsed().empty ? 'Escribe tus mediciones (con su unidad) o carga el ejemplo de corriente.' : 'Corrige las mediciones señaladas para ver el resultado.',
  );

  protected loadExample(): void {
    this.text.set(CORRIENTE.datos);
    this.unit.set(CORRIENTE.unidad);
    this.convertTo.set('');
    this.submitted.set(false);
  }

  protected clear(): void {
    this.text.set('');
    this.unit.set('');
    this.convertTo.set('');
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
