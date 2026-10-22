import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';

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
  const click = async (selector: string, nth = 0) => {
    el.querySelectorAll<HTMLElement>(selector)[nth].click();
    await settle();
  };
  const type = async (selector: string, value: string, nth = 0) => {
    const f = el.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(selector)[nth];
    f.value = value;
    f.dispatchEvent(new Event('input'));
    await settle();
  };
  const buttonByText = (t: string) => [...el.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent!.includes(t))!;
  const text = () => el.textContent!.replace(/\s+/g, ' ');
  const answer = () => el.querySelector('#respuesta')?.textContent?.replace(/\s+/g, ' ') ?? '';
  return { harness, el, click, type, settle, buttonByText, text, answer, router: TestBed.inject(Router) };
}

const CORRIENTE = '2.1, 2.3, 2.2, 2.4, 2.0';

describe('5.1 Inicio', () => {
  it('muestra 6 tarjetas de módulos y el botón del ejemplo de corriente', async () => {
    const p = await open('/');
    expect(p.el.querySelectorAll('.cards a.card')).toHaveLength(6);
    expect(p.text()).toContain('Probar con el ejemplo de corriente');
  });

  it('el botón del ejemplo abre el resultado 2.2 A / 0.158 A', async () => {
    const p = await open('/');
    const cta = [...p.el.querySelectorAll<HTMLAnchorElement>('.cta a')].find((a) => a.textContent!.includes('ejemplo de corriente'))!;
    const url = cta.getAttribute('href')!;
    expect(url).toContain('/descriptiva');
    const q = await open(url);
    expect(q.answer()).toContain('2.2000 A');
    expect(q.answer()).toContain('0.1581 A');
  });

  it('la barra grande navega a /pregunta con la consulta', async () => {
    const p = await open('/');
    await p.type('#home-q', 'hola, ayuda');
    p.el.querySelector<HTMLFormElement>('form.big-ask')!.dispatchEvent(new Event('submit'));
    await p.settle();
    expect(p.router.url).toContain('/pregunta?q=');
  });
});

describe('5.2 Estadística descriptiva', () => {
  it('ejemplo de corriente: media 2.2 A, s 0.1581 A, σ 0.1414 A', async () => {
    const p = await open('/descriptiva');
    expect(p.text()).toContain('Cargar ejemplo de corriente');
    await p.click('.empty button');
    expect(p.answer()).toContain('2.2000 A');
    expect(p.answer()).toContain('0.1581 A');
    expect(p.answer()).toContain('0.1414 A');
  });

  it('datos sin moda y multimodales', async () => {
    const p = await open('/descriptiva');
    await p.type('textarea', '1, 2, 3, 4');
    expect(p.text()).toContain('No hay moda');
    await p.type('textarea', '1, 1, 2, 2, 3');
    expect(p.text()).toContain('1 y 2 (bimodal)');
  });

  it('texto no numérico: no calcula y señala el valor (resumen con foco al enviar)', async () => {
    const p = await open('/descriptiva');
    await p.type('textarea', '2.1, abc, 2.3');
    expect(p.el.querySelector('#respuesta')).toBeNull();
    p.el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await p.settle();
    expect(p.el.querySelector('.es')!.textContent).toContain('"abc"');
  });

  it('campo vacío al enviar: faltan datos', async () => {
    const p = await open('/descriptiva');
    p.el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await p.settle();
    expect(p.el.querySelector('.es')!.textContent).toContain('Faltan datos');
  });

  it('cambiar decimales solo cambia la presentación', async () => {
    const p = await open(`/descriptiva?datos=${encodeURIComponent(CORRIENTE)}&unidad=A`);
    expect(p.answer()).toContain('2.2000 A');
    const sel = p.el.querySelector<HTMLSelectElement>('#decimales')!;
    sel.value = '2';
    sel.dispatchEvent(new Event('change'));
    await p.settle();
    expect(p.answer()).toContain('2.20 A');
    expect(p.answer()).toContain('0.16 A');
  });

  it('precarga desde la URL y muestra lo entendido', async () => {
    const p = await open(`/descriptiva?datos=${encodeURIComponent(CORRIENTE)}&entendido=${encodeURIComponent('Entendí: 5 datos')}`);
    expect(p.text()).toContain('Entendí: 5 datos');
    expect(p.answer()).toContain('2.2000');
  });
});

describe('5.3 Datos experimentales', () => {
  it('reporta I = 2.20 ± 0.07 A', async () => {
    const p = await open(`/experimentales?datos=${encodeURIComponent(CORRIENTE)}&unidad=A`);
    expect(p.answer()).toContain('I = 2.20 ± 0.07 A');
  });

  it('rechaza la conversión A → m y convierte A → mA', async () => {
    const p = await open(`/experimentales?datos=${encodeURIComponent(CORRIENTE)}&unidad=A`);
    await p.type('#convertir', 'm');
    expect(p.text()).toContain('magnitudes distintas');
    await p.type('#convertir', 'mA');
    expect(p.text()).toContain('Conversión de A a mA');
    expect(p.answer()).toContain('2200.0000 mA');
  });

  it('exige al menos 2 mediciones', async () => {
    const p = await open('/experimentales');
    await p.type('textarea', '5');
    p.el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await p.settle();
    expect(p.el.querySelector('.es')!.textContent).toContain('al menos 2');
  });
});

describe('5.5 Tablas y gráficas', () => {
  it('tabla con Σf = n e histograma para el ejemplo', async () => {
    const p = await open('/tablas-graficas');
    await p.click('.empty button');
    expect(p.text()).toContain('Σf = 30 = n');
    expect(p.el.querySelectorAll('app-histogram rect.bar').length).toBeGreaterThan(2);
    expect(p.text()).toContain('Cómo se obtuvieron las clases');
    const f = [...p.el.querySelectorAll('table.data')[0].querySelectorAll('tbody tr')].reduce((s, tr) => s + Number(tr.children[2].textContent), 0);
    expect(f).toBe(30);
  });

  it('pares incompletos en dispersión: advierte y no grafica', async () => {
    const p = await open('/tablas-graficas?pestana=dispersion&x=1,2,3&y=1,2');
    expect(p.el.querySelector('app-scatter')).toBeNull();
    p.el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await p.settle();
    expect(p.el.querySelector('.es')!.textContent).toContain('misma cantidad');
  });

  it('dispersión con recta', async () => {
    const p = await open('/tablas-graficas?pestana=dispersion&x=1,2,3,4,5&y=2.1,3.9,6.2,7.8,10.1');
    expect(p.el.querySelectorAll('app-scatter circle.dot')).toHaveLength(5);
    expect(p.el.querySelector('app-scatter line.fit')).not.toBeNull();
  });

  it('clases manuales inválidas se rechazan', async () => {
    const p = await open(`/tablas-graficas?datos=${encodeURIComponent('1,2,3,4,5,6')}`);
    await p.click('input[name="clases"]', 1);
    await p.type('#clases', '0');
    p.el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await p.settle();
    expect(p.el.querySelector('.es')!.textContent).toContain('entre 1 y 100');
  });
});

describe('5.6 Probabilidad', () => {
  const url = (q: string) => `/probabilidad?${q}`;

  it('P(X<115) = 0.8413 con μ=100, σ=15', async () => {
    const p = await open(url('mu=100&sigma=15&tipoNormal=menor&a=115'));
    expect(p.answer()).toContain('0.8413');
  });

  it('P(85<X<115) = 0.6827', async () => {
    const p = await open(url('mu=100&sigma=15&tipoNormal=entre&a=85&b=115'));
    expect(p.answer()).toContain('0.6827');
  });

  it('percentil 95 ≈ 124.67', async () => {
    const p = await open(url('pestana=inverso&mu=100&sigma=15&percentil=95'));
    expect(p.answer()).toContain('124.6728');
  });

  it('σ ≤ 0 se rechaza', async () => {
    const p = await open(url('mu=100&sigma=0&tipoNormal=menor&a=115'));
    p.el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await p.settle();
    expect(p.el.querySelector('#respuesta')).toBeNull();
    expect(p.el.querySelector('.es')!.textContent).toContain('σ debe ser positiva');
  });

  it('C(10,3) = 120 y unión = 0.7 con el ejemplo', async () => {
    const c = await open(url('pestana=clasica&clasica=combinaciones&n=10&k=3'));
    expect(c.answer()).toContain('120');
    const e = await open(url('pestana=eventos'));
    await e.click('.empty button');
    expect(e.answer()).toContain('0.7000');
  });

  it('probabilidad fuera de [0, 1] se rechaza', async () => {
    const p = await open(url('pestana=eventos'));
    await p.type('#pA', '1.2');
    await p.type('#pB', '0.3');
    await p.type('#pAB', '0.1');
    p.el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await p.settle();
    expect(p.el.querySelector('.es')!.textContent).toContain('entre 0 y 1');
  });

  it('usar media y s de la serie llena μ y σ y avisa que son estimaciones', async () => {
    const p = await open(url('mu=&sigma='));
    await p.type('#serie', CORRIENTE);
    await p.click('details.stats-box button.btn-secondary');
    expect((p.el.querySelector('#mu') as HTMLInputElement).value).toBe('2.2');
    expect(Number((p.el.querySelector('#sigma') as HTMLInputElement).value)).toBeCloseTo(0.158113883, 6);
    expect(p.text()).toContain('son estimaciones');
  });
});

describe('5.7 Regresión', () => {
  it('ejemplo V contra A: ecuación, r y pendiente con unidades', async () => {
    const p = await open('/regresion');
    await p.click('.empty button');
    expect(p.answer()).toContain('ŷ = 0.0500 + 1.9900x');
    expect(p.answer()).toContain('0.9987');
    expect(p.answer()).toContain('por cada 1 A de aumento en x, y cambia en promedio 1.9900 V');
    expect(p.el.querySelector('app-scatter line.fit')).not.toBeNull();
  });

  it('r = 1 en el caso perfecto', async () => {
    const p = await open('/regresion?x=1,2,3,4&y=2,4,6,8');
    expect(p.answer()).toContain('1.0000');
    expect(p.answer()).toContain('perfecta');
  });

  it('con 2 pares advierte y no interpreta', async () => {
    const p = await open('/regresion?x=1,2&y=1,2');
    p.el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await p.settle();
    expect(p.el.querySelector('.es')!.textContent).toContain('al menos 3 pares');
    expect(p.el.querySelector('#respuesta')).toBeNull();
  });

  it('advierte extrapolación', async () => {
    const p = await open('/regresion?x=1,2,3,4,5&y=2,4,6,8,11');
    await p.type('#prediccion', '10');
    expect(p.text()).toContain('extrapolación');
  });
});

describe('5.8 Interpretación σ vs s', () => {
  it('muestra 0.1414 y 0.1581 para el ejemplo de corriente', async () => {
    const p = await open('/interpretacion');
    await p.click('.empty button');
    expect(p.answer()).toContain('0.1581 A');
    expect(p.answer()).toContain('0.1414 A');
    expect(p.text()).toContain('n − 1');
  });
});

describe('5.9 Pregunta', () => {
  it('pregunta reconocida abre Estadística descriptiva con los 5 datos', async () => {
    const p = await open('/pregunta?q=' + encodeURIComponent('calcula la media y la desviación estándar muestral de 2.1, 2.3, 2.2, 2.4 y 2.0'));
    await p.settle();
    await p.harness.fixture.whenStable();
    expect(p.router.url).toContain('/descriptiva');
    expect(p.router.url).toContain('desde=pregunta');
    const el = p.harness.routeNativeElement as HTMLElement;
    expect(el.textContent).toContain('Entendí');
    expect(el.querySelector('#respuesta')!.textContent).toContain('2.2000');
  });

  it('pregunta ambigua pide aclarar y ofrece los módulos', async () => {
    const p = await open('/pregunta?q=' + encodeURIComponent('hola, necesito ayuda con 3, 5, 9'));
    expect(p.router.url).toContain('/pregunta');
    expect(p.text()).toContain('¿Qué quieres usar?');
    expect(p.el.querySelectorAll('.options a').length).toBeGreaterThanOrEqual(5);
  });

  it('pregunta sin datos abre el módulo vacío con aviso', async () => {
    const p = await open('/pregunta?q=' + encodeURIComponent('calcula la media y la desviación estándar'));
    await p.settle();
    expect(p.router.url).toContain('/descriptiva');
    const el = p.harness.routeNativeElement as HTMLElement;
    expect(el.textContent).toContain('no incluye datos');
    expect(el.querySelector('#respuesta')).toBeNull();
  });

  it('tema no soportado se declara y se sugiere un módulo', async () => {
    const p = await open('/pregunta?q=' + encodeURIComponent('haz una prueba de hipótesis'));
    expect(p.router.url).toContain('/pregunta');
    expect(p.text()).toContain('no está soportado');
    expect(p.text()).toContain('Lo más cercano que sí resuelvo');
  });

  it('sin pregunta muestra ejemplos', async () => {
    const p = await open('/pregunta');
    expect(p.el.querySelectorAll('.examples button').length).toBeGreaterThanOrEqual(5);
  });
});
