import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { WarningLevel } from '../../core/steps/solution';
import { Icon } from '../icon/icon';

const ICONS: Record<WarningLevel, string> = { info: 'info', warning: 'alert', error: 'error' };
const TITLES: Record<WarningLevel, string> = { info: 'Nota', warning: 'Advertencia', error: 'Error' };

/** Alerta con icono y texto: el color nunca es el único portador de significado. */
@Component({
  selector: 'app-alert-banner',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="banner" [class]="level()" [attr.role]="level() === 'error' ? 'alert' : 'status'">
      <app-icon [name]="icon()" [size]="20" />
      <p><strong>{{ title() }}:</strong> {{ message() }}</p>
    </div>
  `,
  styleUrl: './alert-banner.css',
})
export class AlertBanner {
  readonly level = input<WarningLevel>('warning');
  readonly message = input.required<string>();
  protected readonly icon = computed(() => ICONS[this.level()]);
  protected readonly title = computed(() => TITLES[this.level()]);
}
