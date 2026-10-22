import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import katex from 'katex';

/** Lectura en voz alta aproximada de una fórmula TeX (para aria-label). */
export function texToSpeech(tex: string): string {
  let s = tex;
  const braces = String.raw`\{([^{}]*)\}`;
  for (let i = 0; i < 4; i++) {
    s = s
      .replace(new RegExp(String.raw`\\d?frac${braces}${braces}`, 'g'), '($1) entre ($2)')
      .replace(new RegExp(String.raw`\\sqrt${braces}`, 'g'), 'raíz cuadrada de ($1)')
      .replace(new RegExp(String.raw`\\bar${braces}`, 'g'), '$1 barra')
      .replace(new RegExp(String.raw`\\hat${braces}`, 'g'), '$1 sombrero')
      .replace(new RegExp(String.raw`\\text${braces}`, 'g'), '$1')
      .replace(new RegExp(String.raw`\\mathrm${braces}`, 'g'), '$1')
      .replace(new RegExp(String.raw`_${braces}`, 'g'), ' sub $1')
      .replace(new RegExp(String.raw`\^${braces}`, 'g'), ' elevado a $1');
  }
  return s
    .replace(/\\left|\\right|\\!|\\,|\;|\\ /g, ' ')
    .replace(/\\sum/g, 'suma de')
    .replace(/\\sigma/g, 'sigma')
    .replace(/\\mu/g, 'mu')
    .replace(/\\times|\\cdot/g, ' por ')
    .replace(/\\ldots|\\dots/g, ' … ')
    .replace(/\\approx/g, ' ≈ ')
    .replace(/\\le(q)?\b/g, ' menor o igual que ')
    .replace(/\\ge(q)?\b/g, ' mayor o igual que ')
    .replace(/\\Phi/g, 'Phi')
    .replace(/\^2/g, ' al cuadrado')
    .replace(/_(\w)/g, ' sub $1')
    .replace(/=/g, ' igual a ')
    .replace(/\+/g, ' más ')
    .replace(/(?<=\s|\w)-(?=\s|\w|\()/g, ' menos ')
    .replace(/[\\{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

@Component({
  selector: 'app-formula',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="f" [class.block]="display()" role="math" [attr.aria-label]="label()" [innerHTML]="html()"></span>`,
  styles: `
    :host {
      display: contents;
    }
    .f {
      font-size: 1.05em;
    }
    .block {
      display: block;
      overflow-x: auto;
      overflow-y: hidden;
      padding: var(--space-1) 0;
    }
  `,
})
export class Formula {
  private readonly sanitizer = inject(DomSanitizer);

  readonly tex = input.required<string>();
  readonly display = input(false);
  /** Texto para lectores de pantalla; por defecto se deriva de la fórmula. */
  readonly ariaLabel = input<string>();

  protected readonly label = computed(() => this.ariaLabel() ?? texToSpeech(this.tex()));

  // KaTeX genera HTML propio (con estilos en línea). La entrada son fórmulas generadas por la app
  // y números ya validados por el parser, nunca texto libre del usuario.
  protected readonly html = computed<SafeHtml>(() => {
    const out = katex.renderToString(this.tex(), { displayMode: this.display(), throwOnError: false, strict: 'ignore', trust: false, output: 'htmlAndMathml' });
    return this.sanitizer.bypassSecurityTrustHtml(out);
  });
}
