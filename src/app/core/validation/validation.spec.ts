import { describe, expect, it } from 'vitest';
import { parseData, parsePairs } from '../parsing/data-parser';
import { merge, validateCount, validatePairs, validateProbability, validateSampleSd, validateSeries, validateSigma } from './validation';

describe('validación de entradas', () => {
  it('campo vacío → faltan datos', () => {
    const v = validateSeries(parseData(''));
    expect(v.ok).toBe(false);
    expect(v.errors[0].code).toBe('faltan-datos');
  });

  it('texto en lugar de número señala el token', () => {
    const v = validateSeries(parseData('2.1, abc, 2.3'));
    expect(v.ok).toBe(false);
    expect(v.errors[0].message).toContain('"abc"');
    expect(v.errors[0].message).toContain('n.º 2');
  });

  it('n mínimo', () => {
    expect(validateSeries(parseData('5'), 2).errors[0].code).toBe('n-insuficiente');
    expect(validateSeries(parseData('5 6'), 2).ok).toBe(true);
    expect(validateSampleSd(1).warnings[0].message).toMatch(/n ≥ 2/);
    expect(validateSampleSd(2).warnings).toHaveLength(0);
  });

  it('pares: longitudes, mínimo, vacíos y errores por eje', () => {
    expect(validatePairs(parsePairs('1 2 3', '1 2')).errors[0].code).toBe('longitudes');
    expect(validatePairs(parsePairs('1 2', '1 2')).errors[0].message).toMatch(/al menos 3 pares/);
    expect(validatePairs(parsePairs('1 2', '1 2'), 2).ok).toBe(true);
    expect(validatePairs(parsePairs('', '1 2 3')).errors[0].message).toContain('x');
    expect(validatePairs(parsePairs('1 a 3', '1 2 3')).errors[0].message).toMatch(/^En x/);
    expect(validatePairs(parsePairs('1 2 3', '1 2 3')).ok).toBe(true);
  });

  it('σ ≤ 0 y probabilidades fuera de [0,1]', () => {
    expect(validateSigma(0).errors[0].code).toBe('sigma-invalida');
    expect(validateSigma(-2).ok).toBe(false);
    expect(validateSigma(null).errors[0].code).toBe('faltan-datos');
    expect(validateSigma(15).ok).toBe(true);
    expect(validateProbability(1.2).errors[0].code).toBe('probabilidad-invalida');
    expect(validateProbability(-0.1).ok).toBe(false);
    expect(validateProbability(0.5).ok).toBe(true);
    expect(validateProbability(null, 'P(A)').errors[0].message).toContain('P(A)');
  });

  it('conteos enteros y combinación de validaciones', () => {
    expect(validateCount(2.5, 'n').errors[0].code).toBe('entero-invalido');
    expect(validateCount(-1, 'n').ok).toBe(false);
    expect(validateCount(10, 'n').ok).toBe(true);
    expect(merge(validateSigma(0), validateProbability(2)).errors).toHaveLength(2);
  });
});
