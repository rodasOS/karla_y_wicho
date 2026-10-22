import { describe, expect, it } from 'vitest';
import { cdf, erf, inverseCdf, probBetween, probGreater, probLess, quantile, zScore } from './normal';

// Valores de referencia de SciPy (scipy.stats.norm / scipy.special.erf).
describe('distribución normal', () => {
  it('erf contra referencia', () => {
    expect(erf(0.5)).toBeCloseTo(0.5204998778130465, 12);
    expect(erf(-0.5)).toBeCloseTo(-0.5204998778130465, 12);
    expect(erf(2)).toBeCloseTo(0.9953222650189527, 12);
  });

  it('Φ(z) en puntos notables', () => {
    expect(cdf(0)).toBeCloseTo(0.5, 15);
    expect(cdf(1)).toBeCloseTo(0.8413447460685429, 12);
    expect(cdf(-1)).toBeCloseTo(0.15865525393145707, 12);
    expect(cdf(1.96)).toBeCloseTo(0.9750021048517795, 12);
    expect(cdf(3)).toBeCloseTo(0.9986501019683699, 12);
  });

  it('colas extremas sin perder precisión relativa', () => {
    expect(cdf(-6) / 9.865876450376946e-10).toBeCloseTo(1, 8);
    expect(cdf(-8) / 6.220960574271785e-16).toBeCloseTo(1, 6);
    expect(cdf(10)).toBe(1);
  });

  it('continuidad en el empalme serie / fracción continua (x = 3)', () => {
    const x = 3 / Math.SQRT2;
    expect(Math.abs(cdf(-(x * Math.SQRT2) + 1e-12) - cdf(-(x * Math.SQRT2)))).toBeLessThan(1e-12);
  });

  it('ejemplos del spec: μ=100, σ=15', () => {
    expect(zScore(115, 100, 15)).toBeCloseTo(1, 12);
    expect(probLess(115, 100, 15)).toBeCloseTo(0.8413447460685429, 12);
    expect(probBetween(85, 115, 100, 15)).toBeCloseTo(0.6826894921370859, 12);
    expect(probGreater(115, 100, 15)).toBeCloseTo(0.15865525393145707, 12);
  });

  it('intervalo en cola derecha conserva precisión', () => {
    expect(probBetween(5, 6, 0, 1)).toBeCloseTo(2.8665157187919333e-7 - 9.865876450376946e-10, 15);
  });

  it('Φ⁻¹ contra referencia', () => {
    expect(inverseCdf(0.5)).toBeCloseTo(0, 12);
    expect(inverseCdf(0.95)).toBeCloseTo(1.6448536269514722, 11);
    expect(inverseCdf(0.975)).toBeCloseTo(1.959963984540054, 11);
    expect(inverseCdf(0.001)).toBeCloseTo(-3.090232306167813, 10);
    expect(inverseCdf(1e-10)).toBeCloseTo(-6.361340902404056, 8);
    expect(inverseCdf(0)).toBe(-Infinity);
    expect(inverseCdf(1)).toBe(Infinity);
  });

  it('percentil 95 de N(100, 15²) ≈ 124.67', () => {
    expect(quantile(0.95, 100, 15)).toBeCloseTo(124.6728, 3);
  });

  it('Φ(Φ⁻¹(p)) = p en una malla', () => {
    for (let p = 0.001; p < 1; p += 0.0173) expect(cdf(inverseCdf(p))).toBeCloseTo(p, 12);
  });

  it('entradas inválidas', () => {
    expect(() => zScore(1, 0, 0)).toThrow(RangeError);
    expect(() => zScore(1, 0, -2)).toThrow(RangeError);
    expect(() => inverseCdf(1.5)).toThrow(RangeError);
    expect(() => probBetween(5, 1, 0, 1)).toThrow(RangeError);
  });
});
