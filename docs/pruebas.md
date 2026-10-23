# Pruebas de exactitud — Proteus

## 1. Verificación automática contra SciPy/NumPy (hecha)

`src/app/core/crosscheck.spec.ts` compara el motor con valores calculados con SciPy/NumPy para problemas **nuevos**
(no usados en los ejemplos). Los valores de referencia están en `src/app/core/reference-cases.ts`.
Se ejecuta con `npm test`. Cubre 25 casos:

| Módulo | Casos nuevos | Magnitudes comparadas |
|---|---|---|
| Descriptiva | 3 series | media, mediana, rango, s, σ, RIC |
| Experimental | 3 series | error estándar s/√n |
| Normal | 3 + 3 + 3 | P(X<x), P(X>x), P(a<X<b), percentil |
| Combinatoria | 3 | C(n,k), P(n,k) |
| Eventos | 3 | Bayes |
| Regresión | 3 conjuntos | b, a, r, R² |
| Frecuencias | 1 (30 datos) | k de Sturges, amplitud y conteos (`numpy.histogram`) |

Tolerancia: 1e-9 (relativa a la unidad) en la mayoría; 1e-8 en percentiles. Resultado de la última ejecución: **todos coinciden**.

Además, las pruebas unitarias de `core/` comprueban que cada **sustitución** mostrada reproduce el resultado numérico
del paso (`evalExpr`) y que 4 000 ejercicios generados (500 semillas × 4 módulos × 2 niveles) coinciden con un cálculo independiente.

## 2. Verificación a mano por los integrantes (pendiente)

Cada integrante resuelve **3 problemas nuevos por módulo** (los que propongan, distintos a los ejemplos), compara con el
asistente y anota aquí. Criterio de aceptación: diferencia menor que 0.5 % del último dígito mostrado.

Plantilla (copiar una fila por problema):

| Módulo | Integrante | Problema (datos) | Resultado a mano | Resultado del asistente | Diferencia | ¿OK? |
|---|---|---|---|---|---|---|
| Descriptiva | Luis Fernando Samayoa Santos | | | | | |
| Descriptiva | Karla Estefani Gonzáles Tista | | | | | |
| Experimentales | | | | | | |
| Tablas y gráficas | | | | | | |
| Probabilidad / normal | | | | | | |
| Regresión | | | | | | |
| Interpretación σ vs s | | | | | | |
