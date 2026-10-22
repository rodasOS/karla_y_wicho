/** Reglas de validación de entradas. Devuelven mensajes en español listos para mostrar junto al campo. */
import { ParsedData, ParsedPairs } from '../parsing/data-parser';
import { Warning, warn } from '../steps/solution';

export interface Validation {
  /** Impiden calcular. */
  errors: Warning[];
  /** No impiden calcular. */
  warnings: Warning[];
  ok: boolean;
}

function result(errors: Warning[], warnings: Warning[] = []): Validation {
  return { errors, warnings, ok: errors.length === 0 };
}

/** Serie simple: vacía, con tokens inválidos o con menos de `min` datos. */
export function validateSeries(p: ParsedData, min = 1, what = 'datos'): Validation {
  if (p.empty) return result([warn('error', 'faltan-datos', `Faltan ${what}: escribe al menos ${min === 1 ? 'un valor' : `${min} valores`} separados por comas, espacios o saltos de línea.`)]);
  if (p.errors.length) {
    return result(
      p.errors.map((e) => warn('error', 'no-numerico', `${e.message} Corrígelo o quítalo (dato n.º ${e.index + 1}).`)),
    );
  }
  if (p.values.length < min) {
    return result([warn('error', 'n-insuficiente', `Se necesitan al menos ${min} ${what} (n ≥ ${min}); ingresaste ${p.values.length}.`)]);
  }
  return result([]);
}

/** Desviación estándar muestral: requiere n ≥ 2 (advertencia, no error). */
export function validateSampleSd(n: number): Validation {
  return n < 2 ? result([], [warn('warning', 'n-insuficiente', 'La desviación estándar muestral requiere n ≥ 2.')]) : result([]);
}

/** Pares (x, y) para correlación (min 2) o regresión (min 3). */
export function validatePairs(p: ParsedPairs, min = 3): Validation {
  const errors: Warning[] = [];
  if (p.x.empty || p.y.empty) {
    errors.push(warn('error', 'faltan-datos', `Faltan datos: completa los valores de ${p.x.empty ? 'x' : ''}${p.x.empty && p.y.empty ? ' y ' : ''}${p.y.empty ? 'y' : ''}.`));
    return result(errors);
  }
  for (const e of p.x.errors) errors.push(warn('error', 'no-numerico', `En x: ${e.message}`));
  for (const e of p.y.errors) errors.push(warn('error', 'no-numerico', `En y: ${e.message}`));
  if (p.lengthMismatch) {
    errors.push(warn('error', 'longitudes', `x tiene ${p.x.tokens.length} valores y y tiene ${p.y.tokens.length}: deben tener la misma cantidad.`));
  }
  if (!errors.length && p.x.values.length < min) {
    errors.push(warn('error', 'n-insuficiente', `Se requieren al menos ${min} pares; ingresaste ${p.x.values.length}.`));
  }
  return result(errors);
}

export function validateSigma(sigma: number | null): Validation {
  if (sigma === null || Number.isNaN(sigma)) return result([warn('error', 'faltan-datos', 'Falta la desviación estándar σ.')]);
  if (!(sigma > 0)) return result([warn('error', 'sigma-invalida', 'σ debe ser positiva (mayor que 0).')]);
  return result([]);
}

export function validateProbability(p: number | null, name = 'La probabilidad'): Validation {
  if (p === null || Number.isNaN(p)) return result([warn('error', 'faltan-datos', `Falta ${name}.`)]);
  if (p < 0 || p > 1) return result([warn('error', 'probabilidad-invalida', `${name} debe estar entre 0 y 1 (ingresaste ${p}).`)]);
  return result([]);
}

export function validateRequiredNumber(v: number | null, name: string): Validation {
  return v === null || Number.isNaN(v) ? result([warn('error', 'faltan-datos', `Falta ${name}.`)]) : result([]);
}

/** Entero ≥ 0 (para combinatoria). */
export function validateCount(v: number | null, name: string): Validation {
  if (v === null || Number.isNaN(v)) return result([warn('error', 'faltan-datos', `Falta ${name}.`)]);
  if (!Number.isInteger(v) || v < 0) return result([warn('error', 'entero-invalido', `${name} debe ser un entero mayor o igual que 0.`)]);
  return result([]);
}

export function merge(...vs: Validation[]): Validation {
  return result(
    vs.flatMap((v) => v.errors),
    vs.flatMap((v) => v.warnings),
  );
}
