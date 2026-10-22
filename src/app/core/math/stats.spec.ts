import { describe as suite, expect, it } from 'vitest';
import {
  coefficientOfVariation,
  describe,
  mean,
  median,
  mode,
  outliers,
  percentileInc,
  quartiles,
  range,
  standardError,
  stdDev,
  variance,
} from './stats';

const CORRIENTE = [2.1, 2.3, 2.2, 2.4, 2.0];

suite('estadística descriptiva', () => {
  it('ejemplo de corriente: media, varianza y desviaciones', () => {
    expect(mean(CORRIENTE)).toBeCloseTo(2.2, 12);
    expect(variance(CORRIENTE, true)).toBeCloseTo(0.025, 12);
    expect(variance(CORRIENTE, false)).toBeCloseTo(0.02, 12);
    expect(stdDev(CORRIENTE, true)).toBeCloseTo(0.15811388300841897, 12);
    expect(stdDev(CORRIENTE, false)).toBeCloseTo(0.1414213562373095, 12);
    expect(standardError(CORRIENTE)).toBeCloseTo(0.07071067811865475, 12);
    expect(coefficientOfVariation(CORRIENTE)).toBeCloseTo(0.0718699, 6);
    expect(range(CORRIENTE)).toBeCloseTo(0.4, 12);
  });

  it('mediana par e impar', () => {
    expect(median([5, 1, 3])).toBe(3);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it('moda única, sin moda y multimodal', () => {
    expect(mode([2, 3, 3, 5, 7])).toMatchObject({ modes: [3], kind: 'unimodal' });
    expect(mode([1, 2, 3, 4])).toMatchObject({ modes: [], kind: 'none' });
    expect(mode([1, 1, 2, 2, 3])).toMatchObject({ modes: [1, 2], kind: 'bimodal' });
    expect(mode([1, 1, 2, 2, 3, 3, 4])).toMatchObject({ modes: [1, 2, 3], kind: 'multimodal' });
  });

  it('ejemplo del spec: 2,3,3,5,7 → media 4, mediana 3, moda 3', () => {
    const d = describe([2, 3, 3, 5, 7]);
    expect(d.mean).toBe(4);
    expect(d.median).toBe(3);
    expect(d.mode.modes).toEqual([3]);
  });

  it('un solo dato: poblacional 0, muestral indefinida', () => {
    expect(variance([5], false)).toBe(0);
    expect(variance([5], true)).toBeNaN();
    expect(describe([5]).standardError).toBeNaN();
  });

  it('todos iguales: moda única, sin dispersión', () => {
    const d = describe([4, 4, 4]);
    expect(d.mode).toMatchObject({ modes: [4], kind: 'unimodal' });
    expect(d.sdSample).toBe(0);
  });

  it('cuartiles tipo QUARTILE.INC (Excel)', () => {
    const q = quartiles([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(q.q1).toBeCloseTo(3.25, 12);
    expect(q.q2).toBeCloseTo(5.5, 12);
    expect(q.q3).toBeCloseTo(7.75, 12);
    expect(q.iqr).toBeCloseTo(4.5, 12);
    expect(percentileInc([10, 20], 0.5)).toBe(15);
  });

  it('atípicos 1.5·RIC sin eliminar datos', () => {
    const xs = [2.1, 2.2, 2.1, 2.3, 9.8];
    const o = outliers(xs);
    expect(o.values).toEqual([9.8]);
    expect(o.indexes).toEqual([4]);
    expect(xs).toHaveLength(5);
  });

  it('estabilidad numérica con valores grandes y poca dispersión', () => {
    const xs = [1e9 + 4, 1e9 + 7, 1e9 + 13, 1e9 + 16];
    expect(variance(xs, true)).toBeCloseTo(30, 6);
  });

  it('errores con datos vacíos', () => {
    expect(() => mean([])).toThrow(RangeError);
    expect(() => describe([])).toThrow(RangeError);
  });
});
