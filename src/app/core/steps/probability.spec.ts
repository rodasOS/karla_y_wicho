import { describe, expect, it } from 'vitest';
import { solveClassic, solveEvents, solveNormal, solvePercentile } from './probability';
import { Solution, evalExpr } from './solution';

function stepsConsistent(s: Solution) {
  for (const step of s.steps) {
    if (!step.substitutionExpr) continue;
    expect(evalExpr(step.substitutionExpr), step.label).toBeCloseTo(step.result, 9);
  }
}
const main = (s: Solution) => s.answer.find((a) => a.primary)!.value;

describe('solveNormal', () => {
  it('P(X<115) con μ=100, σ=15 → z=1 y 0.8413', () => {
    const s = solveNormal({ type: 'menor', mu: 100, sigma: 15, a: 115 });
    expect(s.steps[0].result).toBeCloseTo(1, 12);
    expect(main(s)).toBeCloseTo(0.8413447460685429, 12);
    stepsConsistent(s);
  });

  it('P(85<X<115) → z=−1 y z=1, 0.6827', () => {
    const s = solveNormal({ type: 'entre', mu: 100, sigma: 15, a: 85, b: 115 });
    expect(s.steps[0].result).toBeCloseTo(-1, 12);
    expect(s.steps[1].result).toBeCloseTo(1, 12);
    expect(main(s)).toBeCloseTo(0.6826894921370859, 12);
    stepsConsistent(s);
  });

  it('P(X>115) y media negativa consistentes', () => {
    const s = solveNormal({ type: 'mayor', mu: -5, sigma: 2, a: -2 });
    expect(main(s)).toBeCloseTo(0.0668072012688581, 10);
    stepsConsistent(s);
  });

  it('σ inválida y límites inconsistentes lanzan error', () => {
    expect(() => solveNormal({ type: 'menor', mu: 0, sigma: 0, a: 1 })).toThrow(/σ/);
    expect(() => solveNormal({ type: 'menor', mu: 0, sigma: -1, a: 1 })).toThrow(RangeError);
    expect(() => solveNormal({ type: 'entre', mu: 0, sigma: 1, a: 3, b: 1 })).toThrow(RangeError);
    expect(() => solveNormal({ type: 'entre', mu: 0, sigma: 1, a: 3 })).toThrow(RangeError);
  });

  it('usa muestra: avisa que son estimaciones', () => {
    const s = solveNormal({ type: 'menor', mu: 2.2, sigma: 0.158, a: 2.4, fromSample: true });
    expect(s.warnings.map((w) => w.code)).toContain('estimaciones');
  });
});

describe('solvePercentile', () => {
  it('percentil 95 de N(100,15) ≈ 124.67 con z = 1.645', () => {
    const s = solvePercentile({ percentile: 95, mu: 100, sigma: 15 });
    expect(main(s)).toBeCloseTo(124.67280440427209, 8);
    expect(s.steps[0].result).toBeCloseTo(1.6448536269514722, 10);
    stepsConsistent(s);
  });
  it('rechaza percentiles fuera de (0, 100)', () => {
    expect(() => solvePercentile({ percentile: 0, mu: 0, sigma: 1 })).toThrow(RangeError);
    expect(() => solvePercentile({ percentile: 100, mu: 0, sigma: 1 })).toThrow(RangeError);
    expect(() => solvePercentile({ percentile: 95, mu: 0, sigma: 0 })).toThrow(RangeError);
  });
});

describe('solveEvents', () => {
  it('unión 0.5, 0.3, 0.1 → 0.7', () => {
    const s = solveEvents({ kind: 'union', pA: 0.5, pB: 0.3, pAB: 0.1 });
    expect(main(s)).toBeCloseTo(0.7, 12);
    expect(s.steps[0].formulaTex).toContain('P(A)+P(B)-P(A\\cap B)');
    stepsConsistent(s);
  });
  it('complemento, independiente, condicional y Bayes', () => {
    expect(main(solveEvents({ kind: 'complemento', pA: 0.3 }))).toBeCloseTo(0.7, 12);
    expect(main(solveEvents({ kind: 'interseccion', pA: 0.5, pB: 0.4 }))).toBeCloseTo(0.2, 12);
    expect(main(solveEvents({ kind: 'condicional', pAB: 0.1, pB: 0.4 }))).toBeCloseTo(0.25, 12);
    const b = solveEvents({ kind: 'bayes', pA: 0.01, pBgivenA: 0.99, pBgivenNotA: 0.05 });
    expect(main(b)).toBeCloseTo(0.0099 / 0.0594, 12);
    stepsConsistent(b);
  });
  it('probabilidad inválida o faltante', () => {
    expect(() => solveEvents({ kind: 'union', pA: 1.2, pB: 0.3, pAB: 0.1 })).toThrow(/entre 0 y 1/);
    expect(() => solveEvents({ kind: 'union', pA: 0.2 })).toThrow(/Falta/);
  });
});

describe('solveClassic', () => {
  it('C(10,3) = 120 con 10!/(3!·7!)', () => {
    const s = solveClassic({ kind: 'combinaciones', n: 10, k: 3 });
    expect(main(s)).toBe(120);
    expect(s.steps[0].substitutionTex).toContain('10!');
    stepsConsistent(s);
  });
  it('permutaciones, clásica y factorial', () => {
    expect(main(solveClassic({ kind: 'permutaciones', n: 10, k: 3 }))).toBe(720);
    expect(main(solveClassic({ kind: 'clasica', favorable: 1, possible: 6 }))).toBeCloseTo(1 / 6, 12);
    expect(main(solveClassic({ kind: 'factorial', n: 5 }))).toBe(120);
    stepsConsistent(solveClassic({ kind: 'permutaciones', n: 8, k: 2 }));
  });
  it('entradas inválidas', () => {
    expect(() => solveClassic({ kind: 'combinaciones', n: 3, k: 5 })).toThrow(RangeError);
    expect(() => solveClassic({ kind: 'clasica', favorable: 7, possible: 6 })).toThrow(RangeError);
  });
});
