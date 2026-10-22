import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';

const RUTAS: [string, string][] = [
  ['/', 'Sigma Lab'],
  ['/descriptiva', 'Estadística descriptiva'],
  ['/experimentales', 'Datos experimentales'],
  ['/tablas-graficas', 'Tablas y gráficas'],
  ['/probabilidad', 'Probabilidad y distribución normal'],
  ['/regresion', 'Correlación y regresión'],
  ['/interpretacion', 'Interpretación: σ frente a s'],
  ['/ejemplos', 'Ejemplos'],
  ['/practicas', 'Prácticas'],
  ['/pregunta', 'Pregunta'],
];

describe('App: shell y rutas', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter(routes)] }).compileComponents();
  });

  it('crea la aplicación', () => {
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it.each(RUTAS)('la URL %s carga su módulo', async (url, titulo) => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(titulo);
    expect(TestBed.inject(Router).url).toBe(url);
  });

  it('una ruta desconocida muestra la página 404 interna', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/no-existe');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('No encontramos esa página');
  });

  it.each(RUTAS)('el pie con integrantes, carnés, asignatura y sección aparece en %s', async (url) => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    await fixture.whenStable();
    const footer = (fixture.nativeElement as HTMLElement).querySelector('footer')!.textContent!;
    expect(footer).toContain('Luis Fernando Samayoa Santos');
    expect(footer).toContain('2990-25-21483');
    expect(footer).toContain('Karla Estefani Gonzáles Tista');
    expect(footer).toContain('2990-25-16308');
    expect(footer).toContain('Estadística Aplicada');
    expect(footer).toContain('Sección Única');
  });

  it('la barra de pregunta navega a /pregunta con la consulta', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('#ask-q')!;
    input.value = 'media de 1 2 3';
    input.dispatchEvent(new Event('input'));
    el.querySelector<HTMLFormElement>('form.ask')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/pregunta?q=media%20de%201%202%203');
  });

  it('el menú móvil "Calcular" se abre con aria-expanded', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector<HTMLButtonElement>('.bottom button')!;
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    btn.click();
    await fixture.whenStable();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelectorAll('.sheet a')).toHaveLength(6);
  });
});
