import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
}

/** Pestañas accesibles (roles ARIA, flechas y Home/End). El panel lo dibuja el padre con id `panel-<id>`. */
@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tabs" role="tablist" [attr.aria-label]="label()" (keydown)="onKey($event)">
      @for (t of tabs(); track t.id) {
        <button
          type="button"
          role="tab"
          [id]="'tab-' + t.id"
          [attr.aria-selected]="active() === t.id"
          [attr.aria-controls]="'panel-' + t.id"
          [attr.tabindex]="active() === t.id ? 0 : -1"
          [class.on]="active() === t.id"
          (click)="active.set(t.id)"
        >
          {{ t.label }}
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      margin-bottom: var(--space-5);
    }
    /* Pestañas del demo (1H, 1D, 1W…): píldoras de 8 px; la activa en azul */
    .tabs {
      display: flex;
      gap: var(--space-2);
      overflow-x: auto;
      padding: var(--space-1) 0;
    }
    button {
      flex: none;
      min-height: 44px;
      padding: 4px var(--space-4);
      border: 0;
      border-radius: var(--radius-pill);
      background: transparent;
      color: var(--color-text-muted);
      font: inherit;
      font-size: 0.9375rem;
      font-weight: 500;
      transition: all var(--motion-base);
    }
    button:hover {
      color: var(--color-text);
      background: var(--color-primary-soft);
    }
    /* Azul del demo con texto azul marino: el blanco sobre #0080FF no alcanza 4.5:1 */
    button.on {
      background: var(--color-primary);
      color: var(--color-on-primary);
      font-weight: 700;
    }
  `,
})
export class Tabs {
  readonly tabs = input.required<TabItem[]>();
  readonly label = input('Opciones');
  readonly active = model.required<string>();

  protected onKey(ev: KeyboardEvent): void {
    const ids = this.tabs().map((t) => t.id);
    const i = ids.indexOf(this.active());
    let next = i;
    if (ev.key === 'ArrowRight') next = (i + 1) % ids.length;
    else if (ev.key === 'ArrowLeft') next = (i - 1 + ids.length) % ids.length;
    else if (ev.key === 'Home') next = 0;
    else if (ev.key === 'End') next = ids.length - 1;
    else return;
    ev.preventDefault();
    this.active.set(ids[next]);
    queueMicrotask(() => document.getElementById('tab-' + ids[next])?.focus());
  }
}
