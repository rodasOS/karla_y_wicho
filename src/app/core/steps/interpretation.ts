import { mean, stdDev, variance } from '../math/stats';
import { Solution, Step, exact, show, warn } from './solution';
import { solveDescriptive } from './descriptive';

export interface SdComparisonInput {
  values: number[];
  labels?: string[];
  unit?: string;
  decimals?: number;
}

/** Explicación didáctica de σ frente a s con los datos del usuario. */
export const SD_EXPLANATION: { title: string; text: string }[] = [
  { title: 'Desviación poblacional (σ)', text: 'Se usa cuando tienes TODOS los datos de la población (por ejemplo, las notas de todos los estudiantes de una sección). Divide entre N.' },
  { title: 'Desviación muestral (s)', text: 'Se usa cuando tus datos son una MUESTRA de una población más grande (por ejemplo, 5 mediciones de una corriente que podrías medir muchas veces). Divide entre n − 1.' },
  { title: '¿Por qué n − 1?', text: 'Los datos de una muestra están, en promedio, más cerca de su propia media que de la media real de la población. Dividir entre n subestimaría la dispersión; dividir entre n − 1 (corrección de Bessel) la corrige.' },
  { title: 'Regla práctica', text: 'En experimentos y laboratorio casi siempre se trabaja con muestras: usa s. Con n grande la diferencia es pequeña; con n pequeño es notable.' },
];

export function solveSdComparison(input: SdComparisonInput): Solution {
  const xs = input.values;
  const d = input.decimals ?? 4;
  const unit = input.unit?.trim() || undefined;
  if (xs.length < 2) throw new RangeError('Se necesitan al menos 2 datos para comparar σ y s.');
  const n = xs.length;
  const base = solveDescriptive({ values: xs, labels: input.labels, unit, decimals: d });
  const steps: Step[] = base.steps.filter((s) => /^(Varianza|Desviación)/.test(s.label));
  const sigma = stdDev(xs, false);
  const s = stdDev(xs, true);
  const ratio = s / sigma;
  const factor = Math.sqrt(n / (n - 1));

  steps.push({
    label: 'Relación entre s y σ',
    formulaTex: String.raw`\dfrac{s}{\sigma}=\sqrt{\dfrac{n}{n-1}}`,
    substitutionTex: String.raw`\dfrac{s}{\sigma}=\sqrt{\dfrac{${n}}{${n}-1}}=\sqrt{\dfrac{${n}}{${n - 1}}}`,
    substitutionExpr: `sqrt(${n} / (${n} - 1))`,
    procedure: [`Con los mismos datos, s siempre es mayor que σ por el factor √(n/(n−1)) = ${exact(factor)}.`, `Comprobación: s / σ = ${exact(s)} / ${exact(sigma)} = ${exact(ratio)}.`],
    result: factor,
  });

  const diff = ((s - sigma) / sigma) * 100;
  return {
    title: 'Desviación estándar: poblacional (σ) frente a muestral (s)',
    steps,
    answer: [
      { label: 'Desviación muestral (s) · divide entre n − 1', value: s, unit, primary: true },
      { label: 'Desviación poblacional (σ) · divide entre N', value: sigma, unit, primary: true },
      { label: 'Varianza muestral (s²)', value: variance(xs, true), unit: unit ? `${unit}²` : undefined },
      { label: 'Varianza poblacional (σ²)', value: variance(xs, false), unit: unit ? `${unit}²` : undefined },
      { label: 'Diferencia relativa (s frente a σ)', value: diff, unit: '%' },
    ],
    interpretation: [
      `Con ${n} datos y media ${show(mean(xs), d, unit)}: s = ${show(s, d, unit)} y σ = ${show(sigma, d, unit)}.`,
      `s es ${show(diff, 1)} % mayor que σ. ${n < 10 ? 'La diferencia es notable porque n es pequeño.' : n < 30 ? 'La diferencia es moderada.' : 'La diferencia es pequeña porque n es grande.'}`,
      'Si estos datos son una muestra (lo habitual en mediciones), el valor correcto para describir la dispersión es s. Si son toda la población, usa σ.',
    ],
    warnings: n < 5 ? [warn('info', 'muestra-pequena', `Con n = ${n} la corrección n − 1 tiene un efecto grande.`)] : [],
  };
}
