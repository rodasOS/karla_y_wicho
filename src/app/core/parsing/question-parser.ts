/** Barra de pregunta: reconoce la intención de una pregunta en español con reglas (sin IA externa). */
import { extractNumbers } from './data-parser';

export type ModuleId = 'descriptive' | 'experimental' | 'tables-charts' | 'probability' | 'regression' | 'interpretation';

export const MODULE_LABELS: Record<ModuleId, string> = {
  descriptive: 'Estadística descriptiva',
  experimental: 'Datos experimentales',
  'tables-charts': 'Tablas y gráficas',
  probability: 'Probabilidad y distribución normal',
  regression: 'Correlación y regresión',
  interpretation: 'Interpretación (σ vs s)',
};

export const MODULE_ROUTES: Record<ModuleId, string> = {
  descriptive: '/descriptiva',
  experimental: '/experimentales',
  'tables-charts': '/tablas-graficas',
  probability: '/probabilidad',
  regression: '/regresion',
  interpretation: '/interpretacion',
};

export interface QuestionParams {
  /** Datos de una serie (texto original de los números). */
  data?: string[];
  unit?: string;
  kind?: 'muestra' | 'poblacion';
  x?: string[];
  y?: string[];
  pairsAssumed?: boolean;
  /** Pestaña de probabilidad: eventos, clasica, normal, inverso. */
  tab?: 'eventos' | 'clasica' | 'normal' | 'inverso';
  mu?: number;
  sigma?: number;
  /** Tipo de consulta normal. */
  normal?: { type: 'menor' | 'mayor' | 'entre'; a: number; b?: number };
  percentile?: number;
  n?: number;
  k?: number;
  combinatorics?: 'combinaciones' | 'permutaciones';
  chart?: 'histograma' | 'dispersion' | 'frecuencias';
  /** Medidas pedidas explícitamente (media, mediana, …). */
  measures?: string[];
}

export type QuestionStatus = 'ok' | 'no-data' | 'ambiguous' | 'unsupported';

export interface QuestionResult {
  status: QuestionStatus;
  module?: ModuleId;
  params: QuestionParams;
  /** 0–1: qué tan seguro está el analizador de la intención. */
  confidence: number;
  /** Mensaje en español para el usuario. */
  message: string;
  /** Módulos sugeridos (para ambiguas o fuera de alcance). */
  suggestions: ModuleId[];
  /** Resumen de lo que se entendió. */
  understood: string[];
}

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

type Rule = [RegExp, number];

const RULES: Record<ModuleId, Rule[]> = {
  descriptive: [
    [/\bmedia\b|\bpromedio\b/, 2],
    [/\bmediana\b/, 2],
    [/\bmoda\b/, 2],
    [/\brango\b/, 1],
    [/\bvarianza\b/, 2],
    [/desviacion (estandar|tipica)?|\bdesvest\b/, 2],
    [/medidas? de (tendencia|dispersion|posicion)/, 3],
    [/estadistica descriptiva|descriptiva/, 3],
    [/cuartil|coeficiente de variacion/, 2],
  ],
  experimental: [
    [/\bmedicion(es)?\b/, 3],
    [/incertidumbre|error estandar|error de la media/, 3],
    [/\b(corriente|voltaje|tension|resistencia|longitud|temperatura)\b/, 2],
    [/\bunidad(es)?\b|\bconvert(ir|ir de)\b|\bconversion\b/, 2],
    [/amperio|voltio|ohm|ampere|\bmili\w+/, 2],
    [/experiment|laboratorio|instrumento/, 2],
  ],
  'tables-charts': [
    [/histograma/, 4],
    [/tabla de frecuencias?|frecuencias?|clases?\b|sturges/, 3],
    [/\btabla\b/, 1],
    [/(diagrama|grafico|grafica|nube) de dispersion|scatter/, 4],
    [/\bgraficar?\b|\bgrafica\b|\bgrafico\b/, 1],
  ],
  probability: [
    [/probabilidad|\bprobabilidades\b/, 3],
    [/distribucion normal|\bnormal\b|campana de gauss|gaussiana/, 3],
    [/puntaje z|valor z|\bz\b|estandariz/, 2],
    [/percentil|cuantil/, 2],
    [/combinacion(es)?|permutacion(es)?|factorial/, 3],
    [/bayes|condicional|complemento|\beventos?\b|independientes?/, 2],
    [/\bp\s*\(/, 2],
    [/dado|moneda|baraja|urna/, 1],
  ],
  regression: [
    [/correlacion|pearson|\bcoeficiente r\b|\br\b ?=/, 4],
    [/regresion/, 4],
    [/recta|ajuste lineal|minimos cuadrados|pendiente|intercepto|ordenada/, 3],
    [/\br2\b|r cuadrado|determinacion/, 3],
    [/prediccion|predecir|pronostic/, 2],
    [/relacion (lineal )?entre|variables?/, 1],
  ],
  interpretation: [
    [/diferencia(s)? entre (la )?desviacion|poblacional (vs|contra|y|o) muestral|muestral (vs|contra|y|o) poblacional/, 6],
    [/(por que|porque).*(n ?- ?1|n menos 1|n-1)/, 5],
    [/\bsigma\b.*\bs\b|\bs\b.*\bsigma\b/, 3],
    [/explica(r)?|interpreta(r)?|significa/, 1],
  ],
};

const UNSUPPORTED_RE = /prueba(s)? de hipotesis|hipotesis|intervalos? de confianza|\banova\b|chi ?cuadrado|t de student|\bp[- ]?valor\b|regresion multiple|series? de tiempo|bootstrap|\bmcmc\b/;

const REQUIRES_DATA: ModuleId[] = ['descriptive', 'experimental', 'tables-charts', 'regression'];

function toLabel(n: number): string {
  return String(n);
}

function extractUnit(original: string): string | undefined {
  const paren = original.match(/\(([^()\d]{1,6})\)/);
  if (paren) return paren[1].trim();
  const en = normalizeText(original).match(/\ben (amperios?|voltios?|ohmios?|metros?|segundos?|kilogramos?|gramos?|newtons?)\b/);
  const map: Record<string, string> = { amperio: 'A', voltio: 'V', ohmio: 'Ω', metro: 'm', segundo: 's', kilogramo: 'kg', gramo: 'g', newton: 'N' };
  if (en) return map[en[1].replace(/s$/, '')];
  return undefined;
}

function num(s: string): number {
  return Number(s.replace(',', '.'));
}

const NUM = String.raw`(-?\d+(?:[.,]\d+)?)`;

function extractNormal(t: string, params: QuestionParams): boolean {
  let found = false;
  const mu = t.match(new RegExp(String.raw`(?:\bmedia\b|\bmu\b|μ)\s*(?:=|:|de|es|igual a)?\s*${NUM}`));
  const sigma = t.match(new RegExp(String.raw`(?:desviacion(?: estandar| tipica)?|\bsigma\b|σ)\s*(?:=|:|de|es|igual a)?\s*${NUM}`));
  if (mu) {
    params.mu = num(mu[1]);
    found = true;
  }
  if (sigma) {
    params.sigma = num(sigma[1]);
    found = true;
  }
  const between = t.match(new RegExp(String.raw`entre ${NUM} y ${NUM}|p\s*\(\s*${NUM}\s*<\s*x\s*<\s*${NUM}\s*\)`));
  const less = t.match(new RegExp(String.raw`(?:menor(?:es)? (?:que|a)|menos de|<|inferior a|p\s*\(\s*x\s*<)\s*=?\s*${NUM}`));
  const more = t.match(new RegExp(String.raw`(?:mayor(?:es)? (?:que|a)|mas de|>|superior a|excede a?|p\s*\(\s*x\s*>)\s*=?\s*${NUM}`));
  const pct = t.match(new RegExp(String.raw`percentil\s*${NUM}|cuantil\s*${NUM}`));
  if (pct) {
    params.percentile = num(pct[1] ?? pct[2]);
    params.tab = 'inverso';
    found = true;
  } else if (between) {
    params.normal = { type: 'entre', a: num(between[1] ?? between[3]), b: num(between[2] ?? between[4]) };
    params.tab = 'normal';
    found = true;
  } else if (less) {
    params.normal = { type: 'menor', a: num(less[1]) };
    params.tab = 'normal';
    found = true;
  } else if (more) {
    params.normal = { type: 'mayor', a: num(more[1]) };
    params.tab = 'normal';
    found = true;
  }
  return found;
}

function extractPairs(original: string, params: QuestionParams, nums: number[]): void {
  const t = normalizeText(original);
  const xi = t.search(/\bx\s*[=:]/);
  const yi = t.search(/\by\s*[=:]/);
  if (xi >= 0 && yi >= 0) {
    const [first, second] = xi < yi ? [xi, yi] : [yi, xi];
    const a = t.slice(first, second);
    const b = t.slice(second);
    const aNums = extractNumbers(a.replace(/^[xy]\s*[=:]/, '')).map(toLabel);
    const bNums = extractNumbers(b.replace(/^[xy]\s*[=:]/, '')).map(toLabel);
    if (xi < yi) {
      params.x = aNums;
      params.y = bNums;
    } else {
      params.y = aNums;
      params.x = bNums;
    }
  } else if (nums.length >= 6 && nums.length % 2 === 0) {
    const half = nums.length / 2;
    params.x = nums.slice(0, half).map(toLabel);
    params.y = nums.slice(half).map(toLabel);
    params.pairsAssumed = true;
  }
}

function result(partial: Partial<QuestionResult> & Pick<QuestionResult, 'status' | 'message'>): QuestionResult {
  return { params: {}, confidence: 0, suggestions: [], understood: [], ...partial };
}

export function parseQuestion(input: string): QuestionResult {
  const original = input ?? '';
  const t = normalizeText(original);
  const allModules = Object.keys(MODULE_LABELS) as ModuleId[];

  if (!t) {
    return result({ status: 'ambiguous', message: 'Escribe una pregunta o los datos que quieres analizar, por ejemplo: «media y desviación estándar de 2.1, 2.3, 2.2, 2.4, 2.0».', suggestions: allModules });
  }

  if (UNSUPPORTED_RE.test(t)) {
    const close: ModuleId[] = /regresion/.test(t) ? ['regression'] : /confianza|hipotesis|valor|t de student|chi/.test(t) ? ['probability', 'descriptive'] : ['descriptive'];
    return result({
      status: 'unsupported',
      message: 'Ese tema todavía no está soportado: no puedo resolverlo sin inventar un resultado. Sí resuelvo estadística descriptiva, datos experimentales, tablas y gráficas, probabilidad y distribución normal, correlación y regresión lineal simple.',
      suggestions: close,
    });
  }

  // Puntaje por módulo
  const scores = {} as Record<ModuleId, number>;
  for (const m of allModules) scores[m] = RULES[m].reduce((s, [re, w]) => s + (re.test(t) ? w : 0), 0);

  // "medidas de dispersión" no es un diagrama de dispersión
  if (/medidas? de dispersion/.test(t) && !/(diagrama|grafico|grafica|nube) de dispersion|scatter/.test(t)) scores['tables-charts'] = 0;

  // "normal", "percentil" o "probabilidad": media y desviación son parámetros, no una serie de datos.
  if (scores.probability >= 3 && /\bnormal\b|percentil|probabilidad|cuantil/.test(t)) {
    scores.descriptive = 0;
    scores.experimental = 0;
  }

  const ranked = allModules.map((m) => ({ m, s: scores[m] })).sort((a, b) => b.s - a.s);
  const top = ranked[0];
  const second = ranked[1];
  const nums = extractNumbers(original);

  // Combinatoria explícita: C(10,3), "combinaciones de 10 en 3"
  const comb = t.match(/\bc\s*\(\s*(\d+)\s*[,;]\s*(\d+)\s*\)|combinaciones? de (\d+)\s*(?:en|tomados de|elementos tomados de|de)\s*(\d+)/);
  const perm = t.match(/\bp\s*\(\s*(\d+)\s*[,;]\s*(\d+)\s*\)|permutaciones? de (\d+)\s*(?:en|tomados de|elementos tomados de|de)\s*(\d+)/);

  if (top.s < 2) {
    if (comb || perm) {
      // se resuelve más abajo
    } else {
      return result({
        status: 'ambiguous',
        message: nums.length ? 'Veo números, pero no sé qué quieres calcular. ¿Qué necesitas: medidas descriptivas, una tabla o gráfica, probabilidad, o correlación y regresión?' : 'No entendí qué quieres calcular. Elige uno de los módulos o reescribe la pregunta indicando el cálculo (media, probabilidad normal, regresión…).',
        suggestions: allModules,
      });
    }
  }

  let module: ModuleId = top.m;
  if (comb || perm) module = 'probability';
  // Datos experimentales incluye lo descriptivo (con unidad e incertidumbre): no compiten entre sí.
  const pair = !(comb || perm) && top.s > 0 && [top.m, second.m].every((m) => m === 'descriptive' || m === 'experimental');
  if (pair) module = scores.experimental >= 3 ? 'experimental' : 'descriptive';
  const clearWinner = comb || perm || pair || top.s >= second.s * 1.5 || second.s === 0;
  const confidence = comb || perm ? 0.95 : Math.min(1, top.s / (top.s + second.s + 1) + 0.2);

  if (!clearWinner) {
    return result({
      status: 'ambiguous',
      message: `Tu pregunta podría ser de ${MODULE_LABELS[top.m]} o de ${MODULE_LABELS[second.m]}. ¿Cuál quieres usar?`,
      suggestions: [top.m, second.m],
      confidence,
    });
  }

  // Parámetros por módulo
  const params: QuestionParams = {};
  const understood: string[] = [`Módulo: ${MODULE_LABELS[module]}`];
  const measures = ['media', 'promedio', 'mediana', 'moda', 'rango', 'varianza', 'desviacion', 'cuartil'].filter((k) => t.includes(k));
  if (measures.length) params.measures = measures;
  if (/poblacional|poblacion/.test(t)) params.kind = 'poblacion';
  else if (/muestral|muestra/.test(t)) params.kind = 'muestra';

  let hasData = false;
  if (module === 'probability') {
    if (comb || perm) {
      const g = (comb ?? perm)!;
      params.n = Number(g[1] ?? g[3]);
      params.k = Number(g[2] ?? g[4]);
      params.combinatorics = comb ? 'combinaciones' : 'permutaciones';
      params.tab = 'clasica';
      hasData = true;
      understood.push(`${comb ? 'Combinaciones' : 'Permutaciones'} con n = ${params.n}, k = ${params.k}`);
    } else if (extractNormal(t, params)) {
      hasData = params.mu !== undefined || params.sigma !== undefined || params.normal !== undefined || params.percentile !== undefined;
      if (params.mu !== undefined) understood.push(`μ = ${params.mu}`);
      if (params.sigma !== undefined) understood.push(`σ = ${params.sigma}`);
      if (params.normal) understood.push(params.normal.type === 'entre' ? `P(${params.normal.a} < X < ${params.normal.b})` : params.normal.type === 'menor' ? `P(X < ${params.normal.a})` : `P(X > ${params.normal.a})`);
      if (params.percentile !== undefined) understood.push(`Percentil ${params.percentile}`);
    } else {
      params.tab = /bayes|condicional|complemento|evento|p\s*\(/.test(t) ? 'eventos' : /normal|z\b/.test(t) ? 'normal' : 'eventos';
      hasData = nums.length > 0;
    }
  } else if (module === 'regression') {
    extractPairs(original, params, nums);
    hasData = !!params.x?.length;
    if (hasData) understood.push(`${params.x!.length} pares (x, y)${params.pairsAssumed ? ' (primera mitad = x, segunda = y)' : ''}`);
  } else if (module === 'tables-charts') {
    params.chart = /dispersion|scatter/.test(t) ? 'dispersion' : /histograma/.test(t) ? 'histograma' : 'frecuencias';
    if (params.chart === 'dispersion') {
      extractPairs(original, params, nums);
      hasData = !!params.x?.length;
    } else {
      params.data = nums.map(toLabel);
      hasData = nums.length > 0;
    }
    if (hasData) understood.push(`${params.data?.length ?? params.x!.length} datos`);
  } else if (module === 'interpretation') {
    params.data = nums.map(toLabel);
    hasData = true;
    if (nums.length) understood.push(`${nums.length} datos para comparar σ y s`);
  } else {
    params.data = nums.map(toLabel);
    hasData = nums.length > 0;
    const unit = extractUnit(original);
    if (unit) {
      params.unit = unit;
      understood.push(`Unidad: ${unit}`);
    }
    if (hasData) understood.push(`${nums.length} datos`);
    if (params.kind) understood.push(`Desviación ${params.kind === 'muestra' ? 'muestral' : 'poblacional'}`);
  }

  if (!hasData && (REQUIRES_DATA.includes(module) || module === 'probability')) {
    return result({
      status: 'no-data',
      module,
      params,
      confidence,
      understood,
      message: `Entendí que quieres usar «${MODULE_LABELS[module]}», pero tu pregunta no incluye datos numéricos. Abro el módulo con los campos vacíos para que los escribas.`,
    });
  }

  return result({
    status: 'ok',
    module,
    params,
    confidence,
    understood,
    message: `Entendí: ${understood.join(' · ')}. Revisa los datos cargados y confirma el resultado.`,
  });
}
