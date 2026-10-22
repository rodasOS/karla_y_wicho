import { describe, expect, it } from 'vitest';
import { parseData } from '../parsing/data-parser';
import { quantitySymbol, solveExperimental } from './experimental';
import { evalExpr } from './solution';

const solve = (text: string, extra = {}) => {
  const p = parseData(text);
  return solveExperimental({ values: p.values, labels: p.labels, ...extra });
};

describe('solveExperimental', () => {
  it('serie de corriente: I = 2.20 ± 0.07 A', () => {
    const s = solve('2.1, 2.3, 2.2, 2.4, 2.0', { unit: 'A' });
    const main = s.answer.find((a) => a.primary)!;
    expect(main.text).toBe('I = 2.20 ± 0.07 A');
    expect(s.answer.find((a) => a.label.startsWith('Media'))!.unit).toBe('A');
    expect(s.answer.find((a) => a.label.startsWith('Desviación'))!.value).toBeCloseTo(0.1581138830084, 10);
    expect(s.answer.find((a) => a.label.startsWith('Error estándar'))!.value).toBeCloseTo(0.0707106781187, 10);
  });

  it('el cálculo de s/√n está a la vista y es consistente', () => {
    const s = solve('2.1, 2.3, 2.2, 2.4, 2.0', { unit: 'A' });
    const step = s.steps.find((x) => x.label.startsWith('Error estándar'))!;
    expect(step.substitutionTex).toContain('\\sqrt{5}');
    expect(evalExpr(step.substitutionExpr!)).toBeCloseTo(step.result, 10);
  });

  it('conversión A → mA multiplica por 1000 y muestra el factor', () => {
    const s = solve('2.1, 2.3, 2.2, 2.4, 2.0', { unit: 'A', convertTo: 'mA' });
    const conv = s.steps.find((x) => x.label.startsWith('Conversión'))!;
    expect(conv.result).toBeCloseTo(1000, 9);
    expect(conv.procedure.join(' ')).toContain('1000');
    expect(s.answer.find((a) => a.label === 'Media en mA')!.value).toBeCloseTo(2200, 9);
    expect(s.answer.find((a) => a.label === 's en mA')!.value).toBeCloseTo(158.1138830084, 7);
  });

  it('conversión A → m es rechazada con advertencia y sin convertir', () => {
    const s = solve('2.1, 2.3, 2.2, 2.4, 2.0', { unit: 'A', convertTo: 'm' });
    expect(s.warnings.find((w) => w.code === 'conversion')!.message).toMatch(/magnitudes distintas/);
    expect(s.steps.some((x) => x.label.startsWith('Conversión'))).toBe(false);
  });

  it('sin unidad: calcula y avisa', () => {
    const s = solve('2.1, 2.3, 2.2');
    expect(s.warnings.map((w) => w.code)).toContain('sin-unidad');
    expect(s.answer[0].text).toMatch(/^x = /);
  });

  it('valor atípico: advierte sin excluir', () => {
    const s = solve('2.1, 2.2, 2.1, 2.3, 9.8', { unit: 'A' });
    expect(s.warnings.some((w) => w.code === 'atipicos' && w.message.includes('9.8'))).toBe(true);
    expect(s.answer.find((a) => a.label.startsWith('Media'))!.value).toBeCloseTo(3.7, 12);
  });

  it('símbolos por magnitud y mínimo de datos', () => {
    expect(quantitySymbol('mV')).toBe('V');
    expect(quantitySymbol('kΩ')).toBe('R');
    expect(quantitySymbol('foo')).toBe('x');
    expect(() => solveExperimental({ values: [1] })).toThrow(RangeError);
  });
});
