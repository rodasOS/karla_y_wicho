import { parseNumberToken } from '../parsing/data-parser';
import { Exercise } from './exercises';
import { formatFixed } from '../math/rounding';

export type CheckStatus = 'invalid' | 'correct' | 'incorrect';

export interface CheckResult {
  status: CheckStatus;
  message: string;
  hint?: string;
  /** Solo los intentos válidos cuentan en el marcador. */
  counts: boolean;
}

/** Extrae el número de una respuesta como "2.2", "2,2" o "2.2 A". */
export function parseAnswer(raw: string): number | null {
  const m = raw.trim().match(/^([+-−]?\s*\d+(?:[.,]\d+)?(?:[eE][+-]?\d+)?)\s*[^\d\s.,][^\d]*$|^([+-−]?\s*\d+(?:[.,]\d+)?(?:[eE][+-]?\d+)?)$/);
  const token = m ? (m[1] ?? m[2]).replace(/\s+/g, '') : raw.trim();
  return parseNumberToken(token, true);
}

export function checkAnswer(ex: Exercise, raw: string): CheckResult {
  if (!raw.trim()) return { status: 'invalid', message: 'Escribe tu respuesta (un número).', counts: false };
  const v = parseAnswer(raw);
  if (v === null) return { status: 'invalid', message: `"${raw.trim()}" no es un número. Escribe solo el valor numérico, por ejemplo 2.25.`, counts: false };
  if (Math.abs(v - ex.expected) <= ex.tolerance) {
    return { status: 'correct', message: `¡Correcto! La respuesta es ${formatFixed(ex.expected, ex.decimals)}${ex.unit ? ' ' + ex.unit : ''}.`, counts: true };
  }
  const known = ex.commonErrors.find((e) => Math.abs(v - e.value) <= Math.max(ex.tolerance, Math.abs(e.value) * 0.005));
  return {
    status: 'incorrect',
    message: 'Todavía no coincide.',
    hint: known?.hint ?? (v > ex.expected ? 'Tu valor es mayor que el correcto: revisa la sustitución y las operaciones.' : 'Tu valor es menor que el correcto: revisa la sustitución y las operaciones.'),
    counts: true,
  };
}
