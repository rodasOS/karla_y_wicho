import { describe, expect, it } from 'vitest';
import { parseData } from '../parsing/data-parser';
import { solveDescriptive } from './descriptive';
import { evalExpr } from './solution';

const CORRIENTE = '2.1, 2.3, 2.2, 2.4, 2.0';

function solve(text: string, extra = {}) {
  const p = parseData(text);
  return solveDescriptive({ values: p.values, labels: p.labels, ...extra });
}

describe('solveDescriptive', () => {
  it('ejemplo de corriente: respuestas y unidad', () => {
    const s = solve(CORRIENTE, { unit: 'A' });
    const get = (l: string) => s.answer.find((a) => a.label.startsWith(l))!;
    expect(get('Media').value).toBeCloseTo(2.2, 12);
    expect(get('Varianza muestral').value).toBeCloseTo(0.025, 12);
    expect(get('Desviación estándar muestral').value).toBeCloseTo(0.1581138830084, 10);
    expect(get('Desviación estándar poblacional').value).toBeCloseTo(0.1414213562373, 10);
    expect(get('Media').unit).toBe('A');
    expect(s.interpretation.join(' ')).toContain('2.2000 A');
    expect(s.interpretation.join(' ')).toMatch(/7\.2 %/);
  });

  it('cada sustitución reproduce el resultado numérico del paso', () => {
    for (const text of [CORRIENTE, '2, 3, 3, 5, 7', '1, 2, 3, 4', '-3.5, 2, 8.25, 4, -1, 7', '10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130']) {
      const s = solve(text);
      for (const step of s.steps) {
        if (!step.substitutionExpr) continue;
        expect(evalExpr(step.substitutionExpr), `${step.label} (${text})`).toBeCloseTo(step.result, 8);
      }
    }
  });

  it('sustitución de la media: texto del spec', () => {
    const s = solve(CORRIENTE);
    const media = s.steps[0];
    expect(media.formulaTex).toContain('\\sum x_i');
    expect(media.substitutionTex).toContain('2.1 + 2.3 + 2.2 + 2.4 + 2.0');
    expect(media.result).toBeCloseTo(2.2, 12);
  });

  it('usa el texto original del usuario (coma decimal)', () => {
    const s = solve('2,1; 2,3 2,2');
    expect(s.steps[0].substitutionTex).toContain('2.1 + 2.3 + 2.2');
  });

  it('sin moda y bimodal', () => {
    const a = solve('1, 2, 3, 4');
    expect(a.steps.find((x) => x.label === 'Moda')!.resultText).toBe('No hay moda');
    expect(a.warnings.map((w) => w.code)).toContain('sin-moda');
    const b = solve('1, 1, 2, 2, 3');
    expect(b.steps.find((x) => x.label === 'Moda')!.resultText).toBe('1 y 2 (bimodal)');
  });

  it('n = 1: advierte y omite la muestral', () => {
    const s = solve('5');
    expect(s.warnings.map((w) => w.code)).toContain('n-insuficiente');
    expect(s.steps.some((x) => x.label.includes('muestral'))).toBe(false);
    expect(s.answer.find((a) => a.label.includes('poblacional (σ)'))!.value).toBe(0);
  });

  it('atípicos: advierte sin excluir', () => {
    const s = solve('2.1, 2.2, 2.1, 2.3, 9.8');
    expect(s.warnings.map((w) => w.code)).toContain('atipicos');
    expect(s.answer.find((a) => a.label === 'Media')!.value).toBeCloseTo(3.7, 12);
  });

  it('sin datos lanza error', () => {
    expect(() => solveDescriptive({ values: [] })).toThrow(RangeError);
  });
});
