# Spec Delta

## Purpose

Procesar series de mediciones físicas con su unidad, reportando el valor medio con su incertidumbre y manteniendo la coherencia de unidades.

## ADDED Requirements

### Requirement: Series con unidad
El sistema SHALL permitir asociar una unidad (A, V, Ω, m, s, kg, N, °C, entre otras) a la serie y mostrarla en todos los resultados.

#### Scenario: Corriente en amperios
- **WHEN** el usuario ingresa 2.1, 2.3, 2.2, 2.4, 2.0 con unidad A
- **THEN** la media se muestra como 2.2 A y la desviación estándar muestral como 0.158 A

#### Scenario: Sin unidad
- **WHEN** el usuario no elige unidad
- **THEN** el sistema calcula igualmente y muestra los resultados sin unidad, con un aviso informativo

### Requirement: Resultado de medición
El sistema SHALL calcular el error estándar de la media (s/√n) y presentar el resultado como x̄ ± s/√n con cifras significativas coherentes.

#### Scenario: Reporte de medición
- **WHEN** se procesa la serie de corriente de ejemplo
- **THEN** el sistema reporta I = 2.20 ± 0.07 A, con el cálculo de s/√n a la vista

### Requirement: Conversión de unidades
El sistema SHALL convertir entre prefijos del SI de la misma magnitud (por ejemplo mA, A, kA) y SHALL rechazar conversiones entre magnitudes distintas.

#### Scenario: Conversión válida
- **WHEN** el usuario pide convertir la serie de A a mA
- **THEN** cada valor y cada resultado se multiplican por 1000 y se muestra el factor usado

#### Scenario: Conversión incompatible
- **WHEN** el usuario pide convertir de A a m
- **THEN** el sistema advierte que las magnitudes no son compatibles y no convierte

### Requirement: Detección de valores atípicos
El sistema SHALL señalar mediciones sospechosas con el criterio de 1.5 × RIC y explicar el criterio sin eliminarlas automáticamente.

#### Scenario: Medición atípica
- **WHEN** la serie es 2.1, 2.2, 2.1, 2.3, 9.8
- **THEN** el sistema marca 9.8 como posible valor atípico y recomienda revisarlo, sin excluirlo del cálculo
