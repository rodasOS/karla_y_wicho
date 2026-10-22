# Spec Delta

## Purpose

Apoyar el aprendizaje autónomo con ejemplos resueltos y prácticas generadas con retroalimentación inmediata.

## ADDED Requirements

### Requirement: Catálogo de ejemplos
El sistema SHALL incluir al menos 10 ejercicios de ejemplo, cubriendo todos los módulos, que se cargan en su módulo con un clic y se resuelven con el motor de cálculo.

#### Scenario: Cargar un ejemplo
- **WHEN** el usuario elige un ejemplo del catálogo
- **THEN** el módulo correspondiente se abre con los datos precargados, editables, y el resultado se calcula en el momento

#### Scenario: Ejemplo de prueba de la asignatura
- **WHEN** el usuario abre el ejemplo "Corriente eléctrica"
- **THEN** los datos son 2.1, 2.3, 2.2, 2.4, 2.0 A y se obtienen media 2.2 A y s = 0.158 A

### Requirement: Generador de prácticas
El sistema SHALL generar ejercicios nuevos con datos aleatorios por módulo y nivel (básico, intermedio), sin repetir siempre el mismo enunciado.

#### Scenario: Nueva práctica
- **WHEN** el usuario pulsa "Generar práctica" en estadística descriptiva
- **THEN** se muestra un enunciado con datos aleatorios y un campo para la respuesta

### Requirement: Corrección y retroalimentación
El sistema SHALL comparar la respuesta del estudiante con la calculada, aceptando una tolerancia y explicando el resultado.

#### Scenario: Respuesta correcta
- **WHEN** el estudiante responde dentro de la tolerancia
- **THEN** el sistema confirma que es correcta y ofrece ver el procedimiento

#### Scenario: Respuesta incorrecta con pista
- **WHEN** la respuesta es incorrecta
- **THEN** el sistema indica que no coincide, ofrece una pista del error probable (por ejemplo, dividir entre n en lugar de n − 1) y permite reintentar o revelar la solución

#### Scenario: Respuesta no numérica
- **WHEN** el campo contiene texto no numérico
- **THEN** el sistema pide un número y no cuenta el intento

### Requirement: Progreso de la sesión
El sistema SHALL mostrar aciertos y total de intentos de la sesión sin requerir cuenta.

#### Scenario: Marcador de sesión
- **WHEN** el estudiante resuelve prácticas
- **THEN** se muestra "aciertos / intentos" que se reinicia al cerrar la pestaña
