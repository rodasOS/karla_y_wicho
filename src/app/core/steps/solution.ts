/** Modelo común de resultado: fórmula → sustitución → procedimiento → respuesta e interpretación. */
import { formatFixed } from '../math/rounding';

export type WarningLevel = 'info' | 'warning' | 'error';

export interface Warning {
  level: WarningLevel;
  code: string;
  message: string;
}

export interface Step {
  label: string;
  /** Fórmula general en TeX. */
  formulaTex: string;
  /** Fórmula con los valores del usuario en TeX. */
  substitutionTex: string;
  /** Misma sustitución como expresión aritmética evaluable (sqrt(), **), para pruebas y lectores de pantalla. */
  substitutionExpr?: string;
  /** Pasos del procedimiento en español. */
  procedure: string[];
  /** Valor sin redondear (NaN si no está definido). */
  result: number;
  /** Texto a mostrar en lugar del número (p. ej. "no hay moda"). */
  resultText?: string;
  unit?: string;
}

export interface AnswerItem {
  label: string;
  value: number;
  text?: string;
  unit?: string;
  /** Texto breve (p. ej. "muestral"). */
  note?: string;
  /** true para la respuesta principal. */
  primary?: boolean;
}

export interface Solution {
  title: string;
  steps: Step[];
  answer: AnswerItem[];
  interpretation: string[];
  warnings: Warning[];
}

/** Valor para mostrar con decimales y unidad opcional. */
export function show(x: number, decimals: number, unit?: string): string {
  const s = formatFixed(x, decimals);
  return unit ? `${s} ${unit}` : s;
}

/** Número "exacto" para sustituciones: hasta 12 cifras significativas, sin ceros sobrantes. */
export function exact(x: number): string {
  if (Number.isNaN(x)) return 'NaN';
  return String(Number(x.toPrecision(12)));
}

/** Envuelve en paréntesis si el texto empieza con signo menos. */
export function paren(label: string): string {
  return label.startsWith('-') ? `(${label})` : label;
}

/** Lista "a + b + c" en TeX, abreviada con puntos suspensivos si es larga. */
export function sumTex(labels: readonly string[], head = 4, tail = 2): string {
  const p = labels.map(paren);
  if (p.length <= head + tail + 1) return p.join(' + ');
  return `${p.slice(0, head).join(' + ')} + \\ldots + ${p.slice(-tail).join(' + ')}`;
}

export function sumExpr(labels: readonly string[]): string {
  return labels.map(paren).join(' + ');
}

export function warn(level: WarningLevel, code: string, message: string): Warning {
  return { level, code, message };
}

/** Evalúa una `substitutionExpr` (solo números y operadores; sqrt permitido). Usado por las pruebas. */
export function evalExpr(expr: string): number {
  if (!/^[\d\s+\-*/().eE,sqrt^]*$/.test(expr.replace(/sqrt/g, ''))) {
    throw new Error(`Expresión no permitida: ${expr}`);
  }
  // eslint-disable-next-line no-new-func
  return new Function('sqrt', `"use strict"; return (${expr});`)(Math.sqrt);
}
