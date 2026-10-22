# Spec Delta

## Purpose

Definir el estilo visual y de interacción Fintech/Crypto de la aplicación, copiado del demo de referencia, para que la interfaz se vea y se sienta como ese demo sin cambiar ninguna funcionalidad ni perder accesibilidad.

## ADDED Requirements

### Requirement: Paleta del demo
La aplicación SHALL usar la colorimetría del demo: fondo `#0A0E27`, tarjetas `#0F1635` con hover `#141B42`, borde `#1E2650`, texto `#FFFFFF`, texto secundario `#8B92B3`, azul `#0080FF` y verde neón `#39FF14`, sin dorado ni violeta.

#### Scenario: Colores base
- **WHEN** se abre cualquier pantalla
- **THEN** el fondo de la página es `#0A0E27`, el texto principal es blanco y el texto secundario es `#8B92B3`

#### Scenario: Colores de acento
- **WHEN** se muestran acciones principales, énfasis y estados
- **THEN** el verde neón `#39FF14` identifica la acción principal y lo positivo, y el azul `#0080FF` el acento secundario, sin colores dorado ni violeta

### Requirement: Botones del demo
Los botones principales SHALL tener fondo verde neón, texto azul marino, esquinas de 12 px y peso 600; los secundarios SHALL ser transparentes con borde de 1 px `#1E2650`, texto blanco y peso 500; ambos SHALL medir al menos 44 px de alto.

#### Scenario: Botón principal
- **WHEN** el usuario pasa el cursor sobre un botón principal
- **THEN** el botón se eleva 2 px y muestra un resplandor verde de 30 px

#### Scenario: Botón secundario
- **WHEN** el usuario pasa el cursor sobre un botón secundario
- **THEN** su borde se vuelve azul `#0080FF` y su fondo azul al 10 %

#### Scenario: Botón deshabilitado
- **WHEN** un botón está deshabilitado
- **THEN** se muestra atenuado, sin elevación ni resplandor y con cursor de no permitido

### Requirement: Tarjetas de vidrio del demo
Las tarjetas y paneles SHALL tener fondo `#0F1635` al 80 %, desenfoque de 20 px, borde de 1 px `#1E2650` al 50 % y radio de 16 px; al pasar el cursor sobre tarjetas interactivas SHALL mostrar borde azul, fondo `#141B42` y resplandor azul.

#### Scenario: Tarjeta de módulo
- **WHEN** el usuario pasa el cursor sobre una tarjeta de módulo del inicio
- **THEN** su borde se vuelve azul y aparece un resplandor azul suave

#### Scenario: Alternativa sin desenfoque
- **WHEN** el navegador no soporta desenfoque o el usuario reduce la transparencia
- **THEN** las tarjetas usan fondo `#0F1635` sólido y el texto mantiene el contraste

### Requirement: Tipografía del demo
Los títulos, el nombre de la marca y las cifras destacadas SHALL usar Space Grotesk; el resto de la interfaz SHALL usar DM Sans; ambas SHALL servirse desde la propia aplicación y las cifras de tablas SHALL usar ancho tabular.

#### Scenario: Títulos y texto
- **WHEN** se muestra una pantalla de módulo
- **THEN** el título principal usa Space Grotesk en negrita y los párrafos usan DM Sans

#### Scenario: Sin red
- **WHEN** no hay acceso a servicios externos de fuentes
- **THEN** los textos se ven con Space Grotesk y DM Sans

### Requirement: Degradado y resplandor de énfasis
El degradado azul→verde (135°) en texto y el resplandor SHALL limitarse a la marca, a una palabra de énfasis en el título del inicio y a las cifras principales de resultados, nunca a párrafos ni a texto de formularios.

#### Scenario: Cifra principal
- **WHEN** se muestra la respuesta principal de un cálculo
- **THEN** la cifra aparece con degradado azul→verde y su unidad en texto secundario

#### Scenario: Texto largo
- **WHEN** se muestra procedimiento, interpretación o ayuda
- **THEN** el texto es blanco o secundario sólido, sin degradado

### Requirement: Insignias, baldosas e iconos del demo
Los estados y etiquetas SHALL mostrarse como píldoras con fondo del color al 10 % y borde al 20 %; los iconos de los módulos SHALL ir en baldosas de 48 px con radio de 12 px y degradado azul→verde al 20 %.

#### Scenario: Píldora de estado
- **WHEN** se muestra una nota, advertencia o confirmación
- **THEN** aparece como píldora o banner con icono y texto, además del color

#### Scenario: Baldosa de icono
- **WHEN** se muestran las tarjetas de módulos
- **THEN** cada icono azul va dentro de una baldosa de 48 px con degradado tenue azul→verde

### Requirement: Fondo con cuadrícula y resplandores
El inicio SHALL mostrar una cuadrícula de 50 px con líneas `#1E2650` al 30 % y resplandores azul y verde de baja opacidad, sin afectar la lectura ni el rendimiento.

#### Scenario: Inicio
- **WHEN** se abre la pantalla de inicio
- **THEN** el fondo muestra la cuadrícula y los resplandores, y el contraste del texto sigue cumpliendo

#### Scenario: Movimiento reducido
- **WHEN** el usuario prefiere movimiento reducido
- **THEN** no hay animaciones del fondo y las transiciones son inmediatas

### Requirement: Pestañas en forma de píldora
Las pestañas SHALL tener forma de píldora de 8 px de radio, texto secundario cuando están inactivas y fondo azul con texto legible cuando están activas, manteniendo al menos 44 px de alto y navegación por teclado.

#### Scenario: Pestaña activa
- **WHEN** hay una pestaña activa
- **THEN** su fondo es azul `#0080FF` y su texto alcanza 4.5:1 de contraste

### Requirement: Gráficas con la paleta del demo
Las gráficas SHALL usar verde neón y azul sobre la tarjeta oscura: barras con degradado verde, puntos verdes y recta de regresión azul discontinua con leyenda, de modo que se distingan por forma y trazo y no solo por color.

#### Scenario: Dispersión con recta
- **WHEN** se muestra el diagrama de dispersión con la recta de regresión
- **THEN** los puntos son verdes, la recta es azul y discontinua y la leyenda lo indica con texto

### Requirement: Contraste y foco en el estilo del demo
Todo texto SHALL alcanzar 4.5:1 y los bordes de controles y el foco 3:1; donde un color del demo no lo alcance (texto blanco sobre azul, texto azul sobre fondos claros, rojo sobre tarjeta) SHALL usarse una variante legible y el foco SHALL ser un contorno verde de 2 px con separación.

#### Scenario: Pares de color
- **WHEN** se evalúan los pares de texto y fondo del estilo
- **THEN** todos alcanzan 4.5:1 y los bordes de controles 3:1

#### Scenario: Foco de teclado
- **WHEN** el usuario navega con Tab
- **THEN** cada elemento enfocado muestra un contorno verde de 2 px visible contra su fondo, incluido el botón verde

### Requirement: Paridad funcional
El cambio de estilo SHALL NOT alterar cálculos, rutas, textos de ayuda, comportamiento de formularios ni estructura de las pantallas.

#### Scenario: Resultados idénticos
- **WHEN** se resuelven los ejemplos y prácticas existentes
- **THEN** los resultados, pasos e interpretaciones son idénticos a los anteriores al cambio de estilo

#### Scenario: Pruebas existentes
- **WHEN** se ejecuta la suite de pruebas
- **THEN** todas las pruebas de lógica, rutas y componentes siguen pasando con la misma intención
