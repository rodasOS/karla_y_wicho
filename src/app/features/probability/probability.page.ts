import { ChangeDetectionStrategy, Component, ElementRef, Injector, WritableSignal, afterNextRender, computed, inject, input, linkedSignal, signal, viewChild } from '@angular/core';
import { mean, stdDev } from '../../core/math/stats';
import { parseData } from '../../core/parsing/data-parser';
import { EventKind, ClassicKind, solveClassic, solveEvents, solveNormal, solvePercentile } from '../../core/steps/probability';
import { Solution, exact } from '../../core/steps/solution';
import { validateCount, validateProbability, validateRequiredNumber, validateSeries, validateSigma } from '../../core/validation/validation';
import { AlertBanner } from '../../shared/alert-banner/alert-banner';
import { DataInput } from '../../shared/data-input/data-input';
import { DecimalsSelect } from '../../shared/decimals-select/decimals-select';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ErrorItem, ErrorSummary } from '../../shared/error-summary/error-summary';
import { Icon } from '../../shared/icon/icon';
import { NumberField, toNumber } from '../../shared/number-field/number-field';
import { SolutionView } from '../../shared/solution-view/solution-view';
import { TabItem, Tabs } from '../../shared/tabs/tabs';

type Tab = 'normal' | 'inverso' | 'eventos' | 'clasica';
type NormalType = 'menor' | 'mayor' | 'entre';

interface Outcome {
  solution: Solution | null;
  errors: ErrorItem[];
}

interface FieldDef {
  id: string;
  label: string;
  hint?: string;
  sig: WritableSignal<string>;
}

const TABS: TabItem[] = [
  { id: 'normal', label: 'Normal: probabilidades' },
  { id: 'inverso', label: 'Normal: percentil' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'clasica', label: 'Clásica y combinatoria' },
];

const EVENT_KINDS: { id: EventKind; label: string }[] = [
  { id: 'union', label: 'Unión P(A∪B)' },
  { id: 'complemento', label: "Complemento P(A')" },
  { id: 'interseccion', label: 'Intersección independiente P(A∩B)' },
  { id: 'condicional', label: 'Condicional P(A|B)' },
  { id: 'bayes', label: 'Teorema de Bayes' },
];

const CLASSIC_KINDS: { id: ClassicKind; label: string }[] = [
  { id: 'clasica', label: 'Casos favorables / posibles' },
  { id: 'combinaciones', label: 'Combinaciones C(n, k)' },
  { id: 'permutaciones', label: 'Permutaciones P(n, k)' },
  { id: 'factorial', label: 'Factorial n!' },
];

@Component({
  selector: 'app-probability-page',
  imports: [AlertBanner, DataInput, DecimalsSelect, EmptyState, ErrorSummary, Icon, NumberField, SolutionView, Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './probability.page.html',
})
export class ProbabilityPage {
  private readonly injector = inject(Injector);

  // Parámetros de la URL
  readonly pestana = input<string>();
  readonly mu = input<string>();
  readonly sigma = input<string>();
  readonly tipoNormal = input<string>();
  readonly a = input<string>();
  readonly b = input<string>();
  readonly percentil = input<string>();
  readonly clasica = input<string>();
  readonly n = input<string>();
  readonly k = input<string>();
  readonly entendido = input<string>();
  readonly aviso = input<string>();

  protected readonly tabs = TABS;
  protected readonly eventKinds = EVENT_KINDS;
  protected readonly classicKinds = CLASSIC_KINDS;

  protected readonly tab = linkedSignal<Tab>(() => (TABS.some((t) => t.id === this.pestana()) ? (this.pestana() as Tab) : 'normal'));
  protected readonly decimals = signal(4);
  protected readonly submitted = signal(false);

  // Normal
  protected readonly muText = linkedSignal(() => this.mu() ?? '');
  protected readonly sigmaText = linkedSignal(() => this.sigma() ?? '');
  protected readonly normalType = linkedSignal<NormalType>(() => (['menor', 'mayor', 'entre'].includes(this.tipoNormal() ?? '') ? (this.tipoNormal() as NormalType) : 'menor'));
  protected readonly aText = linkedSignal(() => this.a() ?? '');
  protected readonly bText = linkedSignal(() => this.b() ?? '');
  protected readonly percText = linkedSignal(() => this.percentil() ?? '');
  protected readonly fromSample = signal(false);
  protected readonly serieText = signal('');

  // Eventos
  protected readonly eventKind = signal<EventKind>('union');
  private readonly pA = signal('');
  private readonly pB = signal('');
  private readonly pAB = signal('');
  private readonly pBA = signal('');
  private readonly pBnA = signal('');

  // Clásica
  protected readonly classicKind = linkedSignal<ClassicKind>(() => (CLASSIC_KINDS.some((c) => c.id === this.clasica()) ? (this.clasica() as ClassicKind) : 'combinaciones'));
  protected readonly nText = linkedSignal(() => this.n() ?? '');
  protected readonly kText = linkedSignal(() => this.k() ?? '');
  protected readonly favText = signal('');
  protected readonly posText = signal('');

  private readonly summary = viewChild(ErrorSummary);
  private readonly resultPanel = viewChild<ElementRef<HTMLElement>>('resultPanel');

  protected readonly eventFields = computed<FieldDef[]>(() => {
    const all: Record<string, FieldDef> = {
      pA: { id: 'pA', label: 'P(A)', hint: 'Entre 0 y 1', sig: this.pA },
      pB: { id: 'pB', label: 'P(B)', hint: 'Entre 0 y 1', sig: this.pB },
      pAB: { id: 'pAB', label: 'P(A∩B)', hint: 'Probabilidad de que ocurran ambos', sig: this.pAB },
      pBA: { id: 'pBA', label: 'P(B|A)', hint: 'Probabilidad de B sabiendo A', sig: this.pBA },
      pBnA: { id: 'pBnA', label: "P(B|A')", hint: 'Probabilidad de B sabiendo que A no ocurrió', sig: this.pBnA },
    };
    const sets: Record<EventKind, string[]> = {
      union: ['pA', 'pB', 'pAB'],
      complemento: ['pA'],
      interseccion: ['pA', 'pB'],
      condicional: ['pAB', 'pB'],
      bayes: ['pA', 'pBA', 'pBnA'],
    };
    return sets[this.eventKind()].map((k) => all[k]);
  });

  protected readonly classicFields = computed<FieldDef[]>(() => {
    switch (this.classicKind()) {
      case 'clasica':
        return [
          { id: 'favorables', label: 'Casos favorables', sig: this.favText },
          { id: 'posibles', label: 'Casos posibles', sig: this.posText },
        ];
      case 'factorial':
        return [{ id: 'n', label: 'n', sig: this.nText }];
      default:
        return [
          { id: 'n', label: 'n (total de elementos)', sig: this.nText },
          { id: 'k', label: 'k (elementos elegidos)', sig: this.kText },
        ];
    }
  });

  protected readonly seriesParsed = computed(() => parseData(this.serieText()));
  protected readonly seriesStats = computed(() => {
    const p = this.seriesParsed();
    return validateSeries(p, 2).ok ? { mean: mean(p.values), sd: stdDev(p.values, true) } : null;
  });

  /** Resultado según la pestaña activa. */
  protected readonly outcome = computed<Outcome>(() => {
    const d = this.decimals();
    const errors: ErrorItem[] = [];
    const push = (v: { errors: { message: string }[] }, fieldId: string) => v.errors.forEach((e) => errors.push({ message: e.message, fieldId }));
    const num = (t: string) => toNumber(t);
    const guard = (fn: () => Solution): Outcome => {
      try {
        return { solution: fn(), errors: [] };
      } catch (e) {
        return { solution: null, errors: [{ message: (e as Error).message }] };
      }
    };

    switch (this.tab()) {
      case 'normal': {
        const mu = num(this.muText());
        const sg = num(this.sigmaText());
        const a = num(this.aText());
        const b = num(this.bText());
        push(validateRequiredNumber(mu, 'la media μ'), 'mu');
        push(validateSigma(sg), 'sigma');
        push(validateRequiredNumber(a, this.normalType() === 'entre' ? 'el límite inferior a' : 'el valor x'), 'a');
        if (this.normalType() === 'entre') push(validateRequiredNumber(b, 'el límite superior b'), 'b');
        if (errors.length) return { solution: null, errors };
        return guard(() => solveNormal({ type: this.normalType(), mu: mu!, sigma: sg!, a: a!, b: b ?? undefined, decimals: d, fromSample: this.fromSample() }));
      }
      case 'inverso': {
        const mu = num(this.muText());
        const sg = num(this.sigmaText());
        const pc = num(this.percText());
        push(validateRequiredNumber(mu, 'la media μ'), 'mu');
        push(validateSigma(sg), 'sigma');
        push(validateRequiredNumber(pc, 'el percentil (entre 0 y 100)'), 'percentil');
        if (errors.length) return { solution: null, errors };
        return guard(() => solvePercentile({ percentile: pc!, mu: mu!, sigma: sg!, decimals: d, fromSample: this.fromSample() }));
      }
      case 'eventos': {
        const names: Record<string, string> = { pA: 'P(A)', pB: 'P(B)', pAB: 'P(A∩B)', pBA: 'P(B|A)', pBnA: "P(B|A')" };
        const vals: Record<string, number | null> = {};
        for (const f of this.eventFields()) {
          vals[f.id] = num(f.sig());
          push(validateProbability(vals[f.id], names[f.id]), f.id);
        }
        if (errors.length) return { solution: null, errors };
        return guard(() => solveEvents({ kind: this.eventKind(), pA: vals['pA'] ?? undefined, pB: vals['pB'] ?? undefined, pAB: vals['pAB'] ?? undefined, pBgivenA: vals['pBA'] ?? undefined, pBgivenNotA: vals['pBnA'] ?? undefined, decimals: d }));
      }
      case 'clasica': {
        const kind = this.classicKind();
        const vals: Record<string, number | null> = {};
        for (const f of this.classicFields()) {
          vals[f.id] = num(f.sig());
          push(validateCount(vals[f.id], f.label), f.id);
        }
        if (errors.length) return { solution: null, errors };
        return guard(() => solveClassic({ kind, favorable: vals['favorables'] ?? undefined, possible: vals['posibles'] ?? undefined, n: vals['n'] ?? undefined, k: vals['k'] ?? undefined, decimals: d }));
      }
    }
  });

  protected readonly shownErrors = computed(() => (this.submitted() ? this.outcome().errors : []));
  protected readonly emptyMessage = computed(() => (this.outcome().errors.length && !this.isPristine() ? 'Completa o corrige los campos señalados para ver el resultado.' : 'Completa los datos o carga el ejemplo para ver el procedimiento completo.'));

  private isPristine(): boolean {
    switch (this.tab()) {
      case 'normal':
      case 'inverso':
        return !this.muText() && !this.sigmaText() && !this.aText() && !this.percText();
      case 'eventos':
        return this.eventFields().every((f) => !f.sig());
      case 'clasica':
        return this.classicFields().every((f) => !f.sig());
    }
  }

  protected setMu(v: string): void {
    this.muText.set(v);
    this.fromSample.set(false);
  }
  protected setSigma(v: string): void {
    this.sigmaText.set(v);
    this.fromSample.set(false);
  }

  protected useSeries(): void {
    const s = this.seriesStats();
    if (!s) return;
    this.muText.set(exact(s.mean));
    this.sigmaText.set(exact(s.sd));
    this.fromSample.set(true);
  }

  protected loadExample(): void {
    switch (this.tab()) {
      case 'normal':
        this.muText.set('100');
        this.sigmaText.set('15');
        this.normalType.set('entre');
        this.aText.set('85');
        this.bText.set('115');
        break;
      case 'inverso':
        this.muText.set('100');
        this.sigmaText.set('15');
        this.percText.set('95');
        break;
      case 'eventos':
        this.eventKind.set('union');
        this.pA.set('0.5');
        this.pB.set('0.3');
        this.pAB.set('0.1');
        break;
      case 'clasica':
        this.classicKind.set('combinaciones');
        this.nText.set('10');
        this.kText.set('3');
        break;
    }
    this.fromSample.set(false);
    this.submitted.set(false);
  }

  protected clear(): void {
    for (const s of [this.muText, this.sigmaText, this.aText, this.bText, this.percText, this.pA, this.pB, this.pAB, this.pBA, this.pBnA, this.nText, this.kText, this.favText, this.posText]) s.set('');
    this.fromSample.set(false);
    this.submitted.set(false);
  }

  protected submit(ev: Event): void {
    ev.preventDefault();
    this.submitted.set(true);
    afterNextRender(
      () => {
        if (this.outcome().errors.length) this.summary()?.focus();
        else this.resultPanel()?.nativeElement.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      },
      { injector: this.injector },
    );
  }
}
