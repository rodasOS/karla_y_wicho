# Design

## Context

Estado observado en `proyecto_maza/` (proyecto Angular en la raíz): todo el aspecto sale de variables CSS en `src/styles.css` (`--color-*`, `--radius`, `--space-*`, `--font-*`) y los componentes las consumen. Solo hay 4 valores de color fuera de los tokens: `theme-color` en `index.html` y tres sombras con `rgb()` (`styles.css`, `shell.css`, `home.page.css`). Por eso el cambio de tema es sobre todo cambiar tokens, más ajustes de composición.

La skill UI UX Pro Max devolvió, para el producto «Fintech/Crypto»: estilo *Glassmorphism + Dark Mode (OLED)*, paleta oro `#F59E0B` + violeta `#8B5CF6` sobre `#0F172A`, tipografía *Orbitron / Exo 2*, panel de «monitoreo en tiempo real» y estilo *Data-Dense Dashboard* con tarjetas KPI. Advierte evitar diseño juguetón y degradados violeta/rosa.

Contrastes calculados de esa paleta sobre la tarjeta `#222735`: texto `#F8FAFC` 14.2:1; secundario `#94A3B8` 5.8:1; oro 6.9:1; verde `#22C55E` 6.5:1; pero violeta `#8B5CF6` solo 3.5:1 y rojo `#EF4444` solo 4.0:1 (no sirven como texto) y el borde `#334155` 1.4:1 (solo decorativo). Hay que adaptar esos tres valores.

Esto sustituye la decisión de tema claro de la sección D12 de `asistente-estadistica-aplicada` y revierte su «sin modo oscuro»; el resto de D12 (tokens, accesibilidad, responsive) se mantiene.

## Goals / Non-Goals

**Goals:**
- Aspecto Fintech/Crypto coherente en todas las pantallas, definido solo por tokens.
- Contraste y foco accesibles en oscuro, verificados con script y Lighthouse.
- Respuestas destacadas como tarjetas KPI.

**Non-Goals:**
- Selector de tema claro/oscuro ni respeto a `prefers-color-scheme` (queda como mejora futura).
- Datos en tiempo real, precios, gráficas de velas o cualquier contenido «crypto» real: solo se adopta el lenguaje visual.
- Cambios en cálculos, rutas, textos o estructura de pantallas.
- Librerías de gráficos o de animación (no GSAP).

## Decisions

### D1. Solo tema oscuro, sin selector
La skill marca el estilo como oscuro y el pedido es adoptar ese estilo. Un segundo tema duplicaría tokens y pruebas de contraste. **Alternativa:** oscuro por defecto con alternancia a claro: más trabajo y más superficie que verificar; se puede añadir después porque todo pasa por tokens. Supuesto registrado: el usuario no pidió modo claro.

### D2. Paleta por tokens con ajustes de accesibilidad
Se conservan los valores de la skill donde cumplen y se corrigen donde no:

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `--color-bg` | `#0F172A` | fondo | base |
| `--color-surface` | `#222735` | tarjetas, paneles | texto 14.2:1 |
| `--color-surface-2` | `#272F42` | filas, chips, hover | — |
| `--color-text` | `#F8FAFC` | texto | 14.2:1 |
| `--color-text-muted` | `#94A3B8` | secundario | 5.8:1 |
| `--color-primary` | `#F59E0B` | acciones, foco, cifras clave | 6.9:1 sobre tarjeta |
| `--color-on-primary` | `#0F172A` | texto sobre dorado | 8.3:1 |
| `--color-accent` | `#8B5CF6` | acentos gráficos, recta de regresión (no texto) | ≥3:1 gráfico |
| `--color-accent-text` | `#A78BFA` | texto o enlace violeta | 5.5:1 |
| `--color-success` | `#22C55E` | correcto | 6.5:1 |
| `--color-warning` | `#FBBF24` | advertencia | 8.9:1 sobre tarjeta |
| `--color-danger` | `#F87171` | error (en vez de `#EF4444`) | 5.4:1 |
| `--color-border` | `#334155` | divisores decorativos | decorativo |
| `--color-border-strong` | `#7C8BA1` | bordes de campos y controles | ≥3:1 |

Los fondos de alertas son translúcidos (10 %) del color semántico sobre la tarjeta; con 14 % el texto rojo y violeta quedaba en 4.4:1 y 4.3:1, por eso se bajó a 10 %. El script lo valida. **Alternativa:** usar los valores de la skill tal cual: el violeta y el rojo no llegan a 4.5:1 como texto.

### D3. Tipografía con tres roles
`--font-display` Orbitron (marca, `h1`, nombres de módulo), `--font-ui` Exo 2 (interfaz y párrafos), `--font-mono` JetBrains Mono (datos, cifras, fórmulas de entrada). Se instalan `@fontsource/orbitron` y `@fontsource/exo-2` (solo pesos usados) y se retira Plus Jakarta Sans. **Por qué Orbitron solo en títulos:** sus formas anchas pierden legibilidad en párrafos y cifras. KaTeX conserva sus propias fuentes y hereda el color.

### D4. Tarjetas KPI para las respuestas
`result-card` y el resumen de `solution-view` pasan a tarjetas: etiqueta pequeña en secundario, cifra grande en mono y dorado, unidad en secundario, con `overflow-wrap` y tamaño fluido (`clamp`) para que no desborde en 375 px. La respuesta principal ocupa más ancho; las secundarias van en rejilla. Se conserva el orden del spec (pasos → respuesta final) y el resumen superior con enlace a la respuesta.

### D5. Vidrio acotado y con alternativa
`backdrop-filter: blur()` con fondo translúcido solo en cabecera, menú inferior/hoja de módulos y resumen superior, dentro de `@supports (backdrop-filter: blur(1px))`; por defecto y con `prefers-reduced-transparency` el fondo es sólido. Paneles con procedimiento, fórmulas y tablas siempre sólidos. **Alternativa:** vidrio en todas las tarjetas, que es lo típico del estilo: reduce el contraste real del texto sobre fondos variables y cuesta rendimiento.

### D6. Gráficas en oscuro sin depender del color
Barras del histograma en dorado con separación fina del color de la tarjeta; cuadrícula tenue; ejes y etiquetas en secundario. Dispersión: puntos dorados con borde de la tarjeta; recta violeta discontinua con leyenda de texto, de modo que se distinguen por forma y trazo. Los colores salen de variables CSS ya usadas por los SVG.

### D7. Sombras y relieve
En oscuro las sombras apenas se ven: se usa borde de 1 px (`--color-border`) y un brillo dorado muy sutil al enfocar o pasar el cursor. Las tres sombras con `rgb()` se pasan a tokens (`--shadow-card`, `--shadow-float`, `--glow-primary`).

### D8. Verificación del contraste como código
`scripts/check-contrast.mjs` se amplía con todas las parejas del tema (texto, enlaces, sobre dorado, estados con fondo translúcido calculado, bordes de control a 3:1) y falla si alguna incumple. Así la accesibilidad del tema no depende de revisión visual.

## Risks / Trade-offs

- [Contraste insuficiente en alguna combinación] → script de contraste en CI local y Lighthouse ≥ 95 antes de cerrar.
- [Orbitron ancho rompe títulos largos en móvil] → limitarlo a títulos, tamaño fluido y `overflow-wrap`; revisar a 375 px.
- [Aspecto «crypto» poco serio para una entrega universitaria] → paleta sobria, sin degradados violeta/rosa ni neón, sin efectos agresivos; el contenido sigue siendo académico.
- [Vidrio afecta rendimiento o legibilidad] → acotado a tres superficies, con alternativa sólida.
- [Capturas e informe quedan desactualizados] → regenerar `docs/capturas/` en la última tarea de verificación.
- [KaTeX en oscuro] → heredar `color` del tema y comprobar visualmente fracciones y raíces.
