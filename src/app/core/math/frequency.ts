/** Tablas de frecuencias para datos agrupados o por valor. */

export interface FrequencyClass {
  /** Límite inferior (incluido). */
  lower: number;
  /** Límite superior (excluido, salvo en la última clase). */
  upper: number;
  midpoint: number;
  f: number;
  /** Frecuencia relativa (fracción). */
  fr: number;
  /** Porcentaje. */
  pct: number;
  /** Frecuencia absoluta acumulada. */
  F: number;
  /** Frecuencia relativa acumulada. */
  Fr: number;
}

export interface FrequencyTable {
  kind: 'intervalos' | 'valores';
  n: number;
  classes: FrequencyClass[];
  /** Número de clases (k). */
  k: number;
  /** Amplitud de clase (solo intervalos). */
  width: number;
  min: number;
  max: number;
  /** true si k fue calculado con la regla de Sturges. */
  sturges: boolean;
}

/** Regla de Sturges: k = 1 + 3.322·log10(n), redondeada al entero superior más cercano. */
export function sturgesClasses(n: number): number {
  if (n < 1) throw new RangeError('n debe ser mayor que 0');
  return Math.max(1, Math.ceil(1 + Math.log2(n)));
}

function finish(
  kind: FrequencyTable['kind'],
  xs: readonly number[],
  edges: { lower: number; upper: number; midpoint: number; f: number }[],
  width: number,
  sturges: boolean,
): FrequencyTable {
  const n = xs.length;
  let acc = 0;
  const classes = edges.map((c) => {
    acc += c.f;
    return { ...c, fr: c.f / n, pct: (100 * c.f) / n, F: acc, Fr: acc / n };
  });
  return { kind, n, classes, k: classes.length, width, min: Math.min(...xs), max: Math.max(...xs), sturges };
}

/** Tabla por intervalos. Si `k` no se da, usa Sturges. */
export function frequencyByIntervals(xs: readonly number[], k?: number): FrequencyTable {
  if (xs.length === 0) throw new RangeError('Se necesitan datos');
  if (k !== undefined && (!Number.isInteger(k) || k < 1 || k > 100)) {
    throw new RangeError('El número de clases debe ser un entero entre 1 y 100');
  }
  const sturges = k === undefined;
  const classesCount = k ?? sturgesClasses(xs.length);
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  if (min === max) {
    return finish('intervalos', xs, [{ lower: min, upper: max, midpoint: min, f: xs.length }], 0, sturges);
  }
  const width = (max - min) / classesCount;
  const counts = new Array<number>(classesCount).fill(0);
  for (const x of xs) {
    // El máximo cae en la última clase (intervalo cerrado a la derecha).
    const idx = Math.min(classesCount - 1, Math.floor((x - min) / width + 1e-12));
    counts[idx]++;
  }
  const edges = counts.map((f, i) => {
    const lower = min + i * width;
    const upper = i === classesCount - 1 ? max : min + (i + 1) * width;
    return { lower, upper, midpoint: (lower + upper) / 2, f };
  });
  return finish('intervalos', xs, edges, width, sturges);
}

/** Tabla por valor (datos discretos con pocos valores distintos). */
export function frequencyByValue(xs: readonly number[]): FrequencyTable {
  if (xs.length === 0) throw new RangeError('Se necesitan datos');
  const counts = new Map<number, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  const edges = [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([v, f]) => ({ lower: v, upper: v, midpoint: v, f }));
  return finish('valores', xs, edges, 0, false);
}

/** Pocos valores distintos: conviene tabla por valor. */
export function suggestsDiscrete(xs: readonly number[], maxDistinct = 5): boolean {
  return new Set(xs).size <= maxDistinct;
}
