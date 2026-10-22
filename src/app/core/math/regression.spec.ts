import { describe, expect, it } from 'vitest';
import { classifyCorrelation, linearRegression, pearson, predict } from './regression';

// Referencias: scipy.stats.linregress.
describe('correlación y regresión', () => {
  it('correlación perfecta positiva y negativa', () => {
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1, 12);
    expect(pearson([1, 2, 3, 4], [8, 6, 4, 2])).toBeCloseTo(-1, 12);
    expect(classifyCorrelation(1)).toBe('perfecta');
  });

  it('variable constante → r indefinido', () => {
    expect(pearson([1, 2, 3], [5, 5, 5])).toBeNaN();
    expect(pearson([2, 2, 2], [1, 2, 3])).toBeNaN();
  });

  it('ajuste del spec: x=1..5, y=2.1,3.9,6.2,7.8,10.1', () => {
    const reg = linearRegression([1, 2, 3, 4, 5], [2.1, 3.9, 6.2, 7.8, 10.1]);
    expect(reg.slope).toBeCloseTo(1.99, 12);
    expect(reg.intercept).toBeCloseTo(0.05, 12);
    expect(reg.r).toBeCloseTo(0.9986517555689656, 12);
    expect(reg.r2).toBeCloseTo(0.997305328900977, 12);
    expect(reg.r2).toBeGreaterThan(0.99);
  });

  it('segundo caso de referencia', () => {
    const reg = linearRegression([1, 2, 3, 4, 5, 6], [2, 1, 4, 3, 7, 5]);
    expect(reg.slope).toBeCloseTo(0.9142857142857143, 12);
    expect(reg.intercept).toBeCloseTo(0.4666666666666668, 12);
    expect(reg.r).toBeCloseTo(0.7917946548886295, 12);
    expect(reg.r2).toBeCloseTo(0.6269387755102039, 12);
  });

  it('pendiente negativa exacta', () => {
    const reg = linearRegression([1, 2, 3, 4], [8, 6, 4, 2]);
    expect(reg.slope).toBeCloseTo(-2, 12);
    expect(reg.intercept).toBeCloseTo(10, 12);
  });

  it('predicción y aviso de extrapolación', () => {
    const reg = linearRegression([1, 2, 3, 4, 5], [2.1, 3.9, 6.2, 7.8, 10.1]);
    expect(predict(reg, 3.5)).toMatchObject({ extrapolated: false });
    expect(predict(reg, 3.5).yHat).toBeCloseTo(0.05 + 1.99 * 3.5, 12);
    expect(predict(reg, 10).extrapolated).toBe(true);
    expect(predict(reg, 0).extrapolated).toBe(true);
  });

  it('exige al menos 3 pares y misma longitud', () => {
    expect(() => linearRegression([1, 2], [1, 2])).toThrow(RangeError);
    expect(() => linearRegression([1, 2, 3], [1, 2])).toThrow(RangeError);
    expect(() => linearRegression([4, 4, 4], [1, 2, 3])).toThrow(/constante/);
  });

  it('r siempre dentro de [−1, 1] aun con redondeo', () => {
    const xs = Array.from({ length: 50 }, (_, i) => i * 0.1);
    const ys = xs.map((x) => 3 * x + 0.2);
    const r = pearson(xs, ys);
    expect(r).toBeLessThanOrEqual(1);
    expect(r).toBeGreaterThanOrEqual(-1);
  });

  it('clasificación de |r|', () => {
    expect(classifyCorrelation(0.95)).toBe('muy fuerte');
    expect(classifyCorrelation(-0.75)).toBe('fuerte');
    expect(classifyCorrelation(0.5)).toBe('moderada');
    expect(classifyCorrelation(0.25)).toBe('débil');
    expect(classifyCorrelation(0.01)).toBe('nula');
  });
});
