# Spec Delta

## Purpose

Garantizar que todo resultado del asistente se presente con una estructura didáctica uniforme y que explique la diferencia entre desviación estándar poblacional y muestral.

## ADDED Requirements

### Requirement: Estructura de resultado en cuatro pasos
El sistema SHALL presentar cada resultado con: fórmula, sustitución de valores, procedimiento y respuesta final con interpretación.

#### Scenario: Resultado completo
- **WHEN** el sistema resuelve cualquier problema
- **THEN** la pantalla muestra, en ese orden, fórmula, sustitución, procedimiento y respuesta destacada con interpretación

### Requirement: Fórmulas legibles
El sistema SHALL mostrar las fórmulas con notación matemática legible (sumatorias, raíces, fracciones, subíndices) y no como texto plano.

#### Scenario: Fórmula de la desviación muestral
- **WHEN** se muestra la desviación estándar muestral
- **THEN** la fórmula se ve como s = √( Σ(xᵢ − x̄)² / (n − 1) )

### Requirement: Precisión numérica controlada
El sistema SHALL calcular con precisión de doble flotante, redondear solo para mostrar y permitir elegir de 2 a 6 decimales.

#### Scenario: Redondeo solo en pantalla
- **WHEN** el usuario cambia de 4 a 2 decimales
- **THEN** los valores mostrados se redondean y los cálculos intermedios no se alteran

### Requirement: Explicación σ frente a s
El sistema SHALL ofrecer una explicación comparativa entre desviación poblacional (divide entre N) y muestral (divide entre n − 1), con los dos valores calculados para los datos del usuario.

#### Scenario: Comparación con datos propios
- **WHEN** el usuario abre "σ vs s" con la serie 2.1, 2.3, 2.2, 2.4, 2.0
- **THEN** se muestran σ = 0.1414 y s = 0.1581, cuál usar según se tenga población o muestra y por qué se usa n − 1

### Requirement: Interpretación en contexto
El sistema SHALL redactar una interpretación en español que mencione la magnitud, la unidad y el contexto del dato.

#### Scenario: Interpretación del ejemplo de prueba
- **WHEN** se resuelve el ejemplo de corriente
- **THEN** la interpretación indica que las mediciones se concentran alrededor de 2.2 A y se desvían típicamente 0.158 A, lo que equivale a una variación relativa cercana al 7 %
