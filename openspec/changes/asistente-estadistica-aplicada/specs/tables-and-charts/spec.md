# Spec Delta

## Purpose

Organizar datos en tablas de frecuencias y representarlos con histogramas y diagramas de dispersión legibles y accesibles.

## ADDED Requirements

### Requirement: Tabla de frecuencias
El sistema SHALL construir una tabla de frecuencias con clases, marca de clase, frecuencia absoluta, relativa, porcentual y acumulada.

#### Scenario: Número de clases automático
- **WHEN** el usuario ingresa 30 datos sin indicar clases
- **THEN** el sistema calcula el número de clases con la regla de Sturges, muestra la fórmula y la amplitud usada

#### Scenario: Clases definidas por el usuario
- **WHEN** el usuario indica 5 clases
- **THEN** la tabla usa 5 clases y la suma de frecuencias absolutas es igual a n

### Requirement: Histograma
El sistema SHALL graficar un histograma a partir de la tabla de frecuencias, con ejes rotulados y alternativa en tabla.

#### Scenario: Histograma con tabla asociada
- **WHEN** se genera el histograma
- **THEN** se muestran barras sin separación, ejes con título y la tabla de frecuencias equivalente para lectores de pantalla

### Requirement: Diagrama de dispersión
El sistema SHALL graficar un diagrama de dispersión de pares (x, y) con ejes rotulados, y superponer la recta de regresión cuando el usuario lo pida.

#### Scenario: Dispersión con recta
- **WHEN** el usuario ingresa pares (x, y) y activa "mostrar recta"
- **THEN** se dibujan los puntos y la recta ŷ = a + bx calculada

#### Scenario: Pares incompletos
- **WHEN** la cantidad de valores x difiere de la de y
- **THEN** el sistema no grafica y advierte la diferencia de longitudes

### Requirement: Datos continuos y discretos
El sistema SHALL tratar datos discretos con pocos valores distintos como categorías individuales, ofreciéndolo como opción explicada.

#### Scenario: Pocos valores distintos
- **WHEN** los datos tienen 5 valores distintos o menos
- **THEN** el sistema propone tabla por valor y no por intervalos
