import { describe, expect, it } from 'vitest';
import { solveDescriptive } from './steps/descriptive';
import { solveExperimental } from './steps/experimental';
import { solveClassic, solveEvents, solveNormal, solvePercentile } from './steps/probability';
import { solveRegression } from './steps/regression';
import { frequencyByIntervals } from './math/frequency';
import { REFERENCE as R } from './reference-cases';

/** Verificación cruzada: problemas nuevos (no usados en ejemplos) contra SciPy/NumPy. Tolerancia 1e-9 relativa. */
const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 9);
const get = (s: { answer: { label: string; value: number }[] }, l: string) => s.answer.find((a) => a.label.startsWith(l))!.value;

describe('verificación cruzada contra SciPy', () => {
  it.each(R.desc.map((c, i) => [i + 1, c] as const))('descriptiva #%s', (_i, c) => {
    const s = solveDescriptive({ values: [...c.xs] });
    close(get(s, 'Media'), c.mean);
    close(get(s, 'Mediana'), c.median);
    close(get(s, 'Rango'), c.range);
    close(get(s, 'Desviación estándar muestral'), c.sd);
    close(get(s, 'Desviación estándar poblacional'), c.sigma);
    const riq = s.steps.find((x) => x.label.startsWith('Rango inter'))!.result;
    close(riq, c.q3 - c.q1);
  });

  it.each(R.desc.map((c, i) => [i + 1, c] as const))('experimental #%s: error estándar', (_i, c) => {
    close(get(solveExperimental({ values: [...c.xs], unit: 'V' }), 'Error estándar'), c.se);
  });

  it.each(R.normal.map((c, i) => [i + 1, c] as const))('normal P(X<x) y P(X>x) #%s', (_i, c) => {
    close(get(solveNormal({ type: 'menor', mu: c.mu, sigma: c.sigma, a: c.x }), 'P('), c.less);
    close(get(solveNormal({ type: 'mayor', mu: c.mu, sigma: c.sigma, a: c.x }), 'P('), c.greater);
  });

  it.each(R.between.map((c, i) => [i + 1, c] as const))('normal intervalo #%s', (_i, c) => {
    close(get(solveNormal({ type: 'entre', mu: c.mu, sigma: c.sigma, a: c.a, b: c.b }), 'P('), c.p);
  });

  it.each(R.percentile.map((c, i) => [i + 1, c] as const))('percentil #%s', (_i, c) => {
    expect(get(solvePercentile({ percentile: c.p, mu: c.mu, sigma: c.sigma }), 'Percentil')).toBeCloseTo(c.x, 8);
  });

  it.each(R.comb.map((c, i) => [i + 1, c] as const))('combinatoria #%s', (_i, c) => {
    expect(get(solveClassic({ kind: 'combinaciones', n: c.n, k: c.k }), 'C(')).toBe(c.c);
    expect(get(solveClassic({ kind: 'permutaciones', n: c.n, k: c.k }), 'P(')).toBe(c.p);
  });

  it.each(R.regression.map((c, i) => [i + 1, c] as const))('regresión #%s', (_i, c) => {
    const s = solveRegression({ x: [...c.x], y: [...c.y] });
    close(get(s, 'Pendiente'), c.b);
    close(get(s, 'Intercepto'), c.a);
    close(get(s, 'Correlación'), c.r);
    close(get(s, 'Determinación'), c.r2);
  });

  it.each(R.bayes.map((c, i) => [i + 1, c] as const))('Bayes #%s', (_i, c) => {
    close(get(solveEvents({ kind: 'bayes', pA: c.pA, pBgivenA: c.pBA, pBgivenNotA: c.pBnA }), 'P('), c.post);
  });

  it('tabla de frecuencias: Sturges y conteos igual que numpy.histogram', () => {
    const t = frequencyByIntervals([...R.freq.data]);
    expect(t.k).toBe(R.freq.k);
    expect(t.classes.map((c) => c.f)).toEqual([...R.freq.counts]);
    close(t.width, R.freq.width);
  });
});
