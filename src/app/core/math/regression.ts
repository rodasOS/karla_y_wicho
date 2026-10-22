/** Correlación de Pearson y regresión lineal simple. */
import { mean, sum } from './stats';

export interface Sums {
  n: number;
  meanX: number;
  meanY: number;
  sxx: number;
  syy: number;
  sxy: number;
}

export interface Regression extends Sums {
  /** Pendiente b = Sxy / Sxx. */
  slope: number;
  /** Intercepto a = ȳ − b·x̄. */
  intercept: number;
  /** Coeficiente de correlación; NaN si x o y son constantes. */
  r: number;
  /** Coeficiente de determinación (r²). */
  r2: number;
  xMin: number;
  xMax: number;
}

export function assertPairs(xs: readonly number[], ys: readonly number[], min = 2): void {
  if (xs.length !== ys.length) throw new RangeError('x e y deben tener la misma cantidad de datos');
  if (xs.length < min) throw new RangeError(`se requieren al menos ${min} pares`);
}

/** Sumas centradas Sxx, Syy, Sxy (sobre desviaciones, estable numéricamente). */
export function centeredSums(xs: readonly number[], ys: readonly number[]): Sums {
  assertPairs(xs, ys, 1);
  const mx = mean(xs);
  const my = mean(ys);
  return {
    n: xs.length,
    meanX: mx,
    meanY: my,
    sxx: sum(xs.map((x) => (x - mx) ** 2)),
    syy: sum(ys.map((y) => (y - my) ** 2)),
    sxy: sum(xs.map((x, i) => (x - mx) * (ys[i] - my))),
  };
}

export function pearson(xs: readonly number[], ys: readonly number[]): number {
  const s = centeredSums(xs, ys);
  if (s.sxx === 0 || s.syy === 0) return NaN;
  // Acota por redondeo: r siempre en [−1, 1].
  return Math.max(-1, Math.min(1, s.sxy / Math.sqrt(s.sxx * s.syy)));
}

/** Regresión lineal simple ŷ = a + b·x. Requiere al menos 3 pares (regla del asistente). */
export function linearRegression(xs: readonly number[], ys: readonly number[]): Regression {
  assertPairs(xs, ys, 3);
  const s = centeredSums(xs, ys);
  if (s.sxx === 0) throw new RangeError('x es constante: la pendiente no está definida');
  const slope = s.sxy / s.sxx;
  const intercept = s.meanY - slope * s.meanX;
  const r = s.syy === 0 ? NaN : Math.max(-1, Math.min(1, s.sxy / Math.sqrt(s.sxx * s.syy)));
  // Si y es constante el ajuste es exacto (R² = 1 por convención de SCR = 0).
  const r2 = s.syy === 0 ? 1 : r * r;
  return { ...s, slope, intercept, r, r2, xMin: Math.min(...xs), xMax: Math.max(...xs) };
}

export interface Prediction {
  yHat: number;
  extrapolated: boolean;
}

export function predict(reg: Regression, x: number): Prediction {
  return { yHat: reg.intercept + reg.slope * x, extrapolated: x < reg.xMin || x > reg.xMax };
}

export type CorrelationStrength = 'nula' | 'muy débil' | 'débil' | 'moderada' | 'fuerte' | 'muy fuerte' | 'perfecta';

/** Clasifica |r| para la interpretación. */
export function classifyCorrelation(r: number): CorrelationStrength {
  const a = Math.abs(r);
  if (a >= 1 - 1e-12) return 'perfecta';
  if (a >= 0.9) return 'muy fuerte';
  if (a >= 0.7) return 'fuerte';
  if (a >= 0.4) return 'moderada';
  if (a >= 0.2) return 'débil';
  if (a > 0.05) return 'muy débil';
  return 'nula';
}
