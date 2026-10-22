# Proposal

## Why

La interfaz actual de Sigma Lab usa un tema claro índigo de propósito general. Se quiere una identidad visual más moderna y de "panel financiero": el estilo **Fintech/Crypto** que recomienda la skill UI UX Pro Max (modo oscuro OLED, acentos dorado y violeta, tarjetas tipo KPI). La app calcula y muestra cifras, y este lenguaje visual hace que las respuestas destaquen y que la herramienta se vea moderna sin perder legibilidad.

## What Changes

- Reemplazar el tema claro por un **tema oscuro Fintech/Crypto** definido solo con tokens: fondo `#0F172A`, tarjetas `#222735`, primario dorado `#F59E0B`, acento violeta `#8B5CF6`, texto `#F8FAFC`, con verde y rojo para correcto/incorrecto.
- Tipografía del estilo: **Orbitron** para marca y títulos, **Exo 2** para interfaz y texto, y **JetBrains Mono** (ya en uso) para cifras. Todas autohospedadas, sin CDN.
- Respuestas principales como **tarjetas KPI** con cifra grande; resto de la interfaz con aspecto de panel de datos (paneles, tablas, pestañas y gráficas con la nueva paleta).
- Efecto vidrio (translucidez y desenfoque) solo en cabecera, menús flotantes y resumen superior, con alternativa sólida; los paneles con texto largo quedan sólidos para mantener el contraste.
- Gráficas (histograma y dispersión) con la paleta oscura y distinción que no depende solo del color.
- Sin cambios de funcionalidad, rutas, cálculos ni textos de ayuda. Se mantiene el movimiento sutil y `prefers-reduced-motion`.
- **BREAKING (visual):** deja de existir el aspecto claro. No se agrega selector de tema (ver `design.md`).

## Capabilities

### New Capabilities

- `visual-theme`: tema visual oscuro Fintech/Crypto de la aplicación: paleta por tokens, contraste mínimo, tipografía, tarjetas KPI, efecto vidrio con alternativa, gráficas legibles y accesibilidad del tema.

### Modified Capabilities

(ninguna: `openspec/specs/` está vacío; los requisitos de accesibilidad de `assistant-shell-and-publishing` del change `asistente-estadistica-aplicada` se siguen cumpliendo y este change los refuerza con pruebas sobre la nueva paleta)

## Impact

- Código: `src/styles.css` (tokens y patrones globales), CSS de `shared/` y `features/home`, `index.html` (`theme-color`), `scripts/check-contrast.mjs`.
- Dependencias: se añaden `@fontsource/orbitron` y `@fontsource/exo-2`; se quita `@fontsource/plus-jakarta-sans`.
- Documentación: `README.md` y capturas de `docs/capturas/` (el informe debe usar las nuevas capturas).
- Pruebas: las de lógica y componentes no cambian; se amplían las de contraste y se repiten la revisión de desbordes y Lighthouse.
