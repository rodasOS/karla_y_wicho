import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { parseData } from '../../core/parsing/data-parser';

const MAX_CHIPS = 40;

/** Campo de datos: textarea + chips con lo que se leyó + error asociado al campo. */
@Component({
  selector: 'app-data-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-input.html',
  styleUrl: './data-input.css',
})
export class DataInput {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly hint = input('Separa los valores con comas, espacios o saltos de línea. Puedes usar punto o coma decimal.');
  readonly placeholder = input('Ej.: 2.1, 2.3, 2.2, 2.4, 2.0');
  readonly rows = input(3);
  /** Forzar la visualización de errores (p. ej. tras pulsar "Calcular" con datos inválidos). */
  readonly showErrors = input(false);
  /** Texto del campo (enlazable con [(value)]). */
  readonly value = model('');

  protected readonly touched = signal(false);
  protected readonly parsed = computed(() => parseData(this.value()));
  protected readonly visibleErrors = computed(() => (this.touched() || this.showErrors() ? this.parsed().errors : []));
  protected readonly chips = computed(() => this.parsed().tokens.slice(0, MAX_CHIPS));
  protected readonly hidden = computed(() => Math.max(0, this.parsed().tokens.length - MAX_CHIPS));
  protected readonly describedBy = computed(() => {
    const id = this.inputId();
    return [`${id}-hint`, this.parsed().tokens.length ? `${id}-chips` : '', this.visibleErrors().length ? `${id}-error` : ''].filter(Boolean).join(' ');
  });

  protected onInput(ev: Event): void {
    this.value.set((ev.target as HTMLTextAreaElement).value);
  }
}
