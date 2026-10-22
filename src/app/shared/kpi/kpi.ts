import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Tarjeta KPI: etiqueta, cifra grande en mono y unidad. La cifra ajusta su tamaño y parte líneas largas. */
@Component({
  selector: 'app-kpi',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kpi" [class.primary]="primary()" [class.is-text]="isText()" [class.compact]="compact()">
      <p class="label">{{ label() }}@if (note()) { <span class="note"> · {{ note() }}</span> }</p>
      <p class="value num">{{ value() }}@if (unit()) { <span class="unit"> {{ unit() }}</span> }</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    /* Tarjeta del demo: vidrio al 80 %, borde al 50 %, radio de 16 px */
    .kpi {
      height: 100%;
      min-width: 0;
      padding: var(--space-4) var(--space-5);
      background: var(--glass-solid);
      border: 1px solid var(--color-border-soft);
      border-radius: var(--radius);
      box-shadow: var(--shadow-card);
      transition: all var(--motion-card);
    }
    .kpi.primary {
      border-color: rgb(0 128 255 / 35%);
      box-shadow: var(--shadow-card), var(--glow-card);
    }
    .label {
      margin: 0 0 var(--space-1);
      color: var(--color-text-muted);
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.3;
    }
    .note {
      opacity: 0.9;
    }
    .value {
      margin: 0;
      color: var(--color-text);
      font-family: var(--font-display);
      font-size: clamp(1.25rem, 1rem + 1vw, 1.625rem);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: 1.2;
      overflow-wrap: anywhere;
    }
    /* Cifra principal: texto con degradado azul → verde como las estadísticas del demo */
    /* inline-block: el degradado recorre solo el ancho del texto y se ve completo, como las estadísticas del demo */
    .primary .value {
      display: inline-block;
      max-width: 100%;
      background: var(--gradient-brand);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      font-size: clamp(1.875rem, 1.2rem + 2.6vw, 2.5rem);
    }
    .is-text .value {
      font-size: clamp(1.125rem, 0.9rem + 1.1vw, 1.5rem);
    }
    .primary.is-text .value {
      font-size: clamp(1.375rem, 1rem + 1.6vw, 2rem);
    }
    .compact {
      padding: var(--space-3) var(--space-4);
    }
    .compact.primary .value {
      font-size: clamp(1.375rem, 1.1rem + 1.2vw, 1.75rem);
    }
    .unit {
      -webkit-text-fill-color: var(--color-text-muted);
      color: var(--color-text-muted);
      font-family: var(--font-ui);
      font-size: max(0.875rem, 0.5em);
      font-weight: 500;
      letter-spacing: 0.02em;
    }
  `,
})
export class Kpi {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly unit = input<string>();
  readonly note = input<string>();
  readonly primary = input(false);
  /** true cuando el valor es texto (ecuación, "No hay moda") y no una cifra. */
  readonly isText = input(false);
  readonly compact = input(false);
}
