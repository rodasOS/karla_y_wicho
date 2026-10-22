import { describe, expect, it } from 'vitest';
import { frequencyByIntervals, frequencyByValue, sturgesClasses, suggestsDiscrete } from './frequency';
import { formatFixed, reportMeasurement, roundSignificant, roundTo } from './rounding';
import { compatibleUnits, conversionFactor, parseUnit } from './units';
import { standardError, mean } from './stats';

describe('unidades', () => {
  it('reconoce bases y prefijos', () => {
    expect(parseUnit('A')).toMatchObject({ dimension: 'corriente', toBase: 1 });
    expect(parseUnit('mA')).toMatchObject({ dimension: 'corriente', toBase: 1e-3 });
    expect(parseUnit('m')).toMatchObject({ dimension: 'longitud', toBase: 1 });
    expect(parseUnit('mm')).toMatchObject({ dimension: 'longitud', toBase: 1e-3 });
    expect(parseUnit('kg')).toMatchObject({ dimension: 'masa', toBase: 1e3 });
    expect(parseUnit('kΩ')).toMatchObject({ dimension: 'resistencia', toBase: 1e3 });
    expect(parseUnit('ms')).toMatchObject({ dimension: 'tiempo', toBase: 1e-3 });
    expect(parseUnit('Pa')).toMatchObject({ dimension: 'presión' });
    expect(parseUnit('xyz')).toBeNull();
    expect(parseUnit('')).toBeNull();
  });

  it('A → mA multiplica por 1000', () => {
    const c = conversionFactor('A', 'mA');
    expect(c.ok && c.factor).toBeCloseTo(1000, 9);
    const back = conversionFactor('mA', 'kA');
    expect(back.ok && back.factor).toBeCloseTo(1e-6, 15);
  });

  it('A → m es incompatible', () => {
    const c = conversionFactor('A', 'm');
    expect(c.ok).toBe(false);
    if (!c.ok) {
      expect(c.reason).toBe('incompatible');
      expect(c.message).toMatch(/magnitudes distintas/);
    }
  });

  it('unidad desconocida y sugerencias', () => {
    const c = conversionFactor('A', 'foo');
    expect(!c.ok && c.reason).toBe('desconocida');
    expect(compatibleUnits('A')).toContain('mA');
    expect(compatibleUnits('A')).not.toContain('m');
  });
});

describe('redondeo y reporte de medición', () => {
  it('redondeo estable', () => {
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(-1.005, 2)).toBe(-1.01);
    expect(roundTo(2.675, 2)).toBe(2.68);
    expect(formatFixed(-0.0001, 2)).toBe('0.00');
    expect(formatFixed(Number.NaN, 2)).toBe('—');
    expect(roundSignificant(0.0707, 1)).toBeCloseTo(0.07, 12);
  });

  it('I = 2.20 ± 0.07 A para la serie de corriente', () => {
    const xs = [2.1, 2.3, 2.2, 2.4, 2.0];
    const rep = reportMeasurement(mean(xs), standardError(xs));
    expect(rep.value).toBe('2.20');
    expect(rep.uncertainty).toBe('0.07');
    expect(rep.uncertaintySigFigs).toBe(1);
  });

  it('incertidumbre que empieza en 1 usa 2 cifras', () => {
    const rep = reportMeasurement(12.3456, 0.0143);
    expect(rep.uncertainty).toBe('0.014');
    expect(rep.value).toBe('12.346');
  });

  it('incertidumbre grande y cero', () => {
    expect(reportMeasurement(1234.5, 25).uncertainty).toBe('25');
    expect(reportMeasurement(5, 0).uncertainty).toBe('0');
  });
});

describe('tablas de frecuencias', () => {
  const datos = [12, 15, 17, 18, 20, 21, 22, 22, 25, 27, 28, 30, 31, 33, 35, 36, 38, 40, 41, 44, 45, 47, 48, 50, 52, 54, 55, 58, 60, 62];

  it('Sturges para n = 30 → 6 clases', () => {
    expect(sturgesClasses(30)).toBe(6);
    const t = frequencyByIntervals(datos);
    expect(t.sturges).toBe(true);
    expect(t.k).toBe(6);
    expect(t.width).toBeCloseTo((62 - 12) / 6, 12);
  });

  it('Σf = n y Σfr = 1 con clases automáticas y manuales', () => {
    for (const k of [undefined, 3, 5, 8]) {
      const t = frequencyByIntervals(datos, k);
      expect(t.classes.reduce((s, c) => s + c.f, 0)).toBe(datos.length);
      expect(t.classes.reduce((s, c) => s + c.fr, 0)).toBeCloseTo(1, 12);
      expect(t.classes.at(-1)!.F).toBe(datos.length);
      expect(t.classes.at(-1)!.Fr).toBeCloseTo(1, 12);
    }
  });

  it('el máximo cae en la última clase', () => {
    const t = frequencyByIntervals([0, 5, 10], 2);
    expect(t.classes.map((c) => c.f)).toEqual([1, 2]);
  });

  it('todos iguales y entradas inválidas', () => {
    expect(frequencyByIntervals([3, 3, 3]).classes).toHaveLength(1);
    expect(() => frequencyByIntervals([])).toThrow(RangeError);
    expect(() => frequencyByIntervals([1, 2], 0)).toThrow(RangeError);
    expect(() => frequencyByIntervals([1, 2], 2.5)).toThrow(RangeError);
  });

  it('tabla por valor para pocos valores distintos', () => {
    const xs = [1, 2, 2, 3, 3, 3];
    expect(suggestsDiscrete(xs)).toBe(true);
    const t = frequencyByValue(xs);
    expect(t.classes.map((c) => [c.midpoint, c.f, c.F])).toEqual([
      [1, 1, 1],
      [2, 2, 3],
      [3, 3, 6],
    ]);
  });
});
