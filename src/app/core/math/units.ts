/** Unidades del SI con prefijos y conversión entre unidades de la misma magnitud. */

export type Dimension = 'corriente' | 'voltaje' | 'resistencia' | 'longitud' | 'tiempo' | 'masa' | 'fuerza' | 'potencia' | 'energía' | 'frecuencia' | 'presión' | 'temperatura';

interface BaseUnit {
  symbol: string;
  dimension: Dimension;
  aliases?: string[];
  /** Si es false la unidad no admite prefijos (p. ej. °C). */
  prefixes: boolean;
}

const BASES: BaseUnit[] = [
  { symbol: 'A', dimension: 'corriente', prefixes: true },
  { symbol: 'V', dimension: 'voltaje', prefixes: true },
  { symbol: 'Ω', dimension: 'resistencia', aliases: ['ohm', 'ohmio', 'ohmios'], prefixes: true },
  { symbol: 'm', dimension: 'longitud', prefixes: true },
  { symbol: 's', dimension: 'tiempo', prefixes: true },
  { symbol: 'g', dimension: 'masa', prefixes: true },
  { symbol: 'N', dimension: 'fuerza', prefixes: true },
  { symbol: 'W', dimension: 'potencia', prefixes: true },
  { symbol: 'J', dimension: 'energía', prefixes: true },
  { symbol: 'Hz', dimension: 'frecuencia', prefixes: true },
  { symbol: 'Pa', dimension: 'presión', prefixes: true },
  { symbol: '°C', dimension: 'temperatura', aliases: ['C', 'grados'], prefixes: false },
];

const PREFIXES: { symbol: string; factor: number; aliases?: string[] }[] = [
  { symbol: 'n', factor: 1e-9 },
  { symbol: 'µ', factor: 1e-6, aliases: ['u', 'μ'] },
  { symbol: 'm', factor: 1e-3 },
  { symbol: 'c', factor: 1e-2 },
  { symbol: 'k', factor: 1e3 },
  { symbol: 'M', factor: 1e6 },
  { symbol: 'G', factor: 1e9 },
];

export interface ParsedUnit {
  /** Símbolo normalizado (p. ej. "mA"). */
  symbol: string;
  dimension: Dimension;
  /** Factor para llevar la unidad a su base (A, V, m, s, g…). */
  toBase: number;
  base: string;
}

/** Interpreta un símbolo de unidad; devuelve null si no se reconoce. */
export function parseUnit(raw: string): ParsedUnit | null {
  const text = raw.trim();
  if (!text) return null;
  // 1) Coincidencia exacta con una base (evita leer "m" como prefijo, "Pa" como P+a...).
  for (const b of BASES) {
    if (text === b.symbol || b.aliases?.includes(text)) {
      return { symbol: b.symbol, dimension: b.dimension, toBase: 1, base: b.symbol };
    }
  }
  // 2) Prefijo + base. Las bases se comparan sin distinguir el alias de ohm.
  for (const b of BASES.filter((x) => x.prefixes)) {
    const names = [b.symbol, ...(b.aliases ?? [])];
    for (const p of PREFIXES) {
      for (const ps of [p.symbol, ...(p.aliases ?? [])]) {
        for (const name of names) {
          if (text === ps + name) {
            return { symbol: p.symbol + b.symbol, dimension: b.dimension, toBase: p.factor, base: b.symbol };
          }
        }
      }
    }
  }
  return null;
}

export type ConversionResult =
  | { ok: true; factor: number; from: ParsedUnit; to: ParsedUnit }
  | { ok: false; reason: 'desconocida' | 'incompatible'; message: string };

/** Factor multiplicativo para pasar de `from` a `to`. Rechaza magnitudes distintas. */
export function conversionFactor(from: string, to: string): ConversionResult {
  const a = parseUnit(from);
  const b = parseUnit(to);
  if (!a) return { ok: false, reason: 'desconocida', message: `No reconozco la unidad "${from}".` };
  if (!b) return { ok: false, reason: 'desconocida', message: `No reconozco la unidad "${to}".` };
  if (a.dimension !== b.dimension) {
    return {
      ok: false,
      reason: 'incompatible',
      message: `No se puede convertir de ${a.symbol} (${a.dimension}) a ${b.symbol} (${b.dimension}): son magnitudes distintas.`,
    };
  }
  return { ok: true, factor: a.toBase / b.toBase, from: a, to: b };
}

/** Unidades sugeridas en la interfaz. */
export const COMMON_UNITS: string[] = ['A', 'mA', 'V', 'mV', 'Ω', 'kΩ', 'm', 'cm', 'mm', 's', 'ms', 'kg', 'g', 'N', 'W', 'J', 'Hz', 'Pa', '°C'];

/** Unidades compatibles con la dada (misma magnitud) para ofrecer conversiones. */
export function compatibleUnits(unit: string): string[] {
  const u = parseUnit(unit);
  if (!u) return [];
  return COMMON_UNITS.filter((c) => c !== unit && parseUnit(c)?.dimension === u.dimension);
}
