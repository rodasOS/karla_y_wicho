import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/** Elección de decimales a mostrar (2–6). Solo afecta la presentación, no los cálculos. */
@Component({
  selector: 'app-decimals-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field-block">
      <label [attr.for]="selectId()">Decimales a mostrar</label>
      <select class="input" [id]="selectId()" (change)="value.set(+$any($event.target).value)">
        @for (n of options; track n) {
          <option [value]="n" [selected]="n === value()">{{ n }}</option>
        }
      </select>
    </div>
  `,
})
export class DecimalsSelect {
  readonly selectId = input('decimales');
  readonly value = model(4);
  protected readonly options = [2, 3, 4, 5, 6];
}
