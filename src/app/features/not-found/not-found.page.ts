import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>No encontramos esa página</h1>
    <p>La dirección no corresponde a ningún módulo de Proteus.</p>
    <p><a routerLink="/">Volver al inicio</a></p>
  `,
})
export class NotFoundPage {}
