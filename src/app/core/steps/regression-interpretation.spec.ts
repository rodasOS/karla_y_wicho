import { describe, expect, it } from 'vitest';
import { parseData } from '../parsing/data-parser';
import { solveSdComparison } from './interpretation';
import { equationText, solveRegression } from './regression';
import { Solution, evalExpr } from './solution';

function consistent(s: Solution) {
  for (const step of s.steps) {
    if (!step.substitutionExpr) continue;
    expect(evalExpr(step.substitutionExpr), step.label).toBeCloseTo(step.result, 8);
  }
}
const reg = (xt: string, yt: string, extra = {}) => {
  const x = parseData(xt);
  const y = parseData(yt);
  return solveRegression({ x: x.values, y: y.values, xLabels: x.labels, yLabels: y.labels, ...extra });
};
const get = (s: Solution, label: string) => s.answer.find((a) => a.label.startsWith(label))!;

describe('solveRegression', () => {
  it('caso de referencia (SciPy): b=1.99, a=0.05, r, R²', () => {
    const s = reg('1 2 3 4 5', '2.1 3.9 6.2 7.8 10.1');
    expect(get(s, 'Pendiente').value).toBeCloseTo(1.99, 12);
    expect(get(s, 'Intercepto').value).toBeCloseTo(0.05, 12);
    expect(get(s, 'Correlación').value).toBeCloseTo(0.9986517555689656, 12);
    expect(get(s, 'Determinación').value).toBeCloseTo(0.997305328900977, 12);
    expect(get(s, 'Ecuación').text).toBe('ŷ = 0.0500 + 1.9900x');
    consistent(s);
  });

  it('correlación perfecta r = 1 y pendiente negativa en la ecuación', () => {
    expect(get(reg('1 2 3 4', '2 4 6 8'), 'Correlación').value).toBeCloseTo(1, 12);
    expect(equationText(10, -2, 2)).toBe('ŷ = 10.00 − 2.00x');
    consistent(reg('1 2 3 4', '8 6 4 2'));
  });

  it('interpretación con unidades: V contra A', () => {
    const s = reg('1 2 3 4 5', '2.1 3.9 6.2 7.8 10.1', { unitX: 'A', unitY: 'V' });
    expect(s.interpretation.join(' ')).toContain('por cada 1 A de aumento en x, y cambia en promedio 1.9900 V');
    expect(s.interpretation.join(' ')).toContain('causalidad');
    expect(get(s, 'Pendiente').unit).toBe('V/A');
  });

  it('extrapolación y pocos pares avisan', () => {
    const s = reg('1 2 3 4', '2 4 6 9', { predictAt: 10 });
    expect(s.warnings.map((w) => w.code)).toEqual(expect.arrayContaining(['extrapolacion', 'pocos-pares']));
    // b = 11.5/5 = 2.3, a = 5.25 − 2.3·2.5 = −0.5 → ŷ(10) = 22.5
    expect(get(s, 'ŷ').value).toBeCloseTo(22.5, 12);
    consistent(s);
    const dentro = reg('1 2 3 4 5', '2 4 6 8 11', { predictAt: 3.5 });
    expect(dentro.warnings.map((w) => w.code)).not.toContain('extrapolacion');
  });

  it('y constante: r indefinido pero hay recta', () => {
    const s = reg('1 2 3', '5 5 5');
    expect(s.warnings.map((w) => w.code)).toContain('r-indefinido');
    expect(get(s, 'Pendiente').value).toBeCloseTo(0, 12);
  });

  it('menos de 3 pares o x constante lanzan error', () => {
    expect(() => reg('1 2', '1 2')).toThrow(/al menos 3 pares/);
    expect(() => reg('2 2 2', '1 2 3')).toThrow(/constante/);
    expect(() => reg('1 2 3', '1 2')).toThrow(RangeError);
  });
});

describe('solveSdComparison', () => {
  it('ejemplo de corriente: σ=0.1414 y s=0.1581, factor √(5/4)', () => {
    const p = parseData('2.1, 2.3, 2.2, 2.4, 2.0');
    const s = solveSdComparison({ values: p.values, labels: p.labels, unit: 'A' });
    expect(get(s, 'Desviación muestral').value).toBeCloseTo(0.1581138830084, 10);
    expect(get(s, 'Desviación poblacional').value).toBeCloseTo(0.1414213562373, 10);
    const rel = s.steps.find((x) => x.label.startsWith('Relación'))!;
    expect(rel.result).toBeCloseTo(Math.sqrt(5 / 4), 12);
    expect(get(s, 'Diferencia relativa').value).toBeCloseTo(11.8034, 3);
    consistent(s);
    expect(s.interpretation.join(' ')).toContain('0.1581 A');
  });

  it('con n grande la diferencia es pequeña', () => {
    const xs = Array.from({ length: 50 }, (_, i) => i);
    const s = solveSdComparison({ values: xs });
    expect(s.interpretation.join(' ')).toContain('pequeña porque n es grande');
  });

  it('n < 2 lanza error', () => {
    expect(() => solveSdComparison({ values: [3] })).toThrow(RangeError);
  });
});
