import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

/** Estado vacío: texto guía y, por proyección de contenido, acciones (p. ej. "Cargar ejemplo"). */
@Component({
  selector: 'app-empty-state',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty">
      <span class="icon-tile"><app-icon [name]="icon()" [size]="26" /></span>
      <p>{{ message() }}</p>
      <div class="actions"><ng-content /></div>
    </div>
  `,
  styles: `
    .empty {
      display: grid;
      justify-items: center;
      gap: var(--space-3);
      padding: var(--space-7) var(--space-4);
      text-align: center;
      color: var(--color-text-muted);
      background: var(--glass-solid);
      border: 1px dashed var(--color-border-strong);
      border-radius: var(--radius);
    }
    p {
      margin: 0;
      max-width: 44ch;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      justify-content: center;
    }
  `,
})
export class EmptyState {
  readonly message = input.required<string>();
  readonly icon = input('sigma');
}
