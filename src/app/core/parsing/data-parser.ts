/** Lectura tolerante de datos numéricos escritos por el usuario. */

export interface ParsedToken {
  /** Texto original del dato, tal como lo escribió el usuario (sin separadores). */
  text: string;
  /** Valor numérico, o null si no se pudo leer. */
  value: number | null;
  /** Posición del dato dentro de la lista (desde 0). */
  index: number;
}

export interface ParseError {
  token: string;
  index: number;
  message: string;
}

export interface ParsedData {
  values: number[];
  /** Texto original de cada valor válido, en el mismo orden que `values`. */
  labels: string[];
  tokens: ParsedToken[];
  errors: ParseError[];
  /** true si la coma se interpretó como separador decimal. */
  decimalComma: boolean;
  empty: boolean;
}

const NUMBER_RE = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;

/**
 * Decide si la coma es decimal. Es decimal cuando no hay ", " (coma seguida de espacio)
 * y los datos se separan por `;`, saltos de línea o espacios (p. ej. "2,1; 2,3" o "2,1 2,3").
 * Con "1, 2, 3" o "1,2,3" la coma separa datos.
 */
export function detectDecimalComma(text: string): boolean {
  const t = text.trim();
  if (!/\d,\d/.test(t)) return false;
  if (/,\s/.test(t) || /,$/m.test(t)) return false;
  if (!/[;\s]/.test(t)) return false;
  const tokens = t.split(/[\s;]+/).filter(Boolean);
  // Una lista como "1,2,3,4" (varias comas en un mismo token) separa datos, no decimales.
  if (tokens.some((tok) => /\d,\d+,\d/.test(tok))) return false;
  return tokens.some((tok) => /^[+-]?\d+,\d+$/.test(tok));
}

function normalizeMinus(s: string): string {
  return s.replace(/[−‒–]/g, '-');
}

export function parseNumberToken(raw: string, decimalComma: boolean): number | null {
  let s = normalizeMinus(raw.trim());
  if (decimalComma) s = s.replace(',', '.');
  if (!NUMBER_RE.test(s)) return null;
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}

/** Lee una lista de datos con separadores flexibles. */
export function parseData(input: string): ParsedData {
  const text = normalizeMinus(input ?? '');
  const decimalComma = detectDecimalComma(text);
  const separators = decimalComma ? /[\s;]+/ : /[\s;,]+/;
  const rawTokens = text.split(separators).filter((t) => t.length > 0);

  const tokens: ParsedToken[] = [];
  const errors: ParseError[] = [];
  const values: number[] = [];
  const labels: string[] = [];

  rawTokens.forEach((raw, index) => {
    const value = parseNumberToken(raw, decimalComma);
    tokens.push({ text: raw, value, index });
    if (value === null) {
      errors.push({ token: raw, index, message: `"${raw}" no es un número válido.` });
    } else {
      values.push(value);
      labels.push(decimalComma ? raw.replace(',', '.') : raw);
    }
  });

  return { values, labels, tokens, errors, decimalComma, empty: rawTokens.length === 0 };
}

export interface ParsedPairs {
  x: ParsedData;
  y: ParsedData;
  /** Pares completos y válidos (misma longitud y sin errores). */
  valid: boolean;
  lengthMismatch: boolean;
}

export function parsePairs(xText: string, yText: string): ParsedPairs {
  const x = parseData(xText);
  const y = parseData(yText);
  const lengthMismatch = !x.empty && !y.empty && x.tokens.length !== y.tokens.length;
  const valid = !x.empty && !y.empty && !lengthMismatch && x.errors.length === 0 && y.errors.length === 0;
  return { x, y, valid, lengthMismatch };
}

/**
 * Extrae todos los números de un texto libre (para la barra de pregunta).
 * Conservador: la coma solo es decimal si el texto no usa punto decimal ni ", ".
 */
export function extractNumbers(text: string): number[] {
  const t = normalizeMinus(text);
  const decimalComma = !/\d\.\d/.test(t) && detectDecimalComma(t);
  const re = decimalComma ? /(?<![\w.])[+-]?\d+(?:,\d+)?(?:[eE][+-]?\d+)?/g : /(?<![\w.])[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?/g;
  const found = t.match(re) ?? [];
  return found.map((s) => Number(decimalComma ? s.replace(',', '.') : s)).filter((v) => Number.isFinite(v));
}
