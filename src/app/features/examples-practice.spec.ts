import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { EXAMPLES } from '../data/examples';
import { SessionStore } from '../shared/session.store';

async function open(url: string) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding())] });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  await harness.fixture.whenStable();
  const el = harness.routeNativeElement as HTMLElement;
  const settle = async () => {
    harness.detectChanges();
    await harness.fixture.whenStable();
  };
  const click = async (sel: string) => {
    el.querySelector<HTMLElement>(sel)!.click();
    await settle();
  };
  const type = async (sel: string, v: string) => {
    const f = el.querySelector<HTMLInputElement>(sel)!;
    f.value = v;
    f.dispatchEvent(new Event('input'));
    await settle();
  };
  const submit = async () => {
    el.querySelector<HTMLFormElement>('form.answer')!.dispatchEvent(new Event('submit'));
    await settle();
  };
  const text = () => el.textContent!.replace(/\s+/g, ' ');
  return { harness, el, click, type, submit, settle, text };
}

describe('6.1 Ejemplos', () => {
  it('hay al menos 10 ejemplos que cubren los 6 módulos', () => {
    expect(EXAMPLES.length).toBeGreaterThanOrEqual(10);
    expect(new Set(EXAMPLES.map((e) => e.route)).size).toBe(6);
    expect(new Set(EXAMPLES.map((e) => e.id)).size).toBe(EXAMPLES.length);
  });

  it('la pantalla muestra una tarjeta por ejemplo', async () => {
    const p = await open('/ejemplos');
    expect(p.el.querySelectorAll('article.card')).toHaveLength(EXAMPLES.length);
  });

  it.each(EXAMPLES.map((e) => [e.id, e] as const))('el ejemplo %s se resuelve sin errores bloqueantes', async (_id, e) => {
    const qs = new URLSearchParams(e.queryParams).toString();
    const p = await open(`${e.route}?${qs}`);
    // Los de "cargar ejemplo" en eventos quedan vacíos hasta pulsar el botón: se cargan igual que lo haría el usuario.
    if (!p.el.querySelector('#respuesta') && p.el.querySelector('.empty button')) await p.click('.empty button');
    expect(p.el.querySelector('#respuesta') ?? p.el.querySelector('app-histogram, app-scatter'), e.id).not.toBeNull();
    expect(p.el.querySelector('.es'), 'sin resumen de errores').toBeNull();
    expect(p.el.querySelector('.banner.error'), 'sin banner de error').toBeNull();
  });

  it('el ejemplo de corriente da media 2.2 A y s = 0.158 A', async () => {
    const e = EXAMPLES.find((x) => x.id === 'corriente')!;
    const p = await open(`${e.route}?${new URLSearchParams(e.queryParams)}`);
    const a = p.el.querySelector('#respuesta')!.textContent!;
    expect(a).toContain('2.2000 A');
    expect(a).toContain('0.1581 A');
  });
});

describe('6.3 Prácticas', () => {
  it('genera una práctica con enunciado y campo de respuesta', async () => {
    const p = await open('/practicas');
    await p.click('.empty-prac button');
    expect(p.el.querySelector('.statement')!.textContent!.length).toBeGreaterThan(10);
    expect(p.el.querySelector('#respuesta-estudiante')).not.toBeNull();
  });

  it('respuesta correcta suma acierto e intento y muestra la solución', async () => {
    const p = await open('/practicas');
    await p.click('.empty-prac button');
    const comp = p.harness.routeDebugElement!.componentInstance as { exercise: () => { expected: number; decimals: number } };
    const ex = comp.exercise();
    await p.type('#respuesta-estudiante', ex.expected.toFixed(ex.decimals));
    await p.submit();
    expect(p.el.querySelector('.fb.ok')).not.toBeNull();
    // El estado no depende solo del color: icono y texto.
    expect(p.el.querySelector('.fb.ok svg')).not.toBeNull();
    expect(p.el.querySelector('.fb.ok')!.textContent).toContain('Correcto');
    expect(p.el.querySelector('#respuesta')).not.toBeNull();
    expect(TestBed.inject(SessionStore).label()).toBe('1 / 1');
    expect(p.text()).toContain('1 / 1');
  });

  it('respuesta incorrecta da pista, cuenta intento y permite reintentar', async () => {
    const p = await open('/practicas');
    await p.click('.empty-prac button');
    const comp = p.harness.routeDebugElement!.componentInstance as { exercise: () => { expected: number; decimals: number } };
    const ex = comp.exercise();
    await p.type('#respuesta-estudiante', String(ex.expected * 7 + 13));
    await p.submit();
    expect(p.el.querySelector('.fb.bad')!.textContent).toContain('Todavía no coincide');
    expect(p.el.querySelector('.fb.bad svg')).not.toBeNull();
    expect(TestBed.inject(SessionStore).label()).toBe('0 / 1');
    await p.type('#respuesta-estudiante', ex.expected.toFixed(ex.decimals));
    await p.submit();
    expect(p.el.querySelector('.fb.ok')).not.toBeNull();
    expect(TestBed.inject(SessionStore).label()).toBe('1 / 2');
  });

  it('respuesta no numérica pide un número y no cuenta', async () => {
    const p = await open('/practicas');
    await p.click('.empty-prac button');
    await p.type('#respuesta-estudiante', 'abc');
    await p.submit();
    expect(p.el.querySelector('.banner')!.textContent).toContain('no es un número');
    expect(TestBed.inject(SessionStore).label()).toBe('0 / 0');
  });

  it('"Ver solución" muestra el procedimiento sin contar intento y "Siguiente" cambia el ejercicio', async () => {
    const p = await open('/practicas');
    await p.click('.empty-prac button');
    const first = p.el.querySelector('.statement')!.textContent;
    const reveal = [...p.el.querySelectorAll<HTMLButtonElement>('form.answer button')].find((b) => b.textContent!.includes('Ver solución'))!;
    reveal.click();
    await p.settle();
    expect(p.el.querySelector('#respuesta')).not.toBeNull();
    expect(TestBed.inject(SessionStore).label()).toBe('0 / 0');
    const next = [...p.el.querySelectorAll<HTMLButtonElement>('form.answer button')].find((b) => b.textContent!.includes('Siguiente'))!;
    next.click();
    await p.settle();
    expect(p.el.querySelector('.statement')!.textContent).not.toBe(first);
    expect(p.el.querySelector('#respuesta')).toBeNull();
  });
});
