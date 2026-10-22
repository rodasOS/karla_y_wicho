import { describe, expect, it } from 'vitest';
import {
  bayes,
  classicProbability,
  combinations,
  complement,
  conditional,
  factorial,
  intersectionIndependent,
  permutations,
  union,
} from './combinatorics';

describe('probabilidad básica y combinatoria', () => {
  it('C(10,3) = 120 y simetría', () => {
    expect(combinations(10, 3)).toBe(120);
    expect(combinations(10, 7)).toBe(120);
    expect(combinations(52, 5)).toBe(2598960);
    expect(combinations(5, 0)).toBe(1);
  });

  it('permutaciones y factorial', () => {
    expect(permutations(10, 3)).toBe(720);
    expect(permutations(5, 5)).toBe(120);
    expect(factorial(0)).toBe(1);
    expect(factorial(10)).toBe(3628800);
  });

  it('rechaza combinatoria inválida', () => {
    expect(() => combinations(3, 5)).toThrow(RangeError);
    expect(() => combinations(-1, 0)).toThrow(RangeError);
    expect(() => combinations(2.5, 1)).toThrow(RangeError);
    expect(() => factorial(171)).toThrow(RangeError);
  });

  it('unión del spec: 0.5 + 0.3 − 0.1 = 0.7', () => {
    expect(union(0.5, 0.3, 0.1)).toBeCloseTo(0.7, 12);
  });

  it('rechaza probabilidades fuera de [0, 1] o inconsistentes', () => {
    expect(() => union(1.2, 0.3, 0.1)).toThrow(/entre 0 y 1/);
    expect(() => complement(-0.1)).toThrow(RangeError);
    expect(() => union(0.5, 0.3, 0.4)).toThrow(RangeError);
    expect(() => union(0.8, 0.7, 0.1)).toThrow(/inconsistentes/);
    expect(() => complement(Number.NaN)).toThrow(RangeError);
  });

  it('complemento, independencia, condicional', () => {
    expect(complement(0.3)).toBeCloseTo(0.7, 12);
    expect(intersectionIndependent(0.5, 0.4)).toBeCloseTo(0.2, 12);
    expect(conditional(0.1, 0.4)).toBeCloseTo(0.25, 12);
    expect(() => conditional(0.1, 0)).toThrow(RangeError);
  });

  it('clásica', () => {
    expect(classicProbability(1, 6)).toBeCloseTo(1 / 6, 12);
    expect(() => classicProbability(7, 6)).toThrow(RangeError);
    expect(() => classicProbability(1, 0)).toThrow(RangeError);
  });

  it('Bayes: prueba médica clásica', () => {
    // P(A)=0.01, sensibilidad 0.99, falsos positivos 0.05 → P(A|+) ≈ 0.1667
    const r = bayes(0.01, 0.99, 0.05);
    expect(r.pB).toBeCloseTo(0.0594, 12);
    expect(r.posterior).toBeCloseTo(0.0099 / 0.0594, 12);
    expect(() => bayes(0, 0, 0)).toThrow(RangeError);
  });
});
