# Spec Delta

## Purpose

Calcular medidas de tendencia central, posición y dispersión de un conjunto de datos numéricos ingresado por el usuario, mostrando el procedimiento completo.

## ADDED Requirements

### Requirement: Medidas de tendencia central
El sistema SHALL calcular media, mediana y moda (o indicar que no hay moda, o que es multimodal) de los datos ingresados.

#### Scenario: Datos con moda única
- **WHEN** el usuario ingresa 2, 3, 3, 5, 7
- **THEN** el sistema responde media 4, mediana 3 y moda 3

#### Scenario: Sin moda
- **WHEN** el usuario ingresa 1, 2, 3, 4
- **THEN** el sistema indica "no hay moda" y no inventa un valor

#### Scenario: Multimodal
- **WHEN** el usuario ingresa 1, 1, 2, 2, 3
- **THEN** el sistema lista las modas 1 y 2 y la marca como bimodal

### Requirement: Medidas de dispersión
El sistema SHALL calcular rango, varianza y desviación estándar muestral y poblacional, cuartiles, rango intercuartílico y coeficiente de variación.

#### Scenario: Ejemplo de corriente
- **WHEN** el usuario ingresa 2.1, 2.3, 2.2, 2.4, 2.0
- **THEN** el sistema responde media 2.2, varianza muestral 0.025, desviación estándar muestral 0.1581 y poblacional 0.1414

#### Scenario: Un solo dato
- **WHEN** el usuario ingresa un único valor
- **THEN** el sistema calcula la desviación poblacional (0) y advierte que la muestral no está definida con n = 1

### Requirement: Entrada flexible de datos
El sistema SHALL aceptar datos separados por comas, espacios, saltos de línea o punto y coma, y coma o punto decimal.

#### Scenario: Separadores mezclados
- **WHEN** el usuario ingresa "2,1; 2,3  2.2\n2.4"
- **THEN** el sistema interpreta cuatro datos y muestra cómo los leyó

### Requirement: Procedimiento visible
El sistema SHALL mostrar, para cada medida, la fórmula, la sustitución con los valores reales y el resultado.

#### Scenario: Media con sustitución
- **WHEN** se calcula la media de 2.1, 2.3, 2.2, 2.4, 2.0
- **THEN** se muestra x̄ = Σxᵢ / n, luego x̄ = (2.1 + 2.3 + 2.2 + 2.4 + 2.0) / 5 y finalmente x̄ = 2.2
