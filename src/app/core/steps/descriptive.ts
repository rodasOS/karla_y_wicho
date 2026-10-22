import { coefficientOfVariation, mean, median, mode, outliers, quartiles, range, sortedCopy, stdDev, sum, variance } from '../math/stats';
import { AnswerItem, Solution, Step, exact, paren, show, sumExpr, sumTex, warn } from './solution';

export interface DescriptiveInput {
  values: number[];
  /** Texto original de cada dato (para mostrar la sustitución tal como se escribió). */
  labels?: string[];
  unit?: string;
  decimals?: number;
  /** Cuál desviación se destaca como respuesta principal. */
  kind?: 'muestra' | 'poblacion';
}

const sq = (u?: string) => (u ? `${u}²` : undefined);

export function solveDescriptive(input: DescriptiveInput): Solution {
  const xs = input.values;
  const d = input.decimals ?? 4;
  const u = input.unit?.trim() || undefined;
  const kind = input.kind ?? 'muestra';
  if (xs.length === 0) throw new RangeError('Se necesitan datos para calcular.');
  const labels = input.labels && input.labels.length === xs.length ? input.labels : xs.map(exact);
  const n = xs.length;
  const m = mean(xs);
  const total = sum(xs);
  const warnings: Solution['warnings'] = [];
  const steps: Step[] = [];

  // Media
  steps.push({
    label: 'Media',
    formulaTex: String.raw`\bar{x}=\dfrac{\sum x_i}{n}`,
    substitutionTex: String.raw`\bar{x}=\dfrac{${sumTex(labels)}}{${n}}=\dfrac{${exact(total)}}{${n}}`,
    substitutionExpr: `(${sumExpr(labels)}) / ${n}`,
    procedure: [`Se suman los ${n} datos: Σx = ${exact(total)}.`, `Se divide entre n = ${n}.`],
    result: m,
    unit: u,
  });

  // Mediana
  const sorted = sortedCopy(xs);
  const med = median(xs);
  const mid = n >> 1;
  steps.push({
    label: 'Mediana',
    formulaTex: n % 2 ? String.raw`\text{Me}=x_{\left(\frac{n+1}{2}\right)}` : String.raw`\text{Me}=\dfrac{x_{(n/2)}+x_{(n/2+1)}}{2}`,
    substitutionTex:
      n % 2
        ? String.raw`\text{Me}=x_{(${(n + 1) / 2})}=${exact(med)}`
        : String.raw`\text{Me}=\dfrac{${exact(sorted[mid - 1])}+${exact(sorted[mid])}}{2}=${exact(med)}`,
    substitutionExpr: n % 2 ? `${paren(exact(sorted[mid]))}` : `(${paren(exact(sorted[mid - 1]))} + ${paren(exact(sorted[mid]))}) / 2`,
    procedure: [
      `Se ordenan los datos de menor a mayor: ${sorted.map(exact).join(', ')}.`,
      n % 2 ? `n = ${n} es impar: la mediana es el dato en la posición (n + 1)/2 = ${(n + 1) / 2}.` : `n = ${n} es par: se promedian los datos de las posiciones ${n / 2} y ${n / 2 + 1}.`,
    ],
    result: med,
    unit: u,
  });

  // Moda
  const mo = mode(xs);
  const modeText =
    mo.kind === 'none'
      ? 'No hay moda'
      : mo.modes.map(exact).join(' y ') + (mo.kind === 'bimodal' ? ' (bimodal)' : mo.kind === 'multimodal' ? ' (multimodal)' : '');
  steps.push({
    label: 'Moda',
    formulaTex: String.raw`\text{Mo}=\text{valor con mayor frecuencia}`,
    substitutionTex:
      mo.kind === 'none' ? String.raw`\text{Ningún valor se repite más que otro}` : String.raw`\text{Mo}=${mo.modes.map(exact).join(',\\ ')}\ \ (f=${mo.frequency})`,
    procedure: [
      mo.kind === 'none' ? 'Se cuenta cuántas veces aparece cada valor: todos aparecen la misma cantidad de veces.' : `Se cuenta la frecuencia de cada valor; la mayor es ${mo.frequency}.`,
      mo.kind === 'none' ? 'Por eso el conjunto no tiene moda.' : `Valor(es) con esa frecuencia: ${mo.modes.map(exact).join(', ')}.`,
    ],
    result: mo.modes.length ? mo.modes[0] : NaN,
    resultText: modeText,
    unit: mo.kind === 'none' ? undefined : u,
  });
  if (mo.kind === 'none') warnings.push(warn('info', 'sin-moda', 'Los datos no tienen moda: ningún valor se repite más que los demás.'));

  // Rango
  const mx = Math.max(...xs);
  const mn = Math.min(...xs);
  steps.push({
    label: 'Rango',
    formulaTex: String.raw`R=x_{\max}-x_{\min}`,
    substitutionTex: String.raw`R=${exact(mx)}-${paren(exact(mn))}`,
    substitutionExpr: `${paren(exact(mx))} - ${paren(exact(mn))}`,
    procedure: [`Máximo = ${exact(mx)} y mínimo = ${exact(mn)}.`, 'Se resta el mínimo al máximo.'],
    result: range(xs),
    unit: u,
  });

  // Varianzas y desviaciones
  const devs = xs.map((x, i) => `(${labels[i]} - ${exact(m)})`.replace(/- -/g, '+ '));
  const devExpr = devs.map((x) => `${x}**2`).join(' + ');
  const devTex = (head = 4, tail = 2) => {
    const items = xs.map((_, i) => `(${labels[i]}-${paren(exact(m))})^2`);
    return items.length <= head + tail + 1 ? items.join('+') : `${items.slice(0, head).join('+')}+\\ldots+${items.slice(-tail).join('+')}`;
  };
  const ss = xs.reduce((s, x) => s + (x - m) ** 2, 0);
  const varS = variance(xs, true);
  const varP = variance(xs, false);

  if (n >= 2) {
    steps.push({
      label: 'Varianza muestral',
      formulaTex: String.raw`s^2=\dfrac{\sum (x_i-\bar{x})^2}{n-1}`,
      substitutionTex: String.raw`s^2=\dfrac{${devTex()}}{${n}-1}=\dfrac{${exact(ss)}}{${n - 1}}`,
      substitutionExpr: `(${devExpr}) / (${n} - 1)`,
      procedure: [`Se calcula cada desviación (xᵢ − x̄) con x̄ = ${exact(m)} y se eleva al cuadrado.`, `Suma de cuadrados = ${exact(ss)}.`, `Se divide entre n − 1 = ${n - 1}.`],
      result: varS,
      unit: sq(u),
    });
  }
  steps.push({
    label: 'Varianza poblacional',
    formulaTex: String.raw`\sigma^2=\dfrac{\sum (x_i-\mu)^2}{N}`,
    substitutionTex: String.raw`\sigma^2=\dfrac{${devTex()}}{${n}}=\dfrac{${exact(ss)}}{${n}}`,
    substitutionExpr: `(${devExpr}) / ${n}`,
    procedure: [`Misma suma de cuadrados: ${exact(ss)}.`, `Se divide entre N = ${n} (se asume que los datos son toda la población).`],
    result: varP,
    unit: sq(u),
  });
  if (n >= 2) {
    steps.push({
      label: 'Desviación estándar muestral',
      formulaTex: String.raw`s=\sqrt{\dfrac{\sum (x_i-\bar{x})^2}{n-1}}`,
      substitutionTex: String.raw`s=\sqrt{${exact(varS)}}`,
      substitutionExpr: `sqrt(${exact(varS)})`,
      procedure: ['Es la raíz cuadrada de la varianza muestral.'],
      result: stdDev(xs, true),
      unit: u,
    });
  }
  steps.push({
    label: 'Desviación estándar poblacional',
    formulaTex: String.raw`\sigma=\sqrt{\dfrac{\sum (x_i-\mu)^2}{N}}`,
    substitutionTex: String.raw`\sigma=\sqrt{${exact(varP)}}`,
    substitutionExpr: `sqrt(${exact(varP)})`,
    procedure: ['Es la raíz cuadrada de la varianza poblacional.'],
    result: stdDev(xs, false),
    unit: u,
  });

  // Cuartiles / RIC
  const q = quartiles(xs);
  steps.push({
    label: 'Rango intercuartílico (RIC)',
    formulaTex: String.raw`\text{RIC}=Q_3-Q_1`,
    substitutionTex: String.raw`\text{RIC}=${exact(q.q3)}-${paren(exact(q.q1))}`,
    substitutionExpr: `${paren(exact(q.q3))} - ${paren(exact(q.q1))}`,
    procedure: ['Cuartiles por interpolación lineal (método de Excel QUARTILE.INC).', `Q₁ = ${exact(q.q1)}, Q₂ = ${exact(q.q2)}, Q₃ = ${exact(q.q3)}.`],
    result: q.iqr,
    unit: u,
  });

  // Coeficiente de variación
  const cv = coefficientOfVariation(xs, n >= 2);
  if (n >= 2 && Number.isFinite(cv)) {
    steps.push({
      label: 'Coeficiente de variación',
      formulaTex: String.raw`CV=\dfrac{s}{|\bar{x}|}\times 100\%`,
      substitutionTex: String.raw`CV=\dfrac{${exact(stdDev(xs, true))}}{${exact(Math.abs(m))}}\times 100`,
      substitutionExpr: `${exact(stdDev(xs, true))} / ${exact(Math.abs(m))} * 100`,
      procedure: ['Compara la dispersión con el tamaño de la media.'],
      result: cv * 100,
      unit: '%',
    });
  }

  // Advertencias
  if (n < 2) warnings.push(warn('warning', 'n-insuficiente', 'Con n = 1 la desviación estándar muestral no está definida (se necesita n ≥ 2). Solo se calcula la poblacional.'));
  const out = outliers(xs);
  if (out.values.length && n >= 4) {
    warnings.push(warn('warning', 'atipicos', `Posible(s) valor(es) atípico(s): ${out.values.map(exact).join(', ')} (fuera de ${exact(out.lowerFence)} … ${exact(out.upperFence)}, criterio 1.5 × RIC). No se excluyeron del cálculo; conviene revisarlos.`));
  }
  if (n >= 2 && n < 5) warnings.push(warn('info', 'muestra-pequena', `Con n = ${n} datos las medidas son poco representativas.`));

  // Respuesta
  const sd = stdDev(xs, kind === 'muestra' && n >= 2);
  const answer: AnswerItem[] = [
    { label: 'Media', value: m, unit: u, primary: true },
    { label: 'Mediana', value: med, unit: u },
    { label: 'Moda', value: mo.modes.length ? mo.modes[0] : NaN, text: modeText, unit: mo.kind === 'none' ? undefined : u },
    { label: 'Rango', value: range(xs), unit: u },
  ];
  if (n >= 2) {
    answer.push({ label: 'Varianza muestral (s²)', value: varS, unit: sq(u) });
    answer.push({ label: 'Desviación estándar muestral (s)', value: stdDev(xs, true), unit: u, primary: kind === 'muestra' });
  }
  answer.push({ label: 'Varianza poblacional (σ²)', value: varP, unit: sq(u) });
  answer.push({ label: 'Desviación estándar poblacional (σ)', value: stdDev(xs, false), unit: u, primary: kind === 'poblacion' || n < 2 });

  // Interpretación
  const interp: string[] = [];
  interp.push(`Los ${n} datos se concentran alrededor de ${show(m, d, u)} (media); la mitad de ellos queda por debajo de ${show(med, d, u)} (mediana).`);
  if (n >= 2) {
    const label = kind === 'muestra' ? 'muestral' : 'poblacional';
    interp.push(`Los datos se desvían típicamente ${show(sd, d, u)} respecto a la media (desviación estándar ${label}).`);
    if (Number.isFinite(cv)) interp.push(`Eso equivale a una variación relativa de ${show(cv * 100, 1)} % de la media${cv < 0.1 ? ': datos bastante homogéneos.' : cv < 0.3 ? ': dispersión moderada.' : ': dispersión alta.'}`);
    interp.push(`Todos los valores están dentro de un rango de ${show(range(xs), d, u)} (de ${exact(mn)} a ${exact(mx)}).`);
  }
  if (Math.abs(m - med) > 0.25 * (stdDev(xs, false) || 1) && n >= 3) {
    interp.push(m > med ? 'La media es mayor que la mediana: hay cierta asimetría hacia valores altos.' : 'La media es menor que la mediana: hay cierta asimetría hacia valores bajos.');
  }

  return { title: 'Estadística descriptiva', steps, answer, interpretation: interp, warnings };
}
