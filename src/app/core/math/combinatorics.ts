/** Probabilidad básica y combinatoria. Probabilidades como fracción en [0, 1]. */

export function assertProbability(p: number, name = 'P'): void {
  if (!Number.isFinite(p) || p < 0 || p > 1) throw new RangeError(`${name} debe estar entre 0 y 1`);
}

export function assertNonNegativeInt(n: number, name: string): void {
  if (!Number.isInteger(n) || n < 0) throw new RangeError(`${name} debe ser un entero mayor o igual que 0`);
}

/** n! exacto mientras sea representable (n ≤ 170). */
export function factorial(n: number): number {
  assertNonNegativeInt(n, 'n');
  if (n > 170) throw new RangeError('n es demasiado grande (máximo 170)');
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

/** Permutaciones P(n, k) = n! / (n − k)!, calculada como producto para no desbordar. */
export function permutations(n: number, k: number): number {
  assertNonNegativeInt(n, 'n');
  assertNonNegativeInt(k, 'k');
  if (k > n) throw new RangeError('k no puede ser mayor que n');
  let p = 1;
  for (let i = 0; i < k; i++) p *= n - i;
  return p;
}

/** Combinaciones C(n, k) con producto incremental (resultado entero exacto en el rango seguro). */
export function combinations(n: number, k: number): number {
  assertNonNegativeInt(n, 'n');
  assertNonNegativeInt(k, 'k');
  if (k > n) throw new RangeError('k no puede ser mayor que n');
  const kk = Math.min(k, n - k);
  let c = 1;
  for (let i = 1; i <= kk; i++) c = (c * (n - kk + i)) / i;
  return Math.round(c);
}

/** Clásica: casos favorables / casos posibles. */
export function classicProbability(favorable: number, possible: number): number {
  assertNonNegativeInt(favorable, 'Casos favorables');
  assertNonNegativeInt(possible, 'Casos posibles');
  if (possible === 0) throw new RangeError('Los casos posibles deben ser mayores que 0');
  if (favorable > possible) throw new RangeError('Los casos favorables no pueden superar a los posibles');
  return favorable / possible;
}

export function complement(p: number): number {
  assertProbability(p, 'P(A)');
  return 1 - p;
}

/** P(A∪B) = P(A) + P(B) − P(A∩B). Valida consistencia de la intersección. */
export function union(pA: number, pB: number, pAB: number): number {
  assertProbability(pA, 'P(A)');
  assertProbability(pB, 'P(B)');
  assertProbability(pAB, 'P(A∩B)');
  if (pAB > Math.min(pA, pB) + 1e-12) throw new RangeError('P(A∩B) no puede superar a P(A) ni a P(B)');
  if (pA + pB - pAB > 1 + 1e-12) throw new RangeError('Los datos son inconsistentes: P(A∪B) sería mayor que 1');
  return Math.min(1, pA + pB - pAB);
}

/** Intersección de eventos independientes: P(A)·P(B). */
export function intersectionIndependent(pA: number, pB: number): number {
  assertProbability(pA, 'P(A)');
  assertProbability(pB, 'P(B)');
  return pA * pB;
}

/** P(A|B) = P(A∩B) / P(B). */
export function conditional(pAB: number, pB: number): number {
  assertProbability(pAB, 'P(A∩B)');
  assertProbability(pB, 'P(B)');
  if (pB === 0) throw new RangeError('P(B) debe ser mayor que 0 para condicionar');
  if (pAB > pB + 1e-12) throw new RangeError('P(A∩B) no puede superar a P(B)');
  return Math.min(1, pAB / pB);
}

export interface BayesResult {
  /** P(A|B) = P(B|A)·P(A) / P(B). */
  posterior: number;
  /** P(B) por probabilidad total. */
  pB: number;
}

/** Bayes con dos hipótesis A y ¬A: P(B) = P(B|A)P(A) + P(B|¬A)(1 − P(A)). */
export function bayes(pA: number, pBgivenA: number, pBgivenNotA: number): BayesResult {
  assertProbability(pA, 'P(A)');
  assertProbability(pBgivenA, 'P(B|A)');
  assertProbability(pBgivenNotA, 'P(B|¬A)');
  const pB = pBgivenA * pA + pBgivenNotA * (1 - pA);
  if (pB === 0) throw new RangeError('P(B) resulta 0: el teorema de Bayes no está definido');
  return { posterior: (pBgivenA * pA) / pB, pB };
}
