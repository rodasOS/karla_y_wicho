import { classifyCorrelation, linearRegression, predict } from '../math/regression';
import { AnswerItem, Solution, Step, exact, paren, show, sumTex, warn } from './solution';

export interface RegressionInput {
  x: number[];
  y: number[];
  xLabels?: string[];
  yLabels?: string[];
  unitX?: string;
  unitY?: string;
  /** Si se da, se calcula ŷ para ese x. */
  predictAt?: number;
  decimals?: number;
}

const u = (unit?: string) => (unit ? ` ${unit}` : '');

/** Ecuación ŷ = a + bx con signos legibles. */
export function equationText(a: number, b: number, d: number): string {
  const sign = b < 0 ? '−' : '+';
  return `ŷ = ${show(a, d)} ${sign} ${show(Math.abs(b), d)}x`;
}

export function solveRegression(input: RegressionInput): Solution {
  const { x, y } = input;
  const d = input.decimals ?? 4;
  const reg = linearRegression(x, y); // lanza si n<3, longitudes distintas o x constante
  const n = x.length;
  const xl = input.xLabels?.length === n ? input.xLabels : x.map(exact);
  const yl = input.yLabels?.length === n ? input.yLabels : y.map(exact);
  const { meanX: mx, meanY: my, sxx, syy, sxy, slope: b, intercept: a, r, r2 } = reg;
  const warnings: Solution['warnings'] = [];

  const dx = (i: number) => `(${xl[i]} - ${exact(mx)})`.replace(/- -/g, '+ ');
  const dy = (i: number) => `(${yl[i]} - ${exact(my)})`.replace(/- -/g, '+ ');
  const sxxExpr = x.map((_, i) => `${dx(i)}**2`).join(' + ');
  const syyExpr = y.map((_, i) => `${dy(i)}**2`).join(' + ');
  const sxyExpr = x.map((_, i) => `${dx(i)} * ${dy(i)}`).join(' + ');
  const short = (f: (i: number) => string) => {
    const items = x.map((_, i) => f(i));
    return items.length <= 6 ? items.join('+') : `${items.slice(0, 4).join('+')}+\\ldots+${items.slice(-2).join('+')}`;
  };

  const steps: Step[] = [
    {
      label: 'Medias de x e y',
      formulaTex: String.raw`\bar{x}=\dfrac{\sum x_i}{n},\quad \bar{y}=\dfrac{\sum y_i}{n}`,
      substitutionTex: String.raw`\bar{x}=\dfrac{${sumTex(xl)}}{${n}}=${exact(mx)},\quad \bar{y}=\dfrac{${sumTex(yl)}}{${n}}=${exact(my)}`,
      procedure: [`n = ${n} pares.`, `x̄ = ${exact(mx)}${u(input.unitX)} y ȳ = ${exact(my)}${u(input.unitY)}.`],
      result: mx,
      resultText: `x̄ = ${exact(mx)}, ȳ = ${exact(my)}`,
    },
    {
      label: 'Suma de cuadrados Sxx',
      formulaTex: String.raw`S_{xx}=\sum (x_i-\bar{x})^2`,
      substitutionTex: String.raw`S_{xx}=${short((i) => `(${xl[i]}-${paren(exact(mx))})^2`)}`,
      substitutionExpr: sxxExpr,
      procedure: ['Mide la dispersión de x respecto a su media.'],
      result: sxx,
    },
    {
      label: 'Suma de productos Sxy',
      formulaTex: String.raw`S_{xy}=\sum (x_i-\bar{x})(y_i-\bar{y})`,
      substitutionTex: String.raw`S_{xy}=${short((i) => `(${xl[i]}-${paren(exact(mx))})(${yl[i]}-${paren(exact(my))})`)}`,
      substitutionExpr: sxyExpr,
      procedure: ['Mide cómo varían x e y juntas: positivo si crecen juntas, negativo si una crece y la otra baja.'],
      result: sxy,
    },
    {
      label: 'Pendiente b',
      formulaTex: String.raw`b=\dfrac{S_{xy}}{S_{xx}}`,
      substitutionTex: String.raw`b=\dfrac{${exact(sxy)}}{${exact(sxx)}}`,
      substitutionExpr: `${exact(sxy)} / ${exact(sxx)}`,
      procedure: ['Es el cambio promedio de y por cada unidad que aumenta x.'],
      result: b,
      unit: input.unitX && input.unitY ? `${input.unitY}/${input.unitX}` : undefined,
    },
    {
      label: 'Intercepto a',
      formulaTex: String.raw`a=\bar{y}-b\,\bar{x}`,
      substitutionTex: String.raw`a=${exact(my)}-(${exact(b)})(${exact(mx)})`,
      substitutionExpr: `${exact(my)} - (${exact(b)}) * (${exact(mx)})`,
      procedure: ['La recta siempre pasa por el punto (x̄, ȳ).', 'El intercepto es el valor ajustado de y cuando x = 0.'],
      result: a,
      unit: input.unitY,
    },
  ];

  if (Number.isFinite(r)) {
    steps.push({
      label: 'Coeficiente de correlación r',
      formulaTex: String.raw`r=\dfrac{S_{xy}}{\sqrt{S_{xx}\,S_{yy}}}`,
      substitutionTex: String.raw`r=\dfrac{${exact(sxy)}}{\sqrt{(${exact(sxx)})(${exact(syy)})}}`,
      substitutionExpr: `${exact(sxy)} / sqrt((${exact(sxx)}) * (${exact(syy)}))`,
      procedure: [`Syy = Σ(yᵢ − ȳ)² = ${exact(syy)}.`, 'r está siempre entre −1 y 1.'],
      result: r,
    });
    steps.push({
      label: 'Coeficiente de determinación R²',
      formulaTex: String.raw`R^2=r^2`,
      substitutionTex: String.raw`R^2=(${exact(r)})^2`,
      substitutionExpr: `(${exact(r)}) ** 2`,
      procedure: ['Proporción de la variación de y que explica la recta.'],
      result: r2,
    });
  } else {
    warnings.push(warn('warning', 'r-indefinido', 'y es constante (no varía): r no está definido, aunque la recta es horizontal.'));
  }

  let pred: ReturnType<typeof predict> | null = null;
  if (input.predictAt !== undefined && !Number.isNaN(input.predictAt)) {
    pred = predict(reg, input.predictAt);
    steps.push({
      label: `Predicción para x = ${exact(input.predictAt)}`,
      formulaTex: String.raw`\hat{y}=a+b\,x`,
      substitutionTex: String.raw`\hat{y}=${exact(a)}+(${exact(b)})(${exact(input.predictAt)})`,
      substitutionExpr: `${exact(a)} + (${exact(b)}) * (${exact(input.predictAt)})`,
      procedure: ['Se evalúa la recta ajustada en el valor pedido.'],
      result: pred.yHat,
      unit: input.unitY,
    });
    if (pred.extrapolated) {
      warnings.push(warn('warning', 'extrapolacion', `x = ${exact(input.predictAt)} está fuera del rango observado (${exact(reg.xMin)} a ${exact(reg.xMax)}): es una extrapolación y puede ser poco confiable.`));
    }
  }
  if (n < 5) warnings.push(warn('info', 'pocos-pares', `Con solo ${n} pares la relación es poco fiable: úsala con cautela.`));

  const eq = equationText(a, b, d);
  const answer: AnswerItem[] = [
    { label: 'Ecuación de la recta', value: b, text: eq, primary: true },
    { label: 'Pendiente (b)', value: b, unit: input.unitX && input.unitY ? `${input.unitY}/${input.unitX}` : undefined },
    { label: 'Intercepto (a)', value: a, unit: input.unitY },
  ];
  if (Number.isFinite(r)) {
    answer.push({ label: 'Correlación (r)', value: r, primary: true }, { label: 'Determinación (R²)', value: r2 });
  }
  if (pred) answer.push({ label: `ŷ en x = ${exact(input.predictAt!)}`, value: pred.yHat, unit: input.unitY });

  const interp: string[] = [];
  if (Number.isFinite(r)) {
    const strength = classifyCorrelation(r);
    const sense = r > 0 ? 'positiva (al aumentar x, y tiende a aumentar)' : r < 0 ? 'negativa (al aumentar x, y tiende a disminuir)' : 'sin dirección';
    interp.push(`r = ${show(r, d)}: relación lineal ${strength}${strength === 'nula' ? '' : ' y ' + sense}.`);
    interp.push(`R² = ${show(r2, d)}: la recta explica el ${show(r2 * 100, 1)} % de la variación de y; el ${show((1 - r2) * 100, 1)} % restante se debe a otros factores o al azar.`);
  }
  interp.push(
    input.unitX && input.unitY
      ? `Pendiente: por cada 1 ${input.unitX} de aumento en x, y cambia en promedio ${show(b, d)} ${input.unitY}.`
      : `Pendiente: por cada 1 unidad de aumento en x, y cambia en promedio ${show(b, d)} unidades.`,
  );
  interp.push(`Intercepto: cuando x = 0 el modelo ajusta y = ${show(a, d)}${u(input.unitY)} (solo tiene sentido si x = 0 está dentro del rango observado).`);
  interp.push('Correlación no implica causalidad: una relación lineal fuerte no demuestra que x cause y.');

  return { title: 'Correlación y regresión lineal simple', steps, answer, interpretation: interp, warnings };
}
