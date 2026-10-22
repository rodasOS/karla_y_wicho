import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MODULE_LABELS, MODULE_ROUTES, ModuleId, parseQuestion } from '../../core/parsing/question-parser';
import { toNavigation } from '../../core/parsing/question-routing';
import { AlertBanner } from '../../shared/alert-banner/alert-banner';
import { Icon } from '../../shared/icon/icon';
import { MODULE_NAV } from '../../shared/layout/nav-items';

export const EXAMPLE_QUESTIONS = [
  'Con mediciones de corriente (A): 2.1, 2.3, 2.2, 2.4 y 2.0; calcula media, desviación estándar muestral e interpreta.',
  'Calcula la mediana y la moda de 4, 8, 8, 15, 16',
  'En una normal con media 100 y desviación 15, ¿cuál es la probabilidad de que X sea menor que 115?',
  '¿Cuántas combinaciones de 10 en 3 hay?',
  'Regresión lineal con x: 1, 2, 3, 4, 5 y y: 2.1, 3.9, 6.2, 7.8, 10.1',
  '¿Cuál es la diferencia entre desviación poblacional y muestral?',
];

@Component({
  selector: 'app-ask-page',
  imports: [AlertBanner, Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ask.page.html',
})
export class AskPage {
  private readonly router = inject(Router);

  /** Pregunta confirmada (viene de la URL: /pregunta?q=…). */
  readonly q = input<string>();

  protected readonly text = linkedSignal(() => this.q() ?? '');
  protected readonly examples = EXAMPLE_QUESTIONS;
  protected readonly modules = MODULE_NAV;
  protected readonly labels = MODULE_LABELS;
  protected readonly routes = MODULE_ROUTES;

  protected readonly result = computed(() => (this.q()?.trim() ? parseQuestion(this.q()!) : null));
  protected readonly navigation = computed(() => {
    const r = this.result();
    return r ? toNavigation(r) : null;
  });
  protected readonly suggestions = computed(() => {
    const r = this.result();
    return (r?.suggestions ?? []).map((m: ModuleId) => ({ id: m, label: MODULE_LABELS[m], route: MODULE_ROUTES[m] }));
  });

  constructor() {
    // Si la intención es clara, abre el módulo con los datos precargados.
    effect(() => {
      const nav = this.navigation();
      if (nav) untracked(() => this.router.navigate([nav.route], { queryParams: nav.queryParams, replaceUrl: true }));
    });
  }

  protected ask(ev: Event): void {
    ev.preventDefault();
    const q = this.text().trim();
    this.router.navigate(['/pregunta'], { queryParams: q ? { q } : {} });
  }

  protected useExample(q: string): void {
    this.text.set(q);
    this.router.navigate(['/pregunta'], { queryParams: { q } });
  }
}
