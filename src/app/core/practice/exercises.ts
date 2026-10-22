/** Generador de prácticas. La respuesta esperada sale siempre del motor de cálculo. */
import { cdf } from '../math/normal';
import { combinations } from '../math/combinatorics';
import { solveDescriptive } from '../steps/descriptive';
import { solveExperimental } from '../steps/experimental';
import { solveRegression } from '../steps/regression';
import { solveClassic, solveNormal, solvePercentile } from '../steps/probability';
import { Solution, exact } from '../steps/solution';
import { Rng, createRng, pick, randFixed, randInt } from './rng';
import { mean, stdDev, variance } from '../math/stats';

export type PracticeModule = 'descriptive' | 'experimental' | 'probability' | 'regression';
export type Level = 'basico' | 'intermedio';

export const PRACTICE_MODULES: { id: PracticeModule; label: string }[] = [
  { id: 'descriptive', label: 'Estadística descriptiva' },
  { id: 'experimental', label: 'Datos experimentales' },
  { id: 'probability', label: 'Probabilidad y normal' },
  { id: 'regression', label: 'Correlación y regresión' },
];

export interface CommonError {
  value: number;
  hint: string;
}

export interface Exercise {
  id: string;
  module: PracticeModule;
  level: Level;
  title: string;
  /** Contexto y datos. */
  statement: string;
  /** Qué debe calcular el estudiante. */
  question: string;
  unit?: string;
  /** Decimales a pedir en la respuesta. */
  decimals: number;
  expected: number;
  /** Tolerancia absoluta aceptada. */
  tolerance: number;
  solution: Solution;
  commonErrors: CommonError[];
}

export function toleranceFor(expected: number, decimals: number): number {
  return Math.max(0.5 * 10 ** -decimals, Math.abs(expected) * 0.005);
}

function answer(sol: Solution, startsWith: string): number {
  const a = sol.answer.find((x) => x.label.startsWith(startsWith));
  if (!a) throw new Error(`Respuesta no encontrada: ${startsWith}`);
  return a.value;
}

function series(rng: Rng, n: number, base: number, spread: number, decimals: number): number[] {
  return Array.from({ length: n }, () => randFixed(rng, base - spread, base + spread, decimals));
}

const list = (xs: number[]) => xs.map(exact).join(', ');

function make(rng: Rng, p: Omit<Exercise, 'id' | 'tolerance'>, id: string): Exercise {
  return { ...p, id, tolerance: toleranceFor(p.expected, p.decimals) };
}

function descriptive(rng: Rng, level: Level, id: string): Exercise {
  const contexts = [
    { what: 'las notas de un examen', unit: undefined as string | undefined, base: 70, spread: 25, dec: 0, n: [6, 9] },
    { what: 'las edades (años) de un grupo de estudiantes', unit: 'años', base: 21, spread: 4, dec: 0, n: [6, 9] },
    { what: 'el tiempo (s) que tarda un circuito en responder', unit: 's', base: 3.2, spread: 0.8, dec: 1, n: [5, 8] },
  ];
  const c = pick(rng, contexts);
  const n = randInt(rng, c.n[0], c.n[1]);
  const xs = series(rng, n, c.base, c.spread, c.dec);
  const kind = level === 'basico' ? pick(rng, ['media', 'mediana', 'rango']) : pick(rng, ['sd', 'var', 'sigma']);
  const sol = solveDescriptive({ values: xs, unit: c.unit, decimals: 3 });
  const s = stdDev(xs, true);
  const sigma = stdDev(xs, false);
  const base = { module: 'descriptive' as const, level, unit: c.unit, decimals: 2, solution: sol };
  const statement = `Se registraron ${c.what}: ${list(xs)}.`;
  switch (kind) {
    case 'media':
      return make(rng, { ...base, title: 'Media', statement, question: 'Calcula la media.', expected: answer(sol, 'Media'), commonErrors: [{ value: answer(sol, 'Mediana'), hint: 'Ese valor es la mediana, no la media: suma todos los datos y divide entre n.' }] }, id);
    case 'mediana':
      return make(rng, { ...base, title: 'Mediana', statement, question: 'Calcula la mediana.', expected: answer(sol, 'Mediana'), commonErrors: [{ value: answer(sol, 'Media'), hint: 'Ese valor es la media. Para la mediana ordena los datos y toma el valor central (o promedia los dos centrales).' }] }, id);
    case 'rango':
      return make(rng, { ...base, title: 'Rango', statement, question: 'Calcula el rango.', expected: answer(sol, 'Rango'), commonErrors: [{ value: Math.max(...xs), hint: 'Ese es el máximo. El rango es máximo − mínimo.' }] }, id);
    case 'sd':
      return make(rng, { ...base, title: 'Desviación estándar muestral', statement: `${statement} Considera estos datos como una muestra.`, question: 'Calcula la desviación estándar muestral (s).', expected: s, commonErrors: [{ value: sigma, hint: 'Parece que dividiste entre n en lugar de n − 1: esa es la desviación poblacional.' }, { value: variance(xs, true), hint: 'Ese valor es la varianza (s²). Falta sacar la raíz cuadrada.' }] }, id);
    case 'var':
      return make(rng, { ...base, title: 'Varianza muestral', statement: `${statement} Considera estos datos como una muestra.`, question: 'Calcula la varianza muestral (s²).', unit: c.unit ? `${c.unit}²` : undefined, expected: variance(xs, true), commonErrors: [{ value: s, hint: 'Ese valor es la desviación estándar (s). La varianza es s².' }, { value: variance(xs, false), hint: 'Parece que dividiste entre n en lugar de n − 1.' }] }, id);
    default:
      return make(rng, { ...base, title: 'Desviación estándar poblacional', statement: `${statement} Estos datos son TODA la población.`, question: 'Calcula la desviación estándar poblacional (σ).', expected: sigma, commonErrors: [{ value: s, hint: 'Parece que dividiste entre n − 1: esa es la muestral. Con la población completa se divide entre N.' }] }, id);
  }
}

function experimental(rng: Rng, level: Level, id: string): Exercise {
  const contexts = [
    { unit: 'A', what: 'la corriente (A) de un circuito', base: 2.2, spread: 0.3, dec: 2 },
    { unit: 'V', what: 'el voltaje (V) de una batería', base: 12, spread: 0.4, dec: 2 },
    { unit: 'cm', what: 'la longitud (cm) de una varilla', base: 25, spread: 0.6, dec: 1 },
  ];
  const c = pick(rng, contexts);
  const n = randInt(rng, 5, 8);
  const xs = series(rng, n, c.base, c.spread, c.dec);
  const sol = solveExperimental({ values: xs, unit: c.unit, decimals: 4 });
  const statement = `Se midió ${c.what} ${n} veces: ${list(xs)} ${c.unit}.`;
  const s = stdDev(xs, true);
  if (level === 'basico') {
    return make(rng, { module: 'experimental', level, title: 'Valor medio de las mediciones', statement, question: `Calcula el valor medio en ${c.unit}.`, unit: c.unit, decimals: 3, expected: mean(xs), solution: sol, commonErrors: [] }, id);
  }
  const se = s / Math.sqrt(n);
  return make(rng, { module: 'experimental', level, title: 'Error estándar de la media', statement, question: `Calcula el error estándar de la media (s/√n) en ${c.unit}.`, unit: c.unit, decimals: 4, expected: se, solution: sol, commonErrors: [{ value: s, hint: 'Ese valor es la desviación estándar s. Falta dividir entre √n.' }, { value: s / n, hint: 'Se divide entre √n, no entre n.' }] }, id);
}

function probability(rng: Rng, level: Level, id: string): Exercise {
  const mu = pick(rng, [50, 60, 100, 120]);
  const sigma = pick(rng, [5, 10, 15]);
  if (level === 'basico') {
    if (rng() < 0.3) {
      const n = randInt(rng, 5, 10);
      const k = randInt(rng, 2, Math.min(4, n - 1));
      const sol = solveClassic({ kind: 'combinaciones', n, k });
      return make(rng, { module: 'probability', level, title: 'Combinaciones', statement: `Se eligen ${k} elementos de un grupo de ${n}, sin importar el orden.`, question: `¿De cuántas formas se puede hacer? Calcula C(${n}, ${k}).`, decimals: 0, expected: combinations(n, k), solution: sol, commonErrors: [{ value: answer(solveClassic({ kind: 'permutaciones', n, k }), 'P('), hint: 'Ese valor es una permutación (importa el orden). Aquí el orden no importa: divide también entre k!.' }] }, id);
    }
    const z = pick(rng, [-1, -0.5, 0.5, 1, 1.5, 2]);
    const x = mu + z * sigma;
    const sol = solveNormal({ type: 'menor', mu, sigma, a: x, decimals: 4 });
    const p = cdf(z);
    return make(rng, { module: 'probability', level, title: 'Probabilidad acumulada normal', statement: `X sigue una distribución normal con μ = ${mu} y σ = ${sigma}.`, question: `Calcula P(X < ${exact(x)}) con 4 decimales.`, decimals: 4, expected: p, solution: sol, commonErrors: [{ value: 1 - p, hint: 'Calculaste la cola contraria, P(X > x). Aquí se pide P(X < x).' }, { value: z, hint: 'Ese valor es z. Falta convertirlo en probabilidad con la tabla (Φ(z)).' }] }, id);
  }
  const pickKind = pick(rng, ['entre', 'percentil', 'mayor'] as const);
  if (pickKind === 'entre') {
    const za = pick(rng, [-2, -1, -0.5]);
    const zb = pick(rng, [0.5, 1, 2]);
    const a = mu + za * sigma;
    const b = mu + zb * sigma;
    const sol = solveNormal({ type: 'entre', mu, sigma, a, b, decimals: 4 });
    return make(rng, { module: 'probability', level, title: 'Probabilidad en un intervalo', statement: `X ~ N(μ = ${mu}, σ = ${sigma}).`, question: `Calcula P(${exact(a)} < X < ${exact(b)}) con 4 decimales.`, decimals: 4, expected: cdf(zb) - cdf(za), solution: sol, commonErrors: [{ value: cdf(zb), hint: 'Solo calculaste Φ(z de b). Hay que restar Φ(z de a).' }] }, id);
  }
  if (pickKind === 'percentil') {
    const pc = pick(rng, [90, 95, 97.5, 75]);
    const sol = solvePercentile({ percentile: pc, mu, sigma, decimals: 4 });
    return make(rng, { module: 'probability', level, title: 'Percentil de la normal', statement: `X ~ N(μ = ${mu}, σ = ${sigma}).`, question: `Encuentra el valor x del percentil ${pc} (2 decimales).`, decimals: 2, expected: answer(sol, 'Percentil'), solution: sol, commonErrors: [{ value: answer(sol, 'z'), hint: 'Ese valor es z. Falta des-estandarizar: x = μ + z·σ.' }] }, id);
  }
  const z = pick(rng, [-1, 0.5, 1, 1.5]);
  const x = mu + z * sigma;
  const sol = solveNormal({ type: 'mayor', mu, sigma, a: x, decimals: 4 });
  return make(rng, { module: 'probability', level, title: 'Cola derecha de la normal', statement: `X ~ N(μ = ${mu}, σ = ${sigma}).`, question: `Calcula P(X > ${exact(x)}) con 4 decimales.`, decimals: 4, expected: 1 - cdf(z), solution: sol, commonErrors: [{ value: cdf(z), hint: 'Calculaste P(X < x). Para P(X > x) toma el complemento: 1 − Φ(z).' }] }, id);
}

function regression(rng: Rng, level: Level, id: string): Exercise {
  const n = randInt(rng, 5, 7);
  const slope = randFixed(rng, 0.8, 3.2, 1);
  const icpt = randFixed(rng, 0, 5, 1);
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const y = x.map((v) => Math.round((icpt + slope * v + (rng() - 0.5) * 2.4) * 10) / 10);
  const sol = solveRegression({ x, y, decimals: 4 });
  const statement = `Se midieron los pares (x, y). x: ${list(x)}. y: ${list(y)}.`;
  const b = answer(sol, 'Pendiente');
  const a = answer(sol, 'Intercepto');
  const r = answer(sol, 'Correlación');
  if (level === 'basico') {
    return make(rng, { module: 'regression', level, title: 'Pendiente de la recta', statement, question: 'Calcula la pendiente b de la recta de regresión ŷ = a + bx.', decimals: 3, expected: b, solution: sol, commonErrors: [{ value: r, hint: 'Ese valor es el coeficiente de correlación r. La pendiente es b = Sxy / Sxx.' }, { value: a, hint: 'Ese valor es el intercepto a. La pendiente es b = Sxy / Sxx.' }] }, id);
  }
  return make(rng, { module: 'regression', level, title: 'Coeficiente de correlación', statement, question: 'Calcula el coeficiente de correlación r de Pearson (3 decimales).', decimals: 3, expected: r, solution: sol, commonErrors: [{ value: r * r, hint: 'Ese valor es R² = r². Falta sacar la raíz cuadrada (con el signo de la pendiente).' }, { value: b, hint: 'Ese valor es la pendiente b, no la correlación r.' }] }, id);
}

/** Genera un ejercicio nuevo; la misma semilla produce el mismo ejercicio. */
export function generateExercise(module: PracticeModule, level: Level, seed: number): Exercise {
  const rng = createRng(seed);
  const id = `${module}-${level}-${seed}`;
  switch (module) {
    case 'descriptive':
      return descriptive(rng, level, id);
    case 'experimental':
      return experimental(rng, level, id);
    case 'probability':
      return probability(rng, level, id);
    case 'regression':
      return regression(rng, level, id);
  }
}
