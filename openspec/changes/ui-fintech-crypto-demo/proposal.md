# Proposal

## Why

El cambio anterior (`tema-fintech-crypto`) tomó la paleta de las recomendaciones de la skill (dorado y violeta) y no del demo que se pidió. El demo real, <https://uupm.cc/demo/fintech-crypto>, tiene otra colorimetría (azul marino con verde neón y azul eléctrico) y otro lenguaje de interfaz (botones, tarjetas de vidrio, píldoras, iconos en baldosas con degradado, texto con degradado, cuadrícula de fondo). El resultado actual no se parece al demo. Este change rehace la UI/UX tomando el demo como única fuente de verdad.

## What Changes

- **Colorimetría del demo, con sus valores medidos**: fondo `#0A0E27`, tarjeta `#0F1635` (hover `#141B42`), borde `#1E2650`, texto `#FFFFFF`, texto secundario `#8B92B3`, azul `#0080FF` y verde neón `#39FF14` (botón principal y acentos). Se descarta el dorado y el violeta.
- **Tipografía del demo**: Space Grotesk para títulos y DM Sans para el resto (reemplazan a Orbitron y Exo 2).
- **Botones del demo**: principal verde neón con texto azul marino, esquinas de 12 px, elevación y brillo verde al pasar el cursor; secundario con borde y relleno azul tenue al pasar el cursor.
- **Tarjetas de vidrio del demo**: fondo `#0F1635` al 80 %, desenfoque de 20 px, borde de 1 px al 50 %, radio de 16 px y brillo azul al pasar el cursor.
- **Elementos propios del demo**: texto con degradado azul→verde en cifras y títulos de énfasis, píldoras de estado verdes y azules, baldosas de iconos con degradado, pestañas en forma de píldora, cuadrícula de 50 px y resplandores en el fondo del inicio, cabecera con logo en degradado.
- **Aplicado a toda la interfaz**: cabecera, menú, inicio, módulos, formularios, resultados, tablas, gráficas, prácticas, ejemplos, pregunta, errores y pie.
- **Sin cambios de funcionalidad**: cálculos, rutas, textos, estructura de pantallas y comportamiento quedan igual; las pruebas de lógica y de componentes siguen pasando sin modificar su intención.
- **BREAKING (visual)**: desaparece la paleta dorada/violeta de `tema-fintech-crypto`.

## Capabilities

### New Capabilities

- `fintech-ui-style`: estilo visual y de interacción Fintech/Crypto tomado del demo `uupm.cc/demo/fintech-crypto`: paleta, tipografía, botones, tarjetas de vidrio, píldoras, baldosas de iconos, degradados, fondo, pestañas, gráficas y reglas de accesibilidad adaptadas.

### Modified Capabilities

(ninguna: el spec `visual-theme` de `tema-fintech-crypto` sigue sin archivar y no existe en `openspec/specs/`; este change lo reemplaza, ver «Workflow follow-up» de `tasks.md`)

## Impact

- Código: `src/styles.css` (tokens y patrones), CSS y plantillas de `shared/` y `features/`, `scripts/check-contrast.mjs`, `scripts/check-theme.mjs`, `index.html` (`theme-color`).
- Dependencias: se añaden `@fontsource/space-grotesk` y `@fontsource/dm-sans`; se quitan `@fontsource/orbitron` y `@fontsource/exo-2`.
- Documentación: `README.md`, `docs/demo-reference.json` (medidas del demo) y `docs/capturas/` (el informe debe usar las nuevas).
- Pruebas: la lógica no cambia; se añade una verificación de paridad con las medidas del demo.
