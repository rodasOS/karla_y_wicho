import { reportMeasurement } from '../math/rounding';
import { conversionFactor, parseUnit } from '../math/units';
import { mean, standardError, stdDev } from '../math/stats';
import { solveDescriptive } from './descriptive';
import { AnswerItem, Solution, Step, exact, show, warn } from './solution';

const SYMBOLS: Record<string, string> = {
  corriente: 'I',
  voltaje: 'V',
  resistencia: 'R',
  longitud: 'L',
  tiempo: 't',
  masa: 'm',
  fuerza: 'F',
  potencia: 'P',
  energía: 'E',
  frecuencia: 'f',
  presión: 'p',
  temperatura: 'T',
};

export interface ExperimentalInput {
  values: number[];
  labels?: string[];
  unit?: string;
  /** Unidad a la que convertir la serie (misma magnitud). */
  convertTo?: string;
  decimals?: number;
}

/** Símbolo de la magnitud según la unidad (I para A, V para V…); "x" si no se conoce. */
export function quantitySymbol(unit?: string): string {
  const u = unit ? parseUnit(unit) : null;
  return (u && SYMBOLS[u.dimension]) || 'x';
}

export function solveExperimental(input: ExperimentalInput): Solution {
  const xs = input.values;
  const unit = input.unit?.trim() || undefined;
  const d = input.decimals ?? 4;
  if (xs.length < 2) throw new RangeError('Se necesitan al menos 2 mediciones para estimar la incertidumbre.');

  // Base descriptiva (media, s, atípicos…) y solo los pasos propios de una serie de mediciones.
  const base = solveDescriptive({ values: xs, labels: input.labels, unit, decimals: d, kind: 'muestra' });
  const keep = new Set(['Media', 'Desviación estándar muestral', 'Rango']);
  const steps: Step[] = base.steps.filter((s) => keep.has(s.label));
  const warnings = [...base.warnings.filter((w) => w.code !== 'sin-moda')];

  const n = xs.length;
  const m = mean(xs);
  const s = stdDev(xs, true);
  const se = standardError(xs);
  const sym = quantitySymbol(unit);
  const rep = reportMeasurement(m, se);
  const reportText = `${sym} = ${rep.value} ± ${rep.uncertainty}${unit ? ' ' + unit : ''}`;

  steps.push({
    label: 'Error estándar de la media',
    formulaTex: String.raw`s_{\bar{x}}=\dfrac{s}{\sqrt{n}}`,
    substitutionTex: String.raw`s_{\bar{x}}=\dfrac{${exact(s)}}{\sqrt{${n}}}`,
    substitutionExpr: `${exact(s)} / sqrt(${n})`,
    procedure: [`Desviación estándar muestral s = ${exact(s)}.`, `Se divide entre √n = √${n}.`, 'Mide qué tanto puede variar la media si se repite la serie de mediciones.'],
    result: se,
    unit,
  });

  steps.push({
    label: 'Resultado de la medición',
    formulaTex: String.raw`${sym}=\bar{x}\pm s_{\bar{x}}`,
    substitutionTex: String.raw`${sym}=${exact(m)}\pm ${exact(se)}\ \Rightarrow\ ${rep.value}\pm ${rep.uncertainty}`,
    procedure: [
      `Incertidumbre con ${rep.uncertaintySigFigs} cifra${rep.uncertaintySigFigs === 1 ? '' : 's'} significativa${rep.uncertaintySigFigs === 1 ? '' : 's'} (${rep.uncertaintySigFigs === 2 ? 'la primera cifra es 1' : 'convención habitual'}).`,
      `El valor central se redondea al mismo decimal que la incertidumbre (${rep.decimals} decimal${rep.decimals === 1 ? '' : 'es'}).`,
    ],
    result: m,
    resultText: reportText,
    unit,
  });

  const answer: AnswerItem[] = [
    { label: 'Resultado de la medición', value: m, text: reportText, primary: true },
    { label: 'Media (x̄)', value: m, unit },
    { label: 'Desviación estándar muestral (s)', value: s, unit },
    { label: 'Error estándar (s/√n)', value: se, unit },
  ];

  // Conversión de unidades opcional
  const target = input.convertTo?.trim();
  if (target && unit) {
    const conv = conversionFactor(unit, target);
    if (!conv.ok) {
      warnings.push(warn('error', 'conversion', conv.message));
    } else {
      const f = conv.factor;
      const labels = input.labels && input.labels.length === n ? input.labels : xs.map(exact);
      steps.push({
        label: `Conversión de ${unit} a ${target}`,
        formulaTex: String.raw`x_{\text{${target}}}=x_{\text{${unit}}}\cdot f`,
        substitutionTex: String.raw`f=\dfrac{${exact(conv.from.toBase)}}{${exact(conv.to.toBase)}}=${exact(f)}`,
        substitutionExpr: `${exact(conv.from.toBase)} / ${exact(conv.to.toBase)}`,
        procedure: [
          `Factor de conversión f = ${exact(f)} (${unit} → ${target}).`,
          ...xs.slice(0, 10).map((x, i) => `${labels[i]} ${unit} × ${exact(f)} = ${exact(x * f)} ${target}`),
          ...(n > 10 ? [`… (${n - 10} más)`] : []),
          'La media y las desviaciones se multiplican por el mismo factor.',
        ],
        result: f,
      });
      answer.push({ label: `Media en ${target}`, value: m * f, unit: target });
      answer.push({ label: `s en ${target}`, value: s * f, unit: target });
      answer.push({ label: `Incertidumbre en ${target}`, value: se * f, unit: target });
    }
  } else if (target && !unit) {
    warnings.push(warn('warning', 'sin-unidad', 'Para convertir primero indica la unidad de la serie.'));
  }

  if (!unit) warnings.push(warn('info', 'sin-unidad', 'No elegiste unidad: los resultados se muestran sin unidad.'));
  else if (!parseUnit(unit)) warnings.push(warn('info', 'unidad-desconocida', `No reconozco la unidad "${unit}": se usa solo como etiqueta y no se podrá convertir.`));

  const cv = (se / Math.abs(m)) * 100;
  const interpretation = [
    `La medición se reporta como ${reportText}: el valor más probable es ${rep.value}${unit ? ' ' + unit : ''} con una incertidumbre de ±${rep.uncertainty}${unit ? ' ' + unit : ''} (error estándar de la media).`,
    `Las mediciones individuales se dispersan alrededor de la media ${show(s, d, unit)} (desviación estándar muestral): cada lectura se aparta típicamente esa cantidad de ${show(m, d, unit)}.`,
    ...(Number.isFinite(cv) ? [`La incertidumbre relativa de la media es de ${show(cv, 1)} %.`] : []),
    'Se usa n − 1 porque las mediciones son una muestra de las infinitas lecturas posibles.',
  ];

  return { title: 'Datos experimentales', steps, answer, interpretation, warnings };
}
