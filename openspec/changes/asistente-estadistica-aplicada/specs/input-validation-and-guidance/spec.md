# Spec Delta

## Purpose

Evitar resultados engañosos: validar entradas, advertir ante datos insuficientes o casos no resolubles y permitir preguntas en lenguaje natural.

## ADDED Requirements

### Requirement: Validación de entradas
El sistema SHALL validar los datos antes de calcular y mostrar errores junto al campo afectado, indicando qué corregir.

#### Scenario: Texto en lugar de número
- **WHEN** el usuario ingresa "2.1, abc, 2.3"
- **THEN** el sistema señala "abc" como valor no numérico y no calcula hasta corregirlo

#### Scenario: Campo vacío
- **WHEN** el usuario pulsa calcular sin datos
- **THEN** el sistema indica que faltan datos y no muestra resultados

### Requirement: Advertencias por datos insuficientes
El sistema SHALL advertir cuando el tamaño de la muestra no permita una medida o su interpretación.

#### Scenario: Muestra pequeña
- **WHEN** hay menos de 2 datos y se pide desviación muestral
- **THEN** el sistema advierte que se necesita n ≥ 2

### Requirement: Casos no resolubles
El sistema SHALL declarar explícitamente cuando no pueda resolver un caso y SHALL NOT entregar un número inventado.

#### Scenario: Pregunta fuera de alcance
- **WHEN** el usuario pide una prueba de hipótesis o un tema no soportado
- **THEN** el sistema responde que no está soportado, lista los temas que sí resuelve y sugiere el módulo más cercano

### Requirement: Pregunta en lenguaje natural
El sistema SHALL permitir escribir un problema en español, detectar su intención y los números incluidos, y abrir el módulo con los datos precargados para confirmación.

#### Scenario: Pregunta reconocida
- **WHEN** el usuario escribe "calcula la media y la desviación estándar muestral de 2.1, 2.3, 2.2, 2.4 y 2.0"
- **THEN** el sistema abre estadística descriptiva con esos cinco datos y muestra el resultado

#### Scenario: Pregunta ambigua
- **WHEN** la pregunta no permite determinar el módulo
- **THEN** el sistema pregunta qué se desea calcular y ofrece los módulos como opciones

#### Scenario: Pregunta sin datos
- **WHEN** la pregunta pide un cálculo pero no incluye números
- **THEN** el sistema advierte que faltan datos y abre el módulo con los campos vacíos

### Requirement: Mensajes comprensibles
El sistema SHALL escribir errores y advertencias en español claro, sin jerga técnica ni códigos internos.

#### Scenario: Error inesperado
- **WHEN** ocurre un fallo interno
- **THEN** se muestra un mensaje general con la opción de reiniciar y la app no queda en blanco
