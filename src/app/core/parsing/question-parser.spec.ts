import { describe, expect, it } from 'vitest';
import { parseQuestion } from './question-parser';

describe('question-parser', () => {
  it('spec: media y desviación muestral → descriptiva con los 5 datos', () => {
    const r = parseQuestion('calcula la media y la desviación estándar muestral de 2.1, 2.3, 2.2, 2.4 y 2.0');
    expect(r.status).toBe('ok');
    expect(r.module).toBe('descriptive');
    expect(r.params.data).toEqual(['2.1', '2.3', '2.2', '2.4', '2']);
    expect(r.params.kind).toBe('muestra');
  });

  it('mediciones de corriente con unidad → datos experimentales', () => {
    const r = parseQuestion('Con mediciones de corriente (A): 2.1, 2.3, 2.2, 2.4 y 2.0; calcula media, desviación estándar muestral e interpreta.');
    expect(r.module).toBe('experimental');
    expect(r.params.unit).toBe('A');
    expect(r.params.data).toHaveLength(5);
  });

  it('mediana y moda', () => {
    const r = parseQuestion('¿Cuál es la mediana y la moda de 4 8 8 15 16?');
    expect(r.module).toBe('descriptive');
    expect(r.params.data).toEqual(['4', '8', '8', '15', '16']);
    expect(r.params.measures).toEqual(expect.arrayContaining(['mediana', 'moda']));
  });

  it('desviación poblacional', () => {
    expect(parseQuestion('varianza poblacional de 1, 2, 3, 4').params.kind).toBe('poblacion');
  });

  it('histograma con datos', () => {
    const r = parseQuestion('haz un histograma de 12 15 17 18 20 21 22 25');
    expect(r.module).toBe('tables-charts');
    expect(r.params.chart).toBe('histograma');
    expect(r.params.data).toHaveLength(8);
  });

  it('tabla de frecuencias', () => {
    const r = parseQuestion('construye una tabla de frecuencias para 3, 4, 4, 5, 5, 5, 6');
    expect(r.module).toBe('tables-charts');
    expect(r.params.chart).toBe('frecuencias');
  });

  it('"medidas de dispersión" no es diagrama de dispersión', () => {
    expect(parseQuestion('medidas de dispersión de 3, 5, 9').module).toBe('descriptive');
  });

  it('diagrama de dispersión con x e y', () => {
    const r = parseQuestion('diagrama de dispersión con x = 1, 2, 3, 4 y y = 2, 4, 5, 8');
    expect(r.module).toBe('tables-charts');
    expect(r.params.chart).toBe('dispersion');
    expect(r.params.x).toEqual(['1', '2', '3', '4']);
    expect(r.params.y).toEqual(['2', '4', '5', '8']);
  });

  it('normal: P(X < a) con μ y σ', () => {
    const r = parseQuestion('En una normal con media 100 y desviación estándar 15, probabilidad de que X sea menor que 115');
    expect(r.module).toBe('probability');
    expect(r.params).toMatchObject({ mu: 100, sigma: 15, tab: 'normal', normal: { type: 'menor', a: 115 } });
  });

  it('normal: intervalo y mayor que', () => {
    expect(parseQuestion('distribución normal μ=100 σ=15 probabilidad entre 85 y 115').params.normal).toEqual({ type: 'entre', a: 85, b: 115 });
    expect(parseQuestion('normal mu = 50 sigma = 5, probabilidad mayor que 60').params.normal).toEqual({ type: 'mayor', a: 60 });
  });

  it('percentil inverso', () => {
    const r = parseQuestion('percentil 95 de una normal con media 100 y desviación 15');
    expect(r.params).toMatchObject({ percentile: 95, tab: 'inverso', mu: 100, sigma: 15 });
  });

  it('combinaciones y permutaciones', () => {
    expect(parseQuestion('¿cuántas combinaciones de 10 en 3?').params).toMatchObject({ n: 10, k: 3, combinatorics: 'combinaciones', tab: 'clasica' });
    expect(parseQuestion('C(10,3)').params).toMatchObject({ n: 10, k: 3, combinatorics: 'combinaciones' });
    expect(parseQuestion('permutaciones de 5 en 2').params).toMatchObject({ n: 5, k: 2, combinatorics: 'permutaciones' });
  });

  it('probabilidad de eventos', () => {
    const r = parseQuestion('probabilidad de la unión de eventos con P(A)=0.5, P(B)=0.3');
    expect(r.module).toBe('probability');
    expect(r.params.tab).toBe('eventos');
  });

  it('correlación y regresión con x e y', () => {
    const r = parseQuestion('regresión lineal con x: 1,2,3,4,5 y y: 2.1,3.9,6.2,7.8,10.1');
    expect(r.module).toBe('regression');
    expect(r.params.x).toHaveLength(5);
    expect(r.params.y).toEqual(['2.1', '3.9', '6.2', '7.8', '10.1']);
  });

  it('pares sin etiquetas: primera mitad x, segunda y (avisa)', () => {
    const r = parseQuestion('correlación de 1 2 3 4 5 6 2 4 6 8 10 12');
    expect(r.params.pairsAssumed).toBe(true);
    expect(r.params.x).toHaveLength(6);
  });

  it('interpretación: poblacional vs muestral', () => {
    const r = parseQuestion('¿Cuál es la diferencia entre desviación poblacional y muestral?');
    expect(r.module).toBe('interpretation');
    expect(r.status).toBe('ok');
    expect(parseQuestion('por qué se divide entre n-1').module).toBe('interpretation');
  });

  it('sin datos: abre el módulo y avisa', () => {
    const r = parseQuestion('calcula la media y la desviación estándar');
    expect(r.status).toBe('no-data');
    expect(r.module).toBe('descriptive');
    expect(r.message).toMatch(/no incluye datos/);
  });

  it('ambigua: pregunta qué calcular', () => {
    const r = parseQuestion('hola, necesito ayuda con 3, 5, 9');
    expect(r.status).toBe('ambiguous');
    expect(r.suggestions.length).toBeGreaterThan(3);
    expect(parseQuestion('').status).toBe('ambiguous');
    expect(parseQuestion('   ').status).toBe('ambiguous');
  });

  it('fuera de alcance: lo declara y sugiere', () => {
    const r = parseQuestion('hazme una prueba de hipótesis para la media de 3, 4, 5');
    expect(r.status).toBe('unsupported');
    expect(r.module).toBeUndefined();
    expect(r.message).toMatch(/no está soportado/);
    expect(r.suggestions).toContain('descriptive');
    expect(parseQuestion('ANOVA de tres grupos').status).toBe('unsupported');
  });

  it('insensible a tildes y mayúsculas', () => {
    expect(parseQuestion('DESVIACIÓN ESTÁNDAR de 1 2 3').module).toBe('descriptive');
  });
});
