import { TestBed } from '@angular/core/testing';
import { frequencyByIntervals, frequencyByValue } from '../../core/math/frequency';
import { Histogram } from './histogram';
import { Scatter } from './scatter';

const DATOS = [12, 15, 17, 18, 20, 21, 22, 22, 25, 27, 28, 30, 31, 33, 35, 36, 38, 40, 41, 44];

describe('Histogram', () => {
  async function render(table = frequencyByIntervals(DATOS)) {
    const f = TestBed.createComponent(Histogram);
    f.componentRef.setInput('table', table);
    f.componentRef.setInput('xTitle', 'Edad (años)');
    await f.whenStable();
    return f.nativeElement as HTMLElement;
  }

  it('dibuja una barra por clase, con ejes rotulados y role="img"', async () => {
    const t = frequencyByIntervals(DATOS);
    const el = await render(t);
    expect(el.querySelectorAll('rect.bar')).toHaveLength(t.k);
    expect(el.querySelector('svg')!.getAttribute('role')).toBe('img');
    const titles = [...el.querySelectorAll('text.title')].map((x) => x.textContent!.trim());
    expect(titles).toEqual(['Edad (años)', 'Frecuencia']);
  });

  it('las barras de un histograma no tienen separación (se tocan)', async () => {
    const el = await render();
    const bars = [...el.querySelectorAll('rect.bar')].map((r) => ({ x: +r.getAttribute('x')!, w: +r.getAttribute('width')! }));
    for (let i = 1; i < bars.length; i++) expect(bars[i].x).toBeCloseTo(bars[i - 1].x + bars[i - 1].w, 6);
  });

  it('incluye la tabla equivalente y una descripción', async () => {
    const t = frequencyByIntervals(DATOS);
    const el = await render(t);
    expect(el.querySelectorAll('tbody tr')).toHaveLength(t.k);
    const total = [...el.querySelectorAll('tbody td')].reduce((s, td) => s + Number(td.textContent), 0);
    expect(total).toBe(DATOS.length);
    expect(el.querySelector('desc')!.textContent).toContain(`${DATOS.length} datos`);
  });

  it('tabla por valor para datos discretos', async () => {
    const el = await render(frequencyByValue([1, 2, 2, 3, 3, 3]));
    expect(el.querySelectorAll('rect.bar')).toHaveLength(3);
    expect(el.querySelector('thead th')!.textContent).toContain('Valor');
  });
});

describe('Scatter', () => {
  async function render(line: { a: number; b: number } | null) {
    const f = TestBed.createComponent(Scatter);
    f.componentRef.setInput('x', [1, 2, 3, 4, 5]);
    f.componentRef.setInput('y', [2.1, 3.9, 6.2, 7.8, 10.1]);
    f.componentRef.setInput('line', line);
    f.componentRef.setInput('xTitle', 'Corriente (A)');
    f.componentRef.setInput('yTitle', 'Voltaje (V)');
    await f.whenStable();
    return f.nativeElement as HTMLElement;
  }

  it('un punto por par y sin recta por defecto', async () => {
    const el = await render(null);
    expect(el.querySelectorAll('circle.dot')).toHaveLength(5);
    expect(el.querySelector('line.fit')).toBeNull();
  });

  it('dibuja la recta ŷ = a + bx cuando se pide y la anuncia en la leyenda', async () => {
    const el = await render({ a: 0.05, b: 1.99 });
    expect(el.querySelector('line.fit')).not.toBeNull();
    expect(el.querySelector('.legend')!.textContent).toContain('ŷ = 0.05 + 1.99x');
    expect(el.querySelector('desc')!.textContent).toContain('recta de regresión');
  });

  it('ejes rotulados y tabla con los pares', async () => {
    const el = await render(null);
    expect([...el.querySelectorAll('text.title')].map((t) => t.textContent!.trim())).toEqual(['Corriente (A)', 'Voltaje (V)']);
    expect(el.querySelectorAll('tbody tr')).toHaveLength(5);
  });

  it('los puntos quedan dentro del área de dibujo', async () => {
    const el = await render({ a: 0.05, b: 1.99 });
    for (const c of el.querySelectorAll('circle.dot')) {
      expect(+c.getAttribute('cx')!).toBeGreaterThanOrEqual(92);
      expect(+c.getAttribute('cx')!).toBeLessThanOrEqual(616);
      expect(+c.getAttribute('cy')!).toBeGreaterThanOrEqual(24);
      expect(+c.getAttribute('cy')!).toBeLessThanOrEqual(316);
    }
  });
});
