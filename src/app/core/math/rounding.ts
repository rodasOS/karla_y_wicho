/** Redondeo y cifras significativas. Solo para mostrar: los cálculos no usan estas funciones. */

/** Redondeo "half away from zero" robusto frente a 1.005 → 1.00 por binario. */
export function roundTo(x: number, decimals: number): number {
  if (!Number.isFinite(x)) return x;
  const f = 10 ** decimals;
  const scaled = Math.abs(x) * f;
  // Corrige errores de representación del tipo 1.005 * 100 = 100.49999999999999.
  const r = Math.round(Number((scaled * (1 + Number.EPSILON * 4)).toPrecision(15)));
  return (Math.sign(x) * r) / f;
}

/** Formatea con decimales fijos y coma/punto; evita "-0.00". */
export function formatFixed(x: number, decimals: number): string {
  if (Number.isNaN(x)) return '—';
  if (!Number.isFinite(x)) return x > 0 ? '∞' : '−∞';
  const r = roundTo(x, decimals);
  const s = (Object.is(r, -0) ? 0 : r).toFixed(decimals);
  return s;
}

/** Redondea a n cifras significativas (n ≥ 1). */
export function roundSignificant(x: number, sig: number): number {
  if (x === 0 || !Number.isFinite(x)) return x;
  const digits = sig - 1 - Math.floor(Math.log10(Math.abs(x)));
  return roundTo(x, digits);
}

/** Decimales necesarios para mostrar n cifras significativas de x. */
export function decimalsForSignificant(x: number, sig: number): number {
  if (x === 0 || !Number.isFinite(x)) return 0;
  const r = roundSignificant(x, sig);
  const digits = sig - 1 - Math.floor(Math.log10(Math.abs(r)));
  return Math.max(0, digits);
}

export interface MeasurementReport {
  value: string;
  uncertainty: string;
  decimals: number;
  /** Cifras significativas de la incertidumbre (1 o 2). */
  uncertaintySigFigs: 1 | 2;
}

/**
 * Convención de reporte: incertidumbre con 1 cifra significativa (2 si la primera cifra es 1)
 * y valor central con los mismos decimales.
 */
export function reportMeasurement(value: number, uncertainty: number): MeasurementReport {
  if (!(uncertainty > 0) || !Number.isFinite(uncertainty)) {
    // Sin incertidumbre útil: se muestra el valor con 4 cifras significativas.
    const decimals = decimalsForSignificant(value, 4);
    return { value: formatFixed(value, decimals), uncertainty: '0', decimals, uncertaintySigFigs: 1 };
  }
  const firstDigit = Number(Math.abs(uncertainty).toExponential().charAt(0));
  const sig: 1 | 2 = firstDigit === 1 ? 2 : 1;
  const decimals = decimalsForSignificant(uncertainty, sig);
  return {
    value: formatFixed(value, decimals),
    uncertainty: formatFixed(uncertainty, decimals),
    decimals,
    uncertaintySigFigs: sig,
  };
}
