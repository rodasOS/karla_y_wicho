import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EXAMPLES } from '../../data/examples';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-examples-page',
  imports: [Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-head">
      <h1>Ejemplos</h1>
      <p class="lead">{{ examples.length }} ejercicios resueltos. Ábrelos para ver el procedimiento completo y cambia los datos para probar los tuyos.</p>
    </header>
    <ul class="grid">
      @for (e of examples; track e.id) {
        <li>
          <article class="card glass-card glass-card-hover">
            <p class="mod">{{ e.module }}</p>
            <h2>{{ e.title }}</h2>
            <p class="desc">{{ e.description }}</p>
            <p class="exp"><span>Resultado esperado</span> <strong class="num">{{ e.expected }}</strong></p>
            <a class="btn-secondary" [routerLink]="e.route" [queryParams]="e.queryParams">Abrir ejemplo <app-icon name="arrow" [size]="16" /></a>
          </article>
        </li>
      }
    </ul>
  `,
  styles: `
    .grid {
      display: grid;
      gap: var(--space-4);
      margin: 0;
      padding: 0;
      list-style: none;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    }
    .card {
      display: grid;
      gap: var(--space-2);
      align-content: start;
      height: 100%;
      padding: var(--space-5);
    }
    .mod {
      margin: 0;
      color: var(--color-cta);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    h2 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
    }
    .desc {
      margin: 0;
      color: var(--color-text-muted);
      font-size: 0.875rem;
      line-height: 1.45;
    }
    .exp {
      display: grid;
      gap: 2px;
      margin: var(--space-1) 0;
      padding: var(--space-2) var(--space-3);
      background: var(--color-info-bg);
      border: 1px solid rgb(0 128 255 / 20%);
      border-radius: var(--radius-field);
      font-size: 0.875rem;
    }
    .exp span {
      color: var(--color-text-muted);
    }
    .btn-secondary {
      justify-self: start;
      margin-top: var(--space-1);
    }
  `,
})
export class ExamplesPage {
  protected readonly examples = EXAMPLES;
}
