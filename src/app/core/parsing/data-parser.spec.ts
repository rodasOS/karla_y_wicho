import { describe, expect, it } from 'vitest';
import { extractNumbers, parseData, parsePairs } from './data-parser';

describe('data-parser', () => {
  it('lista con comas y espacios', () => {
    const r = parseData('2.1, 2.3, 2.2, 2.4, 2.0');
    expect(r.values).toEqual([2.1, 2.3, 2.2, 2.4, 2.0]);
    expect(r.labels).toEqual(['2.1', '2.3', '2.2', '2.4', '2.0']);
    expect(r.errors).toHaveLength(0);
    expect(r.decimalComma).toBe(false);
  });

  it('separadores mezclados con coma decimal (spec)', () => {
    const r = parseData('2,1; 2,3  2.2\n2.4');
    expect(r.values).toEqual([2.1, 2.3, 2.2, 2.4]);
    expect(r.decimalComma).toBe(true);
    expect(r.labels[0]).toBe('2.1');
  });

  it('comas sin espacio separan datos', () => {
    expect(parseData('1,2,3').values).toEqual([1, 2, 3]);
    expect(parseData('2.1,2.3').values).toEqual([2.1, 2.3]);
  });

  it('coma decimal separada por espacios o líneas', () => {
    expect(parseData('2,1 2,3 2,2').values).toEqual([2.1, 2.3, 2.2]);
    expect(parseData('2,1\n2,3').values).toEqual([2.1, 2.3]);
  });

  it('lista vertical con comas finales', () => {
    expect(parseData('1,\n2,\n3').values).toEqual([1, 2, 3]);
  });

  it('texto no numérico se reporta por token sin calcular', () => {
    const r = parseData('2.1, abc, 2.3');
    expect(r.values).toEqual([2.1, 2.3]);
    expect(r.errors).toEqual([{ token: 'abc', index: 1, message: '"abc" no es un número válido.' }]);
  });

  it('vacío y solo separadores', () => {
    expect(parseData('').empty).toBe(true);
    expect(parseData('  \n ; , ').empty).toBe(true);
    expect(parseData('  \n ; , ').values).toEqual([]);
  });

  it('negativos, notación científica y signo menos unicode', () => {
    expect(parseData('-1.5 +2 1e3 −4').values).toEqual([-1.5, 2, 1000, -4]);
  });

  it('rechaza Infinity, NaN y números mal formados', () => {
    const r = parseData('Infinity NaN 1.2.3 5-');
    expect(r.values).toEqual([]);
    expect(r.errors).toHaveLength(4);
  });

  it('pares: longitudes distintas y válidos', () => {
    expect(parsePairs('1 2 3', '1 2').lengthMismatch).toBe(true);
    expect(parsePairs('1 2 3', '1 2').valid).toBe(false);
    expect(parsePairs('1 2 3', '2 4 6').valid).toBe(true);
    expect(parsePairs('', '1').valid).toBe(false);
    expect(parsePairs('1 x 3', '1 2 3').valid).toBe(false);
  });

  it('extractNumbers de texto libre', () => {
    expect(extractNumbers('calcula la media de 2.1, 2.3, 2.2, 2.4 y 2.0')).toEqual([2.1, 2.3, 2.2, 2.4, 2.0]);
    expect(extractNumbers('media de 2,1 2,3 y 2,2')).toEqual([2.1, 2.3, 2.2]);
    expect(extractNumbers('sin datos aquí')).toEqual([]);
    expect(extractNumbers('mu = 100 y sigma = 15')).toEqual([100, 15]);
  });
});
