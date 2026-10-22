# Spec Delta

## Purpose

Medir e interpretar la relación lineal entre dos variables mediante correlación de Pearson y regresión lineal simple.

## ADDED Requirements

### Requirement: Coeficiente de correlación
El sistema SHALL calcular el coeficiente r de Pearson para pares (x, y), mostrando sumatorias, fórmula y sustitución.

#### Scenario: Correlación perfecta
- **WHEN** el usuario ingresa x = 1, 2, 3, 4 e y = 2, 4, 6, 8
- **THEN** el sistema responde r = 1 y la describe como relación lineal positiva perfecta

#### Scenario: Variable constante
- **WHEN** todos los valores de x (o de y) son iguales
- **THEN** el sistema advierte que r no está definido porque la desviación es cero

### Requirement: Regresión lineal simple
El sistema SHALL calcular pendiente b, intercepto a, la ecuación ŷ = a + bx y el coeficiente de determinación R².

#### Scenario: Ajuste calculado
- **WHEN** el usuario ingresa x = 1, 2, 3, 4, 5 e y = 2.1, 3.9, 6.2, 7.8, 10.1
- **THEN** el sistema muestra b y a con sus fórmulas y sustituciones, la ecuación ajustada y R² cercano a 1

### Requirement: Predicción
El sistema SHALL predecir ŷ para un x dado y advertir cuando x esté fuera del rango observado (extrapolación).

#### Scenario: Extrapolación
- **WHEN** el usuario pide predecir con un x fuera del rango de los datos
- **THEN** el sistema devuelve ŷ y añade una advertencia de extrapolación

### Requirement: Interpretación de la relación
El sistema SHALL interpretar en lenguaje claro la magnitud y el sentido de r, el significado de la pendiente con unidades y el de R², y SHALL recordar que correlación no implica causalidad.

#### Scenario: Interpretación con unidades
- **WHEN** se calcula la regresión de voltaje (V) contra corriente (A)
- **THEN** la pendiente se interpreta como "por cada 1 A de aumento, V cambia en b V, en promedio"

### Requirement: Datos mínimos
El sistema MUST exigir al menos 3 pares para regresión y MUST advertir con menos de 3.

#### Scenario: Dos pares
- **WHEN** el usuario ingresa 2 pares
- **THEN** el sistema advierte que se requieren al menos 3 pares y no entrega interpretación estadística
