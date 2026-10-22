/** Distribución normal. TypeScript puro; error absoluto < 1e-12 en la CDF. */

const SQRT_PI = Math.sqrt(Math.PI);
const SQRT2 = Math.SQRT2;

/** erf(x) para |x| <= 3 con serie de términos positivos: (2/√π)·e^(−x²)·Σ 2ⁿx²ⁿ⁺¹/(2n+1)!! */
function erfSeries(x: number): number {
  const x2 = x * x;
  let term = x;
  let total = x;
  for (let n = 1; n < 200; n++) {
    term *= (2 * x2) / (2 * n + 1);
    total += term;
    if (Math.abs(term) < Math.abs(total) * 1e-17) break;
  }
  return (2 / SQRT_PI) * Math.exp(-x2) * total;
}

/** erfc(x) para x >= 3 con fracción continua (evaluada hacia atrás). */
function erfcContinuedFraction(x: number): number {
  let f = x;
  for (let k = 80; k >= 1; k--) f = x + k / 2 / f;
  return Math.exp(-x * x) / (SQRT_PI * f);
}

export function erf(x: number): number {
  if (Number.isNaN(x)) return NaN;
  const a = Math.abs(x);
  const v = a <= 3 ? erfSeries(a) : 1 - erfcContinuedFraction(a);
  return x < 0 ? -v : v;
}

export function erfc(x: number): number {
  if (Number.isNaN(x)) return NaN;
  if (x < 0) return 2 - erfc(-x);
  return x < 3 ? 1 - erfSeries(x) : erfcContinuedFraction(x);
}

/** Densidad de la normal estándar. */
export function pdf(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

/** Φ(z): probabilidad acumulada de la normal estándar. */
export function cdf(z: number): number {
  if (Number.isNaN(z)) return NaN;
  return 0.5 * erfc(-z / SQRT2);
}

/** Estandarización z = (x − μ) / σ. */
export function zScore(x: number, mu: number, sigma: number): number {
  assertSigma(sigma);
  return (x - mu) / sigma;
}

export function assertSigma(sigma: number): void {
  if (!(sigma > 0) || !Number.isFinite(sigma)) throw new RangeError('σ debe ser positiva');
}

/** P(X < x) con X ~ N(μ, σ²). */
export function probLess(x: number, mu: number, sigma: number): number {
  return cdf(zScore(x, mu, sigma));
}

/** P(X > x). Usa la cola superior directa para conservar precisión. */
export function probGreater(x: number, mu: number, sigma: number): number {
  return cdf(-zScore(x, mu, sigma));
}

/** P(a < X < b). Exige a <= b. */
export function probBetween(a: number, b: number, mu: number, sigma: number): number {
  if (a > b) throw new RangeError('a debe ser menor o igual que b');
  const za = zScore(a, mu, sigma);
  const zb = zScore(b, mu, sigma);
  // Si ambos están en la cola derecha, restar colas superiores evita cancelación.
  return za > 0 ? cdf(-za) - cdf(-zb) : cdf(zb) - cdf(za);
}

// Coeficientes de Acklam para la aproximación racional de Φ⁻¹.
const A = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
const B = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
const C = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
const D = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];

/** Φ⁻¹(p): z tal que Φ(z) = p, con 0 < p < 1. Acklam + un paso de Halley. */
export function inverseCdf(p: number): number {
  if (!(p > 0 && p < 1)) {
    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    throw new RangeError('p debe estar en [0, 1]');
  }
  const pLow = 0.02425;
  let x: number;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((C[0] * q + C[1]) * q + C[2]) * q + C[3]) * q + C[4]) * q + C[5]) / ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1);
  } else if (p > 1 - pLow) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((C[0] * q + C[1]) * q + C[2]) * q + C[3]) * q + C[4]) * q + C[5]) / ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1);
  } else {
    const q = p - 0.5;
    const r = q * q;
    x = ((((((A[0] * r + A[1]) * r + A[2]) * r + A[3]) * r + A[4]) * r + A[5]) * q) / (((((B[0] * r + B[1]) * r + B[2]) * r + B[3]) * r + B[4]) * r + 1);
  }
  // Refinamiento de Halley.
  const e = cdf(x) - p;
  const u = (e * Math.sqrt(2 * Math.PI)) * Math.exp((x * x) / 2);
  return x - u / (1 + (x * u) / 2);
}

/** Valor x con P(X < x) = p para X ~ N(μ, σ²). */
export function quantile(p: number, mu: number, sigma: number): number {
  assertSigma(sigma);
  return mu + sigma * inverseCdf(p);
}
