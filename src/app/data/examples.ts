/** Catálogo de ejercicios de ejemplo: cada uno abre su módulo con los datos precargados. */
export interface ExampleItem {
  id: string;
  title: string;
  module: string;
  description: string;
  route: string;
  queryParams: Record<string, string>;
  /** Resultado esperado (para que el estudiante verifique). */
  expected: string;
}

const NOTAS = '55, 62, 70, 70, 78, 85, 91';
const TREINTA = '12, 15, 17, 18, 20, 21, 22, 22, 25, 27, 28, 30, 31, 33, 35, 36, 38, 40, 41, 44, 45, 47, 48, 50, 52, 54, 55, 58, 60, 62';

export const EXAMPLES: ExampleItem[] = [
  { id: 'corriente', title: 'Corriente eléctrica (ejemplo de la asignatura)', module: 'Datos experimentales', description: 'Cinco mediciones de corriente: 2.1, 2.3, 2.2, 2.4 y 2.0 A. Media, desviación muestral e interpretación.', route: '/experimentales', queryParams: { datos: '2.1, 2.3, 2.2, 2.4, 2.0', unidad: 'A' }, expected: 'x̄ = 2.2 A · s = 0.1581 A · I = 2.20 ± 0.07 A' },
  { id: 'notas', title: 'Notas de un examen', module: 'Estadística descriptiva', description: 'Media, mediana y moda de siete notas con una moda repetida.', route: '/descriptiva', queryParams: { datos: NOTAS }, expected: 'Media 73 · Mediana 70 · Moda 70' },
  { id: 'edades', title: 'Edades de toda una sección', module: 'Estadística descriptiva', description: 'Los datos son toda la población: se destaca la desviación poblacional σ.', route: '/descriptiva', queryParams: { datos: '19, 20, 20, 21, 22, 22, 23, 25', unidad: 'años', tipo: 'poblacion' }, expected: 'Media 21.5 años · σ ≈ 1.8028 años' },
  { id: 'voltaje', title: 'Voltaje con conversión de unidades', module: 'Datos experimentales', description: 'Mediciones en voltios convertidas a milivoltios.', route: '/experimentales', queryParams: { datos: '12.1, 11.9, 12.0, 12.2, 11.8, 12.0', unidad: 'V' }, expected: 'V = 12.00 ± 0.06 V (1 V = 1000 mV)' },
  { id: 'frecuencias', title: 'Tabla de frecuencias e histograma', module: 'Tablas y gráficas', description: '30 datos agrupados con la regla de Sturges (6 clases).', route: '/tablas-graficas', queryParams: { datos: TREINTA }, expected: 'k = 6 · amplitud ≈ 8.33 · Σf = 30' },
  { id: 'dispersion', title: 'Diagrama de dispersión con recta', module: 'Tablas y gráficas', description: 'Seis pares (x, y) con la recta de regresión superpuesta.', route: '/tablas-graficas', queryParams: { pestana: 'dispersion', x: '1, 2, 3, 4, 5, 6', y: '2.1, 3.9, 6.2, 7.8, 10.1, 12.2' }, expected: 'Relación lineal positiva muy fuerte' },
  { id: 'union', title: 'Unión de eventos', module: 'Probabilidad', description: 'P(A) = 0.5, P(B) = 0.3 y P(A∩B) = 0.1.', route: '/probabilidad', queryParams: { pestana: 'eventos' }, expected: 'P(A∪B) = 0.7 (cargar con «Cargar ejemplo»)' },
  { id: 'combinaciones', title: 'Combinaciones', module: 'Probabilidad', description: '¿De cuántas formas se eligen 3 elementos de 10, sin importar el orden?', route: '/probabilidad', queryParams: { pestana: 'clasica', clasica: 'combinaciones', n: '10', k: '3' }, expected: 'C(10, 3) = 120' },
  { id: 'normal-menor', title: 'Normal: probabilidad acumulada', module: 'Probabilidad', description: 'X ~ N(100, 15²). Calcula P(X < 115).', route: '/probabilidad', queryParams: { mu: '100', sigma: '15', tipoNormal: 'menor', a: '115' }, expected: 'z = 1 · P = 0.8413' },
  { id: 'normal-entre', title: 'Normal: probabilidad en un intervalo', module: 'Probabilidad', description: 'X ~ N(100, 15²). Calcula P(85 < X < 115).', route: '/probabilidad', queryParams: { mu: '100', sigma: '15', tipoNormal: 'entre', a: '85', b: '115' }, expected: 'z = −1 y 1 · P = 0.6827' },
  { id: 'percentil', title: 'Normal: percentil 95', module: 'Probabilidad', description: '¿Qué valor deja a su izquierda el 95 % de una N(100, 15²)?', route: '/probabilidad', queryParams: { pestana: 'inverso', mu: '100', sigma: '15', percentil: '95' }, expected: 'z = 1.6449 · x ≈ 124.67' },
  { id: 'regresion', title: 'Regresión: voltaje contra corriente', module: 'Correlación y regresión', description: 'Ajuste lineal, correlación y R² con unidades.', route: '/regresion', queryParams: { x: '1, 2, 3, 4, 5', y: '2.1, 3.9, 6.2, 7.8, 10.1', unidadX: 'A', unidadY: 'V' }, expected: 'ŷ = 0.05 + 1.99x · r = 0.9987 · R² = 0.9973' },
  { id: 'perfecta', title: 'Correlación perfecta', module: 'Correlación y regresión', description: 'Datos exactamente lineales: r = 1.', route: '/regresion', queryParams: { x: '1, 2, 3, 4', y: '2, 4, 6, 8' }, expected: 'r = 1 · ŷ = 0 + 2x' },
  { id: 'sigma-s', title: 'Poblacional frente a muestral', module: 'Interpretación', description: 'Compara σ y s con los datos de corriente y entiende por qué se usa n − 1.', route: '/interpretacion', queryParams: { datos: '2.1, 2.3, 2.2, 2.4, 2.0', unidad: 'A' }, expected: 'σ = 0.1414 A · s = 0.1581 A (11.8 % mayor)' },
];
