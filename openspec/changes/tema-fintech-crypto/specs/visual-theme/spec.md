# Spec Delta

## Purpose

Definir el tema visual oscuro Fintech/Crypto de la aplicación para que sea moderno y coherente sin sacrificar legibilidad, contraste ni accesibilidad.

## ADDED Requirements

### Requirement: Tema oscuro único y coherente
La aplicación SHALL presentarse con un tema oscuro en todas sus pantallas, con fondo azul noche, superficies más claras para tarjetas y paneles, acento dorado para acciones y acento violeta secundario, sin mezclar un aspecto claro.

#### Scenario: Todas las pantallas usan el mismo tema
- **WHEN** se abre cualquier pantalla (inicio, módulos, ejemplos, prácticas, pregunta, 404)
- **THEN** el fondo de página es oscuro, las tarjetas son más claras que el fondo y las acciones principales son doradas

#### Scenario: Independiente del tema del sistema
- **WHEN** el navegador del usuario está configurado en tema claro
- **THEN** la aplicación mantiene el tema oscuro y sigue siendo legible

### Requirement: Contraste mínimo del tema
Todo texto SHALL tener contraste de al menos 4.5:1 contra su fondo, y los bordes de campos, controles y puntos de gráficas SHALL tener al menos 3:1 contra la superficie donde se apoyan.

#### Scenario: Pares de texto
- **WHEN** se evalúan las combinaciones de texto y fondo del tema (texto principal, texto secundario, enlaces, texto sobre dorado, éxito, advertencia, error e información)
- **THEN** todas alcanzan 4.5:1 o más

#### Scenario: Controles de formulario
- **WHEN** se evalúa el borde de un campo de texto, selector o botón secundario
- **THEN** su contraste contra la tarjeta es de al menos 3:1

### Requirement: Estado nunca solo por color
Los estados de éxito, advertencia, error y selección SHALL comunicarse también con icono, texto o forma, y no solo con el color.

#### Scenario: Respuesta correcta e incorrecta en prácticas
- **WHEN** el estudiante comprueba una respuesta
- **THEN** el resultado incluye un icono y un texto que indica si es correcta o incorrecta, además del color

#### Scenario: Serie y recta en la dispersión
- **WHEN** se muestra el diagrama de dispersión con la recta de regresión
- **THEN** los puntos y la recta se distinguen por forma y estilo de trazo (puntos frente a línea discontinua) y la recta tiene leyenda con texto

### Requirement: Tarjetas KPI para las respuestas
La respuesta principal de cada resultado SHALL mostrarse en una tarjeta destacada con la cifra en tamaño grande, su etiqueta y su unidad, de modo que se encuentre sin leer todo el procedimiento.

#### Scenario: Respuesta del ejemplo de corriente
- **WHEN** se resuelve el ejemplo de corriente (2.1, 2.3, 2.2, 2.4 y 2.0 A)
- **THEN** la media 2.2 A y la desviación muestral 0.158 A aparecen en tarjetas con cifra grande y unidad

#### Scenario: Valores largos no desbordan
- **WHEN** una cifra tiene muchos dígitos o la pantalla mide 375 px
- **THEN** la tarjeta ajusta el texto sin provocar desplazamiento horizontal

### Requirement: Efecto vidrio con alternativa
El efecto de translucidez y desenfoque SHALL limitarse a la cabecera, los menús flotantes y el resumen superior, y SHALL tener una alternativa sólida cuando el navegador no lo soporte o el usuario reduzca la transparencia.

#### Scenario: Sin soporte de desenfoque
- **WHEN** el navegador no soporta desenfoque de fondo
- **THEN** esas superficies se muestran con fondo sólido y el texto conserva el contraste

#### Scenario: Texto largo sobre superficie sólida
- **WHEN** se muestra procedimiento, fórmulas o tablas
- **THEN** están sobre superficies sólidas y no translúcidas

### Requirement: Tipografía del tema
La aplicación SHALL usar una tipografía futurista solo para marca y títulos, una tipografía de lectura para el resto de la interfaz y una tipografía monoespaciada con cifras tabulares para datos y resultados, todas servidas desde la propia aplicación.

#### Scenario: Sin dependencia de red para fuentes
- **WHEN** se carga la aplicación sin acceso a servicios externos de fuentes
- **THEN** los textos se muestran con las fuentes del tema y no con una de reserva

#### Scenario: Cifras alineadas
- **WHEN** se muestra una tabla de frecuencias o una lista de resultados
- **THEN** las cifras usan ancho tabular para alinearse

### Requirement: Foco y movimiento accesibles en el tema oscuro
El foco de teclado SHALL ser visible sobre fondos oscuros y el movimiento SHALL ser sutil y desactivarse cuando el usuario prefiera movimiento reducido.

#### Scenario: Navegación con teclado
- **WHEN** el usuario avanza con Tab por botones, campos y enlaces
- **THEN** cada elemento enfocado muestra un contorno dorado de al menos 2 px visible contra su fondo

#### Scenario: Movimiento reducido
- **WHEN** el sistema indica preferencia de movimiento reducido
- **THEN** las transiciones y animaciones de la aplicación se reducen a un cambio inmediato
