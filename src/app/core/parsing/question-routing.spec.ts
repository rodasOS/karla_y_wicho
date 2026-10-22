import { describe, expect, it } from 'vitest';
import { parseQuestion } from './question-parser';
import { toNavigation } from './question-routing';

describe('toNavigation', () => {
  it('spec: media y s → /descriptiva con los 5 datos', () => {
    const nav = toNavigation(parseQuestion('calcula la media y la desviación estándar muestral de 2.1, 2.3, 2.2, 2.4 y 2.0'))!;
    expect(nav.route).toBe('/descriptiva');
    expect(nav.queryParams['datos']).toBe('2.1, 2.3, 2.2, 2.4, 2');
    expect(nav.queryParams['tipo']).toBe('muestra');
    expect(nav.queryParams['entendido']).toContain('Entendí');
  });

  it('sin datos: abre el módulo vacío con aviso', () => {
    const nav = toNavigation(parseQuestion('calcula la media'))!;
    expect(nav.route).toBe('/descriptiva');
    expect(nav.queryParams['datos']).toBeUndefined();
    expect(nav.queryParams['aviso']).toMatch(/no incluye datos/);
  });

  it('normal y combinaciones', () => {
    const n = toNavigation(parseQuestion('normal con media 100 y desviación 15, probabilidad menor que 115'))!;
    expect(n.route).toBe('/probabilidad');
    expect(n.queryParams).toMatchObject({ pestana: 'normal', mu: '100', sigma: '15', tipoNormal: 'menor', a: '115' });
    const c = toNavigation(parseQuestion('combinaciones de 10 en 3'))!;
    expect(c.queryParams).toMatchObject({ pestana: 'clasica', clasica: 'combinaciones', n: '10', k: '3' });
  });

  it('regresión con x e y y pares asumidos', () => {
    const r = toNavigation(parseQuestion('regresión con x: 1,2,3,4,5 y y: 2,4,6,8,10'))!;
    expect(r.route).toBe('/regresion');
    expect(r.queryParams['x']).toBe('1, 2, 3, 4, 5');
    const a = toNavigation(parseQuestion('correlación de 1 2 3 4 5 6 2 4 6 8 10 12'))!;
    expect(a.queryParams['aviso']).toMatch(/primera mitad/);
  });

  it('ambigua y no soportada no navegan', () => {
    expect(toNavigation(parseQuestion('hola'))).toBeNull();
    expect(toNavigation(parseQuestion('prueba de hipótesis'))).toBeNull();
  });
});
