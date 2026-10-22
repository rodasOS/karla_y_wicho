# Spec Delta

## Purpose

Resolver ejercicios básicos de probabilidad y problemas con la distribución normal, con procedimiento y resultado numérico preciso.

## ADDED Requirements

### Requirement: Probabilidad básica de eventos
El sistema SHALL resolver complemento, unión, intersección de eventos independientes, probabilidad condicional y teorema de Bayes a partir de las probabilidades ingresadas.

#### Scenario: Unión de eventos
- **WHEN** el usuario ingresa P(A) = 0.5, P(B) = 0.3 y P(A∩B) = 0.1
- **THEN** el sistema responde P(A∪B) = 0.7 mostrando P(A) + P(B) − P(A∩B)

#### Scenario: Probabilidad inválida
- **WHEN** el usuario ingresa una probabilidad menor que 0 o mayor que 1
- **THEN** el sistema rechaza el dato e indica que debe estar entre 0 y 1

### Requirement: Probabilidad clásica
El sistema SHALL calcular casos favorables sobre casos posibles, permutaciones y combinaciones.

#### Scenario: Combinaciones
- **WHEN** el usuario pide C(10, 3)
- **THEN** el sistema responde 120 mostrando 10! / (3! · 7!)

### Requirement: Probabilidades con distribución normal
El sistema SHALL calcular P(X < a), P(X > a) y P(a < X < b) dados μ y σ > 0, estandarizando con z = (x − μ) / σ.

#### Scenario: Probabilidad acumulada
- **WHEN** μ = 100, σ = 15 y se pide P(X < 115)
- **THEN** el sistema calcula z = 1.00 y responde P = 0.8413

#### Scenario: Intervalo
- **WHEN** μ = 100, σ = 15 y se pide P(85 < X < 115)
- **THEN** el sistema calcula z = −1 y z = 1 y responde P = 0.6827

#### Scenario: Desviación no válida
- **WHEN** σ es 0 o negativa
- **THEN** el sistema advierte que σ debe ser positiva y no calcula

### Requirement: Valores inversos de la normal
El sistema SHALL encontrar el valor x correspondiente a una probabilidad (percentil) dados μ y σ.

#### Scenario: Percentil 95
- **WHEN** μ = 100, σ = 15 y se pide el percentil 95
- **THEN** el sistema responde x ≈ 124.67 con z = 1.645

### Requirement: Datos de la normal desde una muestra
El sistema SHALL permitir usar la media y la desviación estándar muestral calculadas de una serie como μ y σ del modelo normal, indicándolo explícitamente.

#### Scenario: Usar los datos de la serie
- **WHEN** el usuario elige "usar media y s de mi serie"
- **THEN** los campos μ y σ se llenan con esos valores y se avisa que son estimaciones
