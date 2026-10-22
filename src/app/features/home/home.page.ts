import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { APP_NAME, APP_SUBTITLE } from '../../data/authors';
import { CORRIENTE } from '../../data/sample-data';
import { Icon } from '../../shared/icon/icon';
import { MODULE_NAV } from '../../shared/layout/nav-items';

const DESCRIPTIONS: Record<string, string> = {
  '/descriptiva': 'Media, mediana, moda, rango, varianza y desviación estándar.',
  '/experimentales': 'Series de mediciones con unidades, incertidumbre y conversión.',
  '/tablas-graficas': 'Tablas de frecuencias, histogramas y diagramas de dispersión.',
  '/probabilidad': 'Eventos, combinatoria, distribución normal y percentiles.',
  '/regresion': 'Correlación de Pearson, recta de regresión y predicción.',
  '/interpretacion': 'Cuándo usar σ y cuándo s, con tus propios datos.',
};

@Component({
  selector: 'app-home-page',
  imports: [Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export class HomePage {
  private readonly router = inject(Router);

  protected readonly appName = APP_NAME;
  protected readonly subtitle = APP_SUBTITLE;
  protected readonly cards = MODULE_NAV.map((m) => ({ ...m, description: DESCRIPTIONS[m.path] }));
  protected readonly question = signal('');
  protected readonly exampleParams = { datos: CORRIENTE.datos, unidad: CORRIENTE.unidad, tipo: 'muestra' };

  protected ask(ev: Event): void {
    ev.preventDefault();
    const q = this.question().trim();
    this.router.navigate(['/pregunta'], { queryParams: q ? { q } : {} });
  }
}
