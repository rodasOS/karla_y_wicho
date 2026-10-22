import { bayes, classicProbability, combinations, complement, conditional, factorial, intersectionIndependent, permutations, union } from '../math/combinatorics';
import { assertSigma, cdf, inverseCdf, probBetween, probGreater, probLess, quantile, zScore } from '../math/normal';
import { AnswerItem, Solution, Step, exact, show, warn } from './solution';

const pct = (p: number, d = 2) => `${show(p * 100, d)} %`;

// ───────────────────────── Distribución normal ─────────────────────────

export interface NormalInput {
  type: 'menor' | 'mayor' | 'entre';
  mu: number;
  sigma: number;
  a: number;
  b?: number;
  decimals?: number;
  /** μ y σ vienen de una muestra (se avisa que son estimaciones). */
  fromSample?: boolean;
}

function zStep(name: string, x: number, mu: number, sigma: number): Step {
  const z = zScore(x, mu, sigma);
  return {
    label: `Valor z de ${name}`,
    formulaTex: String.raw`z=\dfrac{x-\mu}{\sigma}`,
    substitutionTex: String.raw`z=\dfrac{${exact(x)}-${exact(mu) .startsWith('-') ? `(${exact(mu)})` : exact(mu)}}{${exact(sigma)}}`,
    substitutionExpr: `(${exact(x)} - (${exact(mu)})) / ${exact(sigma)}`,
    procedure: ['Se estandariza: se resta la media y se divide entre la desviación estándar.', 'z indica cuántas desviaciones estándar está x de la media.'],
    result: z,
  };
}

export function solveNormal(input: NormalInput): Solution {
  const { type, mu, sigma, a } = input;
  const d = input.decimals ?? 4;
  assertSigma(sigma);
  const warnings: Solution['warnings'] = [];
  const steps: Step[] = [];
  let p: number;
  let title: string;
  let prob: Step;

  if (type === 'entre') {
    const b = input.b;
    if (b === undefined || Number.isNaN(b)) throw new RangeError('Falta el límite superior b.');
    if (a > b) throw new RangeError('El límite inferior a debe ser menor o igual que b.');
    const za = zScore(a, mu, sigma);
    const zb = zScore(b, mu, sigma);
    steps.push(zStep(`a = ${exact(a)}`, a, mu, sigma), zStep(`b = ${exact(b)}`, b, mu, sigma));
    p = probBetween(a, b, mu, sigma);
    title = `P(${exact(a)} < X < ${exact(b)})`;
    prob = {
      label: title,
      formulaTex: String.raw`P(a<X<b)=\Phi(z_b)-\Phi(z_a)`,
      substitutionTex: String.raw`P=\Phi(${exact(zb)})-\Phi(${exact(za)})=${exact(cdf(zb))}-${exact(cdf(za))}`,
      substitutionExpr: `${exact(cdf(zb))} - ${exact(cdf(za))}`,
      procedure: ['Φ(z) es la probabilidad acumulada de la normal estándar hasta z.', `Φ(${exact(zb)}) = ${exact(cdf(zb))} y Φ(${exact(za)}) = ${exact(cdf(za))}.`, 'Se restan las dos probabilidades acumuladas.'],
      result: p,
    };
  } else {
    const z = zScore(a, mu, sigma);
    steps.push(zStep(`x = ${exact(a)}`, a, mu, sigma));
    if (type === 'menor') {
      p = probLess(a, mu, sigma);
      title = `P(X < ${exact(a)})`;
      prob = {
        label: title,
        formulaTex: String.raw`P(X<x)=\Phi(z)`,
        substitutionTex: String.raw`P=\Phi(${exact(z)})=${exact(p)}`,
        procedure: ['Φ(z) es la probabilidad acumulada de la normal estándar hasta z.', `Φ(${exact(z)}) = ${exact(p)}.`],
        result: p,
      };
    } else {
      p = probGreater(a, mu, sigma);
      title = `P(X > ${exact(a)})`;
      prob = {
        label: title,
        formulaTex: String.raw`P(X>x)=1-\Phi(z)`,
        substitutionTex: String.raw`P=1-\Phi(${exact(z)})=1-${exact(cdf(z))}`,
        substitutionExpr: `1 - ${exact(cdf(z))}`,
        procedure: ['Se pide la cola derecha: es el complemento de la probabilidad acumulada.', `Φ(${exact(z)}) = ${exact(cdf(z))}, así que P = 1 − ${exact(cdf(z))}.`],
        result: p,
      };
    }
  }
  steps.push(prob);

  const zs = type === 'entre' ? [zScore(a, mu, sigma), zScore(input.b!, mu, sigma)] : [zScore(a, mu, sigma)];
  if (zs.some((z) => Math.abs(z) > 4)) warnings.push(warn('info', 'z-extremo', 'Algún valor z es mayor que 4 en valor absoluto: la probabilidad es casi 0 o casi 1.'));
  if (input.fromSample) warnings.push(warn('info', 'estimaciones', 'μ y σ se tomaron de tu muestra: son estimaciones, no los parámetros reales de la población.'));

  const answer: AnswerItem[] = [
    { label: title, value: p, primary: true },
    { label: 'En porcentaje', value: p * 100, unit: '%' },
    ...zs.map((z, i) => ({ label: zs.length === 2 ? (i === 0 ? 'z de a' : 'z de b') : 'z', value: z })),
  ];
  return {
    title: 'Distribución normal',
    steps,
    answer,
    interpretation: [
      `Si X sigue una distribución normal con μ = ${exact(mu)} y σ = ${exact(sigma)}, la probabilidad de ${title.replace('P(', 'que ').replace(')', '')} es ${show(p, d)} (${pct(p)}).`,
      p < 0.05 ? 'Es un evento poco probable (menos del 5 %).' : p > 0.95 ? 'Es un evento muy probable (más del 95 %).' : 'Es un evento con probabilidad intermedia.',
    ],
    warnings,
  };
}

export interface PercentileInput {
  /** Percentil entre 0 y 100 (exclusivos). */
  percentile: number;
  mu: number;
  sigma: number;
  decimals?: number;
  fromSample?: boolean;
}

export function solvePercentile(input: PercentileInput): Solution {
  const { percentile, mu, sigma } = input;
  const d = input.decimals ?? 4;
  assertSigma(sigma);
  if (!(percentile > 0 && percentile < 100)) throw new RangeError('El percentil debe estar entre 0 y 100 (sin incluirlos).');
  const p = percentile / 100;
  const z = inverseCdf(p);
  const x = quantile(p, mu, sigma);
  const steps: Step[] = [
    {
      label: 'Valor z del percentil',
      formulaTex: String.raw`z=\Phi^{-1}(p)`,
      substitutionTex: String.raw`z=\Phi^{-1}(${exact(p)})=${exact(z)}`,
      procedure: ['El percentil indica la probabilidad acumulada p.', 'Se busca el valor z cuya probabilidad acumulada es p (inversa de la normal estándar).'],
      result: z,
    },
    {
      label: 'Valor x del percentil',
      formulaTex: String.raw`x=\mu+z\,\sigma`,
      substitutionTex: String.raw`x=${exact(mu)}+(${exact(z)})(${exact(sigma)})`,
      substitutionExpr: `${exact(mu)} + (${exact(z)}) * ${exact(sigma)}`,
      procedure: ['Se des-estandariza: x = μ + z·σ.'],
      result: x,
    },
  ];
  return {
    title: 'Percentil de la normal',
    steps,
    answer: [
      { label: `Percentil ${exact(percentile)}`, value: x, primary: true },
      { label: 'z', value: z },
    ],
    interpretation: [`El ${show(percentile, 2)} % de los valores es menor o igual que ${show(x, d)}; es decir, P(X ≤ ${show(x, d)}) = ${show(p, 4)}.`],
    warnings: input.fromSample ? [warn('info', 'estimaciones', 'μ y σ se tomaron de tu muestra: son estimaciones.')] : [],
  };
}

// ───────────────────────── Eventos ─────────────────────────

export type EventKind = 'complemento' | 'union' | 'interseccion' | 'condicional' | 'bayes';

export interface EventsInput {
  kind: EventKind;
  pA?: number;
  pB?: number;
  pAB?: number;
  pBgivenA?: number;
  pBgivenNotA?: number;
  decimals?: number;
}

function need(v: number | undefined, name: string): number {
  if (v === undefined || Number.isNaN(v)) throw new RangeError(`Falta ${name}.`);
  return v;
}

export function solveEvents(input: EventsInput): Solution {
  const d = input.decimals ?? 4;
  let step: Step;
  let label: string;
  let value: number;
  let interp: string;
  switch (input.kind) {
    case 'complemento': {
      const pA = need(input.pA, 'P(A)');
      value = complement(pA);
      label = "P(A')";
      step = {
        label,
        formulaTex: String.raw`P(A^c)=1-P(A)`,
        substitutionTex: String.raw`P(A^c)=1-${exact(pA)}`,
        substitutionExpr: `1 - ${exact(pA)}`,
        procedure: ['El complemento reúne todo lo que no es A.', 'Las probabilidades de A y de su complemento suman 1.'],
        result: value,
      };
      interp = `La probabilidad de que A no ocurra es ${show(value, d)} (${pct(value)}).`;
      break;
    }
    case 'union': {
      const [pA, pB, pAB] = [need(input.pA, 'P(A)'), need(input.pB, 'P(B)'), need(input.pAB, 'P(A∩B)')];
      value = union(pA, pB, pAB);
      label = 'P(A∪B)';
      step = {
        label,
        formulaTex: String.raw`P(A\cup B)=P(A)+P(B)-P(A\cap B)`,
        substitutionTex: String.raw`P(A\cup B)=${exact(pA)}+${exact(pB)}-${exact(pAB)}`,
        substitutionExpr: `${exact(pA)} + ${exact(pB)} - ${exact(pAB)}`,
        procedure: ['Se suman P(A) y P(B).', 'Se resta P(A∩B) porque se contó dos veces.'],
        result: value,
      };
      interp = `La probabilidad de que ocurra A, B o ambos es ${show(value, d)} (${pct(value)}).`;
      break;
    }
    case 'interseccion': {
      const [pA, pB] = [need(input.pA, 'P(A)'), need(input.pB, 'P(B)')];
      value = intersectionIndependent(pA, pB);
      label = 'P(A∩B), independientes';
      step = {
        label,
        formulaTex: String.raw`P(A\cap B)=P(A)\,P(B)`,
        substitutionTex: String.raw`P(A\cap B)=${exact(pA)}\cdot ${exact(pB)}`,
        substitutionExpr: `${exact(pA)} * ${exact(pB)}`,
        procedure: ['Si A y B son independientes, la probabilidad de ambos es el producto.'],
        result: value,
      };
      interp = `Si A y B son independientes, la probabilidad de que ocurran ambos es ${show(value, d)} (${pct(value)}).`;
      break;
    }
    case 'condicional': {
      const [pAB, pB] = [need(input.pAB, 'P(A∩B)'), need(input.pB, 'P(B)')];
      value = conditional(pAB, pB);
      label = 'P(A|B)';
      step = {
        label,
        formulaTex: String.raw`P(A\mid B)=\dfrac{P(A\cap B)}{P(B)}`,
        substitutionTex: String.raw`P(A\mid B)=\dfrac{${exact(pAB)}}{${exact(pB)}}`,
        substitutionExpr: `${exact(pAB)} / ${exact(pB)}`,
        procedure: ['Se restringe el espacio muestral a B.', 'Se divide la probabilidad conjunta entre P(B).'],
        result: value,
      };
      interp = `Sabiendo que B ocurrió, la probabilidad de A es ${show(value, d)} (${pct(value)}).`;
      break;
    }
    case 'bayes': {
      const [pA, pBA, pBn] = [need(input.pA, 'P(A)'), need(input.pBgivenA, 'P(B|A)'), need(input.pBgivenNotA, "P(B|A')")];
      const r = bayes(pA, pBA, pBn);
      value = r.posterior;
      label = 'P(A|B)';
      step = {
        label: 'P(A|B) por Bayes',
        formulaTex: String.raw`P(A\mid B)=\dfrac{P(B\mid A)P(A)}{P(B\mid A)P(A)+P(B\mid A^c)\,(1-P(A))}`,
        substitutionTex: String.raw`P(A\mid B)=\dfrac{${exact(pBA)}\cdot ${exact(pA)}}{${exact(pBA)}\cdot ${exact(pA)}+${exact(pBn)}\cdot ${exact(1 - pA)}}`,
        substitutionExpr: `(${exact(pBA)} * ${exact(pA)}) / (${exact(pBA)} * ${exact(pA)} + ${exact(pBn)} * ${exact(1 - pA)})`,
        procedure: [`P(B) por probabilidad total = ${exact(r.pB)}.`, 'Se divide la parte de B que viene de A entre P(B).'],
        result: value,
      };
      interp = `Después de observar B, la probabilidad de A pasa de ${show(pA, d)} a ${show(value, d)} (${pct(value)}).`;
      break;
    }
  }
  return {
    title: 'Probabilidad de eventos',
    steps: [step],
    answer: [{ label, value, primary: true }, { label: 'En porcentaje', value: value * 100, unit: '%' }],
    interpretation: [interp],
    warnings: [],
  };
}

// ───────────────────────── Clásica y combinatoria ─────────────────────────

export type ClassicKind = 'clasica' | 'combinaciones' | 'permutaciones' | 'factorial';

export interface ClassicInput {
  kind: ClassicKind;
  favorable?: number;
  possible?: number;
  n?: number;
  k?: number;
  decimals?: number;
}

export function solveClassic(input: ClassicInput): Solution {
  const d = input.decimals ?? 4;
  switch (input.kind) {
    case 'clasica': {
      const f = need(input.favorable, 'los casos favorables');
      const t = need(input.possible, 'los casos posibles');
      const p = classicProbability(f, t);
      return {
        title: 'Probabilidad clásica',
        steps: [{ label: 'P(A)', formulaTex: String.raw`P(A)=\dfrac{\text{casos favorables}}{\text{casos posibles}}`, substitutionTex: String.raw`P(A)=\dfrac{${f}}{${t}}`, substitutionExpr: `${f} / ${t}`, procedure: ['Se asume que todos los resultados son igualmente probables.'], result: p }],
        answer: [{ label: 'P(A)', value: p, primary: true }, { label: 'En porcentaje', value: p * 100, unit: '%' }],
        interpretation: [`De cada ${t} casos posibles, ${f} cumplen el evento: probabilidad ${show(p, d)} (${pct(p)}).`],
        warnings: [],
      };
    }
    case 'combinaciones': {
      const n = need(input.n, 'n');
      const k = need(input.k, 'k');
      const c = combinations(n, k);
      return {
        title: 'Combinaciones',
        steps: [{ label: `C(${n}, ${k})`, formulaTex: String.raw`C(n,k)=\dfrac{n!}{k!\,(n-k)!}`, substitutionTex: String.raw`C(${n},${k})=\dfrac{${n}!}{${k}!\cdot ${n - k}!}=\dfrac{${exact(factorial(n))}}{${exact(factorial(k))}\cdot ${exact(factorial(n - k))}}`, substitutionExpr: `${exact(factorial(n))} / (${exact(factorial(k))} * ${exact(factorial(n - k))})`, procedure: ['No importa el orden de los elementos elegidos.'], result: c }],
        answer: [{ label: `C(${n}, ${k})`, value: c, primary: true }],
        interpretation: [`Hay ${c} formas de elegir ${k} elementos de ${n} sin importar el orden.`],
        warnings: [],
      };
    }
    case 'permutaciones': {
      const n = need(input.n, 'n');
      const k = need(input.k, 'k');
      const p = permutations(n, k);
      return {
        title: 'Permutaciones',
        steps: [{ label: `P(${n}, ${k})`, formulaTex: String.raw`P(n,k)=\dfrac{n!}{(n-k)!}`, substitutionTex: String.raw`P(${n},${k})=\dfrac{${n}!}{${n - k}!}=\dfrac{${exact(factorial(n))}}{${exact(factorial(n - k))}}`, substitutionExpr: `${exact(factorial(n))} / ${exact(factorial(n - k))}`, procedure: ['Sí importa el orden de los elementos.'], result: p }],
        answer: [{ label: `P(${n}, ${k})`, value: p, primary: true }],
        interpretation: [`Hay ${p} ordenaciones distintas de ${k} elementos tomados de ${n}.`],
        warnings: [],
      };
    }
    case 'factorial': {
      const n = need(input.n, 'n');
      const f = factorial(n);
      return {
        title: 'Factorial',
        steps: [{ label: `${n}!`, formulaTex: String.raw`n!=n\,(n-1)\cdots 2\cdot 1`, substitutionTex: String.raw`${n}!=${n >= 2 ? Array.from({ length: Math.min(n, 8) }, (_, i) => n - i).join('\\cdot ') : '1'}${n > 8 ? String.raw`\cdots 1` : ''}`, procedure: ['0! = 1 por definición.'], result: f }],
        answer: [{ label: `${n}!`, value: f, primary: true }],
        interpretation: [`${n}! = ${exact(f)} es el número de maneras de ordenar ${n} elementos distintos.`],
        warnings: [],
      };
    }
  }
}
