import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { parseNumberToken } from '../../core/parsing/data-parser';

/** Campo numérico con etiqueta visible, ayuda y error asociados (acepta coma o punto decimal). */
@Component({
  selector: 'app-number-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field-block">
      <label [attr.for]="inputId()">{{ label() }}</label>
      <input
        class="input num"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        [id]="inputId()"
        [value]="value()"
        [placeholder]="placeholder()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="error() ? 'true' : null"
        (input)="value.set($any($event.target).value)"
        (blur)="touched.set(true)"
      />
      @if (hint()) {
        <p class="help" [id]="inputId() + '-hint'">{{ hint() }}</p>
      }
      @if (error()) {
        <p class="err" [id]="inputId() + '-error'" role="alert">{{ error() }}</p>
      }
    </div>
  `,
  styles: `
    .err {
      margin: 0;
      color: var(--color-danger);
      font-size: 0.875rem;
    }
  `,
})
export class NumberField {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly placeholder = input('');
  readonly showErrors = input(false);
  readonly value = model('');

  protected readonly touched = signal(false);
  protected readonly error = computed(() => {
    const t = this.value().trim();
    if (!t || !(this.touched() || this.showErrors())) return '';
    return parseNumberToken(t, true) === null ? `"${t}" no es un número válido.` : '';
  });
  protected readonly describedBy = computed(() => [this.hint() ? `${this.inputId()}-hint` : '', this.error() ? `${this.inputId()}-error` : ''].filter(Boolean).join(' ') || null);
}

/** Convierte el texto del campo a número, o null si está vacío o no es válido. */
export function toNumber(text: string): number | null {
  const t = text.trim();
  return t ? parseNumberToken(t, true) : null;
}
