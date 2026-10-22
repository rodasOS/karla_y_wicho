import { ChangeDetectionStrategy, Component, ElementRef, input, viewChild } from '@angular/core';

export interface ErrorItem {
  message: string;
  /** id del campo con el problema; permite saltar a él desde el resumen. */
  fieldId?: string;
}

/** Resumen de errores: se enfoca tras un envío fallido y enlaza cada error con su campo. */
@Component({
  selector: 'app-error-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (errors().length) {
      <div #box class="es" role="alert" tabindex="-1" aria-labelledby="es-title">
        <h2 id="es-title">Hay {{ errors().length === 1 ? 'un problema' : errors().length + ' problemas' }} con los datos</h2>
        <ul>
          @for (e of errors(); track $index) {
            <li>
              @if (e.fieldId) {
                <a [href]="'#' + e.fieldId" (click)="jump($event, e.fieldId)">{{ e.message }}</a>
              } @else {
                {{ e.message }}
              }
            </li>
          }
        </ul>
      </div>
    }
  `,
  styles: `
    .es {
      padding: var(--space-3) var(--space-4);
      background: var(--color-danger-bg);
      border: 1px solid rgb(251 44 54 / 40%);
      border-radius: var(--radius-field);
      color: var(--color-danger);
    }
    h2 {
      margin: 0 0 var(--space-2);
      font-size: 1rem;
    }
    ul {
      margin: 0;
      padding-left: var(--space-5);
    }
    a {
      color: inherit;
      text-decoration: underline;
    }
  `,
})
export class ErrorSummary {
  readonly errors = input.required<ErrorItem[]>();
  private readonly box = viewChild<ElementRef<HTMLElement>>('box');

  /** Lleva el foco al resumen (llamar tras un envío con errores). */
  focus(): void {
    this.box()?.nativeElement.focus();
  }

  protected jump(ev: Event, id: string): void {
    ev.preventDefault();
    document.getElementById(id)?.focus();
  }
}
