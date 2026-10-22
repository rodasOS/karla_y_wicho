/** Estadística descriptiva. TypeScript puro, doble precisión. */

export function sum(xs: readonly number[]): number {
  // Suma de Kahan para reducir error de redondeo.
  let s = 0;
  let c = 0;
  for (const x of xs) {
    const y = x - c;
    const t = s + y;
    c = t - s - y;
    s = t;
  }
  return s;
}

export function mean(xs: readonly number[]): number {
  if (xs.length === 0) throw new RangeError('mean: sin datos');
  return sum(xs) / xs.length;
}

export function sortedCopy(xs: readonly number[]): number[] {
  return [...xs].sort((a, b) => a - b);
}

export function median(xs: readonly number[]): number {
  if (xs.length === 0) throw new RangeError('median: sin datos');
  const s = sortedCopy(xs);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export type ModeKind = 'none' | 'unimodal' | 'bimodal' | 'multimodal';

export interface ModeResult {
  modes: number[];
  frequency: number;
  kind: ModeKind;
}

/** Moda(s). Si todos los valores aparecen igual de seguido (y hay más de uno distinto) no hay moda. */
export function mode(xs: readonly number[]): ModeResult {
  if (xs.length === 0) throw new RangeError('mode: sin datos');
  const counts = new Map<number, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  const max = Math.max(...counts.values());
  const modes = [...counts.entries()]
    .filter(([, c]) => c === max)
    .map(([v]) => v)
    .sort((a, b) => a - b);
  if (max === 1 && counts.size > 1) return { modes: [], frequency: 1, kind: 'none' };
  if (counts.size === 1) return { modes, frequency: max, kind: 'unimodal' };
  if (modes.length === counts.size) return { modes: [], frequency: max, kind: 'none' };
  const kind: ModeKind = modes.length === 1 ? 'unimodal' : modes.length === 2 ? 'bimodal' : 'multimodal';
  return { modes, frequency: max, kind };
}

export function range(xs: readonly number[]): number {
  if (xs.length === 0) throw new RangeError('range: sin datos');
  return Math.max(...xs) - Math.min(...xs);
}

/** Suma de cuadrados de desviaciones respecto a la media (dos pasadas). */
export function sumSquaredDeviations(xs: readonly number[]): number {
  const m = mean(xs);
  return sum(xs.map((x) => (x - m) ** 2));
}

/** Varianza. `sample = true` divide entre n − 1; `false` entre n. */
export function variance(xs: readonly number[], sample: boolean): number {
  const n = xs.length;
  if (n === 0) throw new RangeError('variance: sin datos');
  if (sample && n < 2) return NaN;
  return sumSquaredDeviations(xs) / (sample ? n - 1 : n);
}

export function stdDev(xs: readonly number[], sample: boolean): number {
  return Math.sqrt(variance(xs, sample));
}

/** Error estándar de la media: s / √n. */
export function standardError(xs: readonly number[]): number {
  return stdDev(xs, true) / Math.sqrt(xs.length);
}

/** Coeficiente de variación (s / |x̄|) en forma de fracción. NaN si x̄ = 0. */
export function coefficientOfVariation(xs: readonly number[], sample = true): number {
  const m = mean(xs);
  return m === 0 ? NaN : stdDev(xs, sample) / Math.abs(m);
}

/** Percentil por interpolación lineal (equivale a PERCENTILE.INC / QUARTILE.INC de Excel). p en [0, 1]. */
export function percentileInc(xs: readonly number[], p: number): number {
  if (xs.length === 0) throw new RangeError('percentile: sin datos');
  if (p < 0 || p > 1) throw new RangeError('percentile: p fuera de [0, 1]');
  const s = sortedCopy(xs);
  const pos = p * (s.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (pos - lo) * (s[hi] - s[lo]);
}

export interface Quartiles {
  q1: number;
  q2: number;
  q3: number;
  iqr: number;
}

export function quartiles(xs: readonly number[]): Quartiles {
  const q1 = percentileInc(xs, 0.25);
  const q2 = percentileInc(xs, 0.5);
  const q3 = percentileInc(xs, 0.75);
  return { q1, q2, q3, iqr: q3 - q1 };
}

export interface Outliers {
  lowerFence: number;
  upperFence: number;
  values: number[];
  indexes: number[];
}

/** Valores atípicos por el criterio 1.5 × RIC. No elimina nada: solo reporta. */
export function outliers(xs: readonly number[]): Outliers {
  const { q1, q3, iqr } = quartiles(xs);
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const indexes: number[] = [];
  xs.forEach((x, i) => {
    if (x < lowerFence || x > upperFence) indexes.push(i);
  });
  return { lowerFence, upperFence, values: indexes.map((i) => xs[i]), indexes };
}

export interface Descriptive {
  n: number;
  sum: number;
  mean: number;
  median: number;
  mode: ModeResult;
  min: number;
  max: number;
  range: number;
  varianceSample: number;
  variancePopulation: number;
  sdSample: number;
  sdPopulation: number;
  standardError: number;
  cv: number;
  quartiles: Quartiles;
}

export function describe(xs: readonly number[]): Descriptive {
  const n = xs.length;
  if (n === 0) throw new RangeError('describe: sin datos');
  return {
    n,
    sum: sum(xs),
    mean: mean(xs),
    median: median(xs),
    mode: mode(xs),
    min: Math.min(...xs),
    max: Math.max(...xs),
    range: range(xs),
    varianceSample: variance(xs, true),
    variancePopulation: variance(xs, false),
    sdSample: stdDev(xs, true),
    sdPopulation: stdDev(xs, false),
    standardError: n >= 2 ? standardError(xs) : NaN,
    cv: coefficientOfVariation(xs),
    quartiles: quartiles(xs),
  };
}
