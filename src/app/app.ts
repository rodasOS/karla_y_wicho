import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Shell } from './shared/layout/shell';

@Component({
  selector: 'app-root',
  imports: [Shell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<app-shell />',
})
export class App {}
