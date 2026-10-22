import { describe, expect, it } from 'vitest';
import { linearScale, niceTicks, tickLabel } from './ticks';

describe('ticks', () => {
  it('marcas agradables que cubren el dominio', () => {
    const t = niceTicks(0, 97);
    expect(t.min).toBeLessThanOrEqual(0);
    expect(t.max).toBeGreaterThanOrEqual(97);
    expect(t.ticks).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it('decimales sin errores de punto flotante', () => {
    const t = niceTicks(2.0, 2.4);
    expect(t.ticks).toEqual([2, 2.1, 2.2, 2.3, 2.4]);
  });

  it('dominio de un solo valor se ensancha', () => {
    const t = niceTicks(5, 5);
    expect(t.min).toBeLessThan(5);
    expect(t.max).toBeGreaterThan(5);
    expect(niceTicks(0, 0).ticks.length).toBeGreaterThan(1);
  });

  it('negativos', () => {
    const t = niceTicks(-3.2, 7.9);
    expect(t.min).toBeLessThanOrEqual(-3.2);
    expect(t.max).toBeGreaterThanOrEqual(7.9);
    expect(t.ticks).toContain(0);
  });

  it('escala lineal y etiquetas', () => {
    const s = linearScale({ min: 0, max: 10 }, [100, 200]);
    expect(s(0)).toBe(100);
    expect(s(5)).toBe(150);
    expect(s(10)).toBe(200);
    expect(linearScale({ min: 3, max: 3 }, [0, 10])(3)).toBe(0);
    expect(tickLabel(0)).toBe('0');
    expect(tickLabel(2.5)).toBe('2.5');
    expect(tickLabel(1500000)).toBe('1.5e6');
    expect(() => niceTicks(Number.NaN, 1)).toThrow(RangeError);
  });
});
