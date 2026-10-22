import { describe, expect, it } from 'vitest';
import { cdf, quantile } from '../math/normal';
import { linearRegression } from '../math/regression';
import { mean, standardError, stdDev, median, range, variance } from '../math/stats';
import { parseData } from '../parsing/data-parser';
import { checkAnswer, parseAnswer } from './check';
import { Exercise, Level, PRACTICE_MODULES, generateExercise } from './exercises';

const LEVELS: Level[] = ['basico', 'intermedio'];
const nums = (s: string) => parseData(s).values;

/** Recalcula la respuesta con las funciones matemáticas, leyendo los datos del enunciado (ruta independiente del motor de pasos). */
function independent(ex: Exercise): number {
  const t = ex.title;
  const st = ex.statement;
  if (ex.module === 'descriptive' || ex.module === 'experimental') {
    const xs = nums(st.slice(st.indexOf(':') + 1).replace(/\.( Considera| Estos).*/, '').replace(/\.$/, '').replace(/\s*(años|s|A|V|cm)\s*\.?$/, ''));
    if (t === 'Media' || t === 'Valor medio de las mediciones') return mean(xs);
    if (t === 'Mediana') return median(xs);
    if (t === 'Rango') return range(xs);
    if (t.startsWith('Desviación estándar muestral')) return stdDev(xs, true);
    if (t.startsWith('Varianza')) return variance(xs, true);
    if (t.startsWith('Desviación estándar poblacional')) return stdDev(xs, false);
    if (t.startsWith('Error estándar')) return standardError(xs);
  }
  if (ex.module === 'regression') {
    const m = st.match(/x: (.*)\. y: (.*)\.$/)!;
    const reg = linearRegression(nums(m[1]), nums(m[2]));
    return t.startsWith('Pendiente') ? reg.slope : reg.r;
  }
  const mu = Number(st.match(/μ = (\d+)/)?.[1]);
  const sg = Number(st.match(/σ = (\d+)/)?.[1]);
  const q = ex.question;
  if (t === 'Combinaciones') {
    const [, n, k] = q.match(/C\((\d+), (\d+)\)/)!.map(Number);
    let c = 1;
    for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i;
    return Math.round(c);
  }
  if (t === 'Probabilidad acumulada normal') return cdf((Number(q.match(/P\(X < (-?[\d.]+)\)/)![1]) - mu) / sg);
  if (t === 'Probabilidad en un intervalo') {
    const [, a, b] = q.match(/P\((-?[\d.]+) < X < (-?[\d.]+)\)/)!.map(Number);
    return cdf((b - mu) / sg) - cdf((a - mu) / sg);
  }
  if (t === 'Percentil de la normal') return quantile(Number(q.match(/percentil ([\d.]+)/)![1]) / 100, mu, sg);
  if (t === 'Cola derecha de la normal') return 1 - cdf((Number(q.match(/P\(X > (-?[\d.]+)\)/)![1]) - mu) / sg);
  throw new Error('ejercicio no reconocido: ' + t);
}

describe('generador de prácticas', () => {
  it('la respuesta esperada coincide con el cálculo independiente en 500 semillas por módulo y nivel', () => {
    for (const m of PRACTICE_MODULES) {
      for (const level of LEVELS) {
        for (let seed = 1; seed <= 500; seed++) {
          const ex = generateExercise(m.id, level, seed * 7919);
          expect(ex.expected, `${m.id}/${level}/${seed}: ${ex.title}`).toBeCloseTo(independent(ex), 9);
          expect(Number.isFinite(ex.expected)).toBe(true);
        }
      }
    }
  });

  it('misma semilla → mismo ejercicio; semillas distintas → enunciados distintos', () => {
    const a = generateExercise('descriptive', 'basico', 42);
    const b = generateExercise('descriptive', 'basico', 42);
    expect(a.statement).toBe(b.statement);
    const distintos = new Set(Array.from({ length: 30 }, (_, i) => generateExercise('descriptive', 'basico', i + 1).statement));
    expect(distintos.size).toBeGreaterThan(25);
  });

  it('cada ejercicio trae solución completa con pasos e interpretación', () => {
    for (const m of PRACTICE_MODULES) {
      const ex = generateExercise(m.id, 'intermedio', 5);
      expect(ex.solution.steps.length).toBeGreaterThan(0);
      expect(ex.solution.interpretation.length).toBeGreaterThan(0);
      expect(ex.question.length).toBeGreaterThan(5);
    }
  });
});

describe('comprobación de respuestas', () => {
  const ex = generateExercise('descriptive', 'intermedio', 11);

  it('respuesta correcta (con coma decimal y unidad)', () => {
    const v = ex.expected;
    expect(checkAnswer(ex, v.toFixed(3)).status).toBe('correct');
    expect(checkAnswer(ex, v.toFixed(2).replace('.', ',')).status).toBe('correct');
    expect(checkAnswer(ex, `${v.toFixed(2)} ${ex.unit ?? 'u'}`).status).toBe('correct');
  });

  it('incorrecta: da pista y cuenta como intento', () => {
    const r = checkAnswer(ex, String(ex.expected * 3 + 5));
    expect(r.status).toBe('incorrect');
    expect(r.hint).toBeTruthy();
    expect(r.counts).toBe(true);
  });

  it('reconoce el error n frente a n − 1', () => {
    let visto = false;
    for (let seed = 1; seed < 40 && !visto; seed++) {
      const e = generateExercise('descriptive', 'intermedio', seed);
      if (!e.title.startsWith('Desviación estándar muestral')) continue;
      const pop = e.commonErrors.find((c) => c.hint.includes('n en lugar de n − 1'))!;
      const r = checkAnswer(e, String(pop.value));
      expect(r.status).toBe('incorrect');
      expect(r.hint).toContain('n en lugar de n − 1');
      visto = true;
    }
    expect(visto).toBe(true);
  });

  it('no numérico: se pide un número y no cuenta el intento', () => {
    for (const raw of ['', '   ', 'abc', 'dos punto dos']) {
      const r = checkAnswer(ex, raw);
      expect(r.status).toBe('invalid');
      expect(r.counts).toBe(false);
    }
  });

  it('parseAnswer', () => {
    expect(parseAnswer('2,25')).toBe(2.25);
    expect(parseAnswer('-3.5 A')).toBe(-3.5);
    expect(parseAnswer('x')).toBeNull();
    expect(parseAnswer('1.2.3')).toBeNull();
  });
});
