# Proposal

## Why

La asignatura de Estadística Aplicada (Universidad Mariano Gálvez de Guatemala, Facultad de Ingeniería) exige un asistente virtual publicado que resuelva problemas reales, muestre fórmulas, sustitución, procedimiento y respuesta final, genere prácticas con retroalimentación y sea usable por el docente gratis, sin iniciar sesión. Entrega: domingo 25/10/2026, 15 puntos, con 4.0 puntos dedicados solo a la precisión de los cálculos.

## What Changes

- Nueva aplicación web (SPA) en Angular, **sin backend y sin API de IA externa**: todos los cálculos se hacen de forma determinista en el navegador, para que sean exactos, reproducibles y gratuitos.
- Siete módulos: estadística descriptiva, datos experimentales con unidades, tablas y gráficas, probabilidad y distribución normal, correlación y regresión lineal simple, interpretación (σ vs s) y un generador de prácticas.
- Cada resultado se presenta en cuatro pasos fijos: **fórmula → sustitución → procedimiento → respuesta e interpretación**.
- Barra de "Pregunta" en lenguaje natural (en español) que reconoce la intención y los números escritos y los enruta al módulo correcto; si no entiende, lo advierte y sugiere el módulo.
- Catálogo de 12 ejercicios de ejemplo (incluye el caso de prueba de corriente: 2.1, 2.3, 2.2, 2.4, 2.0 A) y un generador de prácticas con datos aleatorios, verificación de la respuesta del estudiante y retroalimentación.
- Validación y advertencias claras: datos faltantes, valores no numéricos, n insuficiente, desviación cero, probabilidades fuera de [0, 1], etc.
- Pie de página y pantalla de inicio con integrantes, carnés, asignatura y sección.
- Publicación estática gratuita con URL pública, sin login.
- Informe de entrega (≤ 3 páginas) con capturas, apoyado en la propia app.
- Diseño UI/UX moderno y simple, definido con la skill UI UX Pro Max (ver `design.md`).

## Capabilities

### New Capabilities

- `descriptive-statistics`: media, mediana, moda, rango, varianza y desviación estándar (muestral y poblacional), cuartiles y coeficiente de variación, con procedimiento paso a paso.
- `experimental-data`: series de mediciones con unidad, media ± incertidumbre, desviación, error de la media, cifras significativas y conversión básica de unidades.
- `tables-and-charts`: tablas de frecuencias (absoluta, relativa, acumulada), histograma y diagrama de dispersión, con alternativa tabular accesible.
- `probability`: probabilidad básica (eventos, complemento, unión, condicional, Bayes) y distribución normal (P(X<a), P(a<X<b), valores z, percentiles inversos).
- `linear-relationship`: correlación de Pearson, regresión lineal simple, R², predicción e interpretación.
- `result-explanation`: estructura común de resultados (fórmula, sustitución, procedimiento, respuesta, interpretación) y explicación de σ vs s.
- `practice-and-examples`: catálogo de ≥ 10 ejemplos y generador de prácticas con corrección y retroalimentación.
- `input-validation-and-guidance`: validación de entradas, advertencias, rutas de error y barra de pregunta en lenguaje natural.
- `assistant-shell-and-publishing`: identidad (nombre, integrantes, carnés, asignatura, sección), navegación, diseño responsive/accesible y publicación gratuita sin login.

### Modified Capabilities

(ninguna: proyecto nuevo, `openspec/specs/` está vacío)

## Impact

- Código nuevo: proyecto Angular (LTS) en la raíz de `proyecto_maza`, sin dependencias de servidor.
- Dependencias: Angular, TypeScript, Vitest (pruebas), una librería de gráficos o SVG propio; sin claves ni servicios de pago.
- Infraestructura: hosting estático gratuito (GitHub Pages o similar) con enlace público permanente hasta la revisión.
- Documentos: informe PDF/Word de ≤ 3 páginas y capturas (fuera del código de la app).
