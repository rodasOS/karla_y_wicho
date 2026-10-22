/** Escalas lineales y marcas "agradables" (1, 2, 5 × 10ⁿ) para los ejes de las gráficas. */

export interface Domain {
  min: number;
  max: number;
}

function niceNumber(range: number, round: boolean): number {
  const exp = Math.floor(Math.log10(range));
  const f = range / 10 ** exp;
  let nf: number;
  if (round) nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  else nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * 10 ** exp;
}

export interface Ticks extends Domain {
  ticks: number[];
  step: number;
}

/** Marcas agradables que cubren [min, max]. */
export function niceTicks(min: number, max: number, count = 5): Ticks {
  if (!Number.isFinite(min) || !Number.isFinite(max)) throw new RangeError('Dominio no válido');
  if (min === max) {
    const pad = min === 0 ? 1 : Math.abs(min) * 0.1;
    min -= pad;
    max += pad;
  }
  const range = niceNumber(max - min, false);
  const step = niceNumber(range / Math.max(1, count - 1), true);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(decimals)));
  return { min: ticks[0], max: ticks[ticks.length - 1], ticks, step };
}

/** Escala lineal de un dominio a un rango de píxeles. */
export function linearScale(domain: Domain, range: [number, number]): (v: number) => number {
  const span = domain.max - domain.min || 1;
  return (v) => range[0] + ((v - domain.min) / span) * (range[1] - range[0]);
}

/** Texto compacto para una marca de eje. */
export function tickLabel(v: number): string {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e6 || a < 1e-3) return v.toExponential(1).replace('e+', 'e');
  return String(Number(v.toPrecision(6)));
}
