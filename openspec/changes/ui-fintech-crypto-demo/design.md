# Design

## Context

`tema-fintech-crypto` (aplicado, sin archivar) se basó en las recomendaciones de la skill UI UX Pro Max para «Fintech/Crypto» (dorado `#F59E0B`, violeta `#8B5CF6`, Orbitron). El usuario pidió el estilo del demo <https://uupm.cc/demo/fintech-crypto> y la implementación no se parece. Esta vez la fuente de verdad es el propio demo, medido así: se descargó su HTML y su CSS y se renderizó en Chrome para leer estilos computados. Es el CSS real de la clase `.fintech-crypto`, no una interpretación.

Estado del código a reemplazar: todo el aspecto sale de tokens en `src/styles.css` y de CSS de componentes (`shared/*`, `features/home`). Los componentes ya consumen `var(--color-*)`, así que cambiar la paleta es barato; el trabajo real está en el **lenguaje de componentes** (botones, tarjetas, píldoras, tabs, KPI, fondo), que el cambio anterior no tocó.

### Medidas del demo (referencia)

| Elemento | Valor medido |
|---|---|
| Variables | `--primary:#0080ff` · `--secondary/--cta:#39ff14` · `--bg:#0a0e27` · `--bg-card:#0f1635` · `--bg-card-hover:#141b42` · `--text:#fff` · `--text-muted:#8b92b3` · `--border:#1e2650` |
| Rojo (negativos) | `#fb2c36` |
| Fuentes | títulos `Space Grotesk` 700 (h1 60 px/75, h2 36 px, h3 18 px/600); cuerpo `DM Sans` (16/24; lead 18/28 muted; secundario 14/20; leyendas 12/16) |
| `.btn-primary` | fondo `#39ff14`, texto `#0a0e27`, sin borde, radio `.75rem`, padding `.875rem 2rem`, peso 600, `transition .2s`; hover: `translateY(-2px)` + `box-shadow 0 0 30px #39ff1466` |
| `.btn-secondary` | transparente, borde `1px #1e2650`, texto blanco, radio `.75rem`, mismo padding, peso 500; hover: borde `#0080ff`, fondo `#0080ff1a` |
| `.glass-card` | fondo `#0f1635cc`, `backdrop-filter: blur(20px)`, borde `1px #1e265080`, radio `1rem`; relleno 24 px (16 px en fila de cotizaciones); hover: borde `#0080ff`, fondo `#141b42e6`, sombra `0 0 30px #0080ff26` |
| Brillos | `.glow-primary 0 0 20px #0080ff4d` · `.glow-secondary 0 0 20px #39ff144d` · `.text-glow text-shadow 0 0 20px #39ff1480` |
| `.gradient-text` | `linear-gradient(135deg,#0080ff,#39ff14)` con `background-clip:text` |
| `.grid-bg` | líneas `#1e26504d` cada 50 px (`linear-gradient` en ambos ejes) |
| Cabecera | 65 px, fondo `#0a0e27` al 80 %, `blur(12px)`, borde inferior `1px #1e2650`; enlaces 14 px `#8b92b3` → blanco; logo: baldosa 32 px, radio 8 px, degradado azul→verde 135°; texto de marca 20 px/700 |
| Píldora «Live» (verde) | fondo `#39ff14` al 10 %, borde al 20 %, texto `#39ff14`, radio completo, padding `6px 12px`, 14 px/500, con punto |
| Píldora «Security» (azul) | igual con `#0080ff` |
| Baldosa de icono | 48 px, radio 12 px, degradado 135° azul→verde al 20 %, icono `#0080ff` |
| Cifras de estadísticas | 36 px/700, degradado azul→verde; etiqueta 14/500 blanca; subetiqueta 12 muted |
| Pestañas (1H/1D/1W…) | `px 12 py 4`, 12 px, radio 8 px; inactiva muted; activa fondo `#0080ff` texto blanco |
| Gráfica | línea verde `#39ff14` con área de degradado verde que se desvanece; chips flotantes con brillo azul |
| Movimiento | `prefers-reduced-motion`: duraciones a `.01ms` |

La skill y el demo discrepan; **manda el demo** (decisión del usuario).

## Goals / Non-Goals

**Goals:**
- Que la interfaz se vea y se sienta como el demo: mismos colores, fuentes, botones, tarjetas, píldoras, baldosas, degradados y fondo.
- Mantener accesibilidad (contraste, foco, teclado, objetivos táctiles) corrigiendo solo lo mínimo.
- Medir la paridad contra el demo con un script, no a ojo.

**Non-Goals:**
- Cambiar funcionalidad, cálculos, rutas, textos de ayuda o estructura de pantallas.
- Copiar contenido del demo (precios, gráficas de mercado, secciones de marketing, insignias de tiendas, cifras ficticias). Solo se toma el lenguaje visual.
- Modo claro, selector de tema o librerías de gráficos/animación.
- Animaciones nuevas más allá de las transiciones del demo (`.2s`/`.3s`).

## Decisions

### D1. Valores exactos del demo como tokens, más variantes legibles solo donde fallan
Tokens base idénticos a los medidos. Contraste calculado con la paleta del demo:

| Par | Contraste | Decisión |
|---|---|---|
| blanco / fondo `#0A0E27`; blanco / tarjeta | 19.0 / 17.7 | tal cual |
| `#8B92B3` / tarjeta; / fondo; / hover | 5.8 / 6.2 / 5.4 | tal cual |
| `#39FF14` / tarjeta; texto azul marino / verde | 13.1 / 14.0 | tal cual |
| `#0080FF` como texto / tarjeta; / hover | 4.7 / 4.4 | para **texto** azul usar `--color-primary-text: #4DA3FF` (6.7:1); `#0080FF` queda para bordes, brillos, iconos y degradados |
| **blanco sobre `#0080FF`** (pestaña activa) | **3.8** | falla: la pestaña activa mantiene el fondo `#0080FF` pero con texto azul marino en peso 600 (5.0:1) |
| `#FB2C36` como texto / tarjeta | 4.65 (4.4 en hover) | texto de error con `--color-danger-text: #FF6568` (6.2:1); `#FB2C36` para bordes y relleno |
| borde `#1E2650` / tarjeta | 1.2 | solo decorativo; los controles usan `--color-border-strong: #6B76A5` (4.0:1) |

Cada desviación se debe a un valor del demo que incumple 4.5:1 o 3:1, y el script de contraste la sostiene. **Alternativa:** copiar el demo sin ajustes: dejaría texto de 12 px en 3.8:1.

### D2. Sistema de componentes como clases globales con nombres del demo
`.btn-primary`, `.btn-secondary`, `.glass-card` (+ `-hover`), `.gradient-text`, `.text-glow`, `.glow-primary/secondary`, `.grid-bg`, `.pill` (+ `.pill-green/.pill-blue/.pill-red/.pill-amber`), `.icon-tile`. Las plantillas existentes pasan de `.btn`/`.btn.secondary`/`.panel` a estas clases. **Por qué globales:** el demo las define así y los componentes de Angular las reutilizan sin duplicar CSS; los tokens siguen siendo la única fuente de valores. **Alternativa:** componentes `app-button`/`app-card`: más estructura y cambios de plantilla sin necesidad.

### D3. Mapeo del demo a Sigma Lab (sin copiar contenido)
- **Cabecera:** vidrio al 80 % con `blur(12px)`, logo en baldosa de degradado (con Σ), marca en Space Grotesk, botón «Preguntar» como `.btn-primary` compacto, barra de pregunta con borde de control.
- **Menú lateral y barra inferior:** enlaces muted que pasan a blanco; activo con fondo `#0080FF1A`, texto blanco e icono verde.
- **Inicio:** `.grid-bg` con resplandores azul y verde de baja opacidad; píldora verde con punto («Estadística Aplicada · UMG»); `h1` de 60 px con «Lab» en `.gradient-text`; párrafo muted de 18 px; botones principal y secundario; tarjetas de módulo como `.glass-card-hover` con `.icon-tile`.
- **Módulos:** paneles `.glass-card`; resultados con cifras principales en `.gradient-text` de Space Grotesk; secundarias blancas; unidad muted.
- **Pasos del procedimiento:** acordeón en `.glass-card`; el número del paso en círculo con degradado azul→verde y texto azul marino.
- **Formularios:** campos sobre `#0A0E27` con borde de control, radio `.75rem`, foco azul con brillo `glow-primary`; opciones tipo radio como píldoras de 8 px; botones del demo.
- **Alertas:** píldoras/banners con color al 10 % y borde al 20 %, icono y texto.
- **Tablas:** encabezado `#0A0E27`, filas con hover `#141B42`, cifras tabulares.
- **Pie:** fondo `#0A0E27`, borde superior `#1E2650`, texto muted.

### D4. Fondo del inicio con CSS puro
Cuadrícula con dos `linear-gradient` de 50 px y dos `radial-gradient` grandes (azul y verde, ≤ 12 % de opacidad) en un pseudo-elemento sin animación. **Alternativa:** canvas o SVG animado: costo de rendimiento y movimiento innecesario.

### D5. Gráficas
Barras con degradado vertical verde→verde translúcido (como el área del demo) y borde fino; puntos verdes con halo `glow-secondary`; recta azul `#0080FF` discontinua con leyenda; cuadrícula `#1E2650`; ejes y etiquetas muted. Distinción por forma y trazo, no solo por color.

### D6. Fuentes autohospedadas
`@fontsource/space-grotesk` (500–700) y `@fontsource/dm-sans` (400–700); se retiran Orbitron y Exo 2. JetBrains Mono se conserva solo para la entrada de datos (textarea y fichas de datos leídos), donde la alineación monoespaciada ayuda; las cifras de resultados y tablas usan Space Grotesk/DM Sans con `font-variant-numeric: tabular-nums`. Si una fuente no ofrece cifras tabulares utilizables, las tablas usan JetBrains Mono (decisión a confirmar visualmente).

### D7. Verificación de paridad
Se guardan las medidas del demo en `docs/demo-reference.json` y `scripts/check-demo-parity.mjs` compara en el navegador los estilos computados de la app (botón principal y secundario, tarjeta, título, píldora, baldosa, pestaña activa, cabecera, fondo) con esas medidas, tolerando solo las desviaciones de D1 declaradas. Es la forma objetiva de comprobar «se parece al demo». Además, capturas lado a lado revisadas a ojo.

### D8. Foco
Contorno verde de 2 px con `outline-offset: 3px`, de modo que se vea también alrededor del botón verde (el espacio muestra el fondo oscuro). Contraste 14:1 contra el fondo.

## Risks / Trade-offs

- [Vuelve a no parecerse al demo] → medidas reales guardadas, script de paridad y revisión visual lado a lado antes de cerrar; los valores no se inventan.
- [Deriva de accesibilidad por usar colores neón] → script de contraste con el par exacto del demo y su variante; Lighthouse ≥ 95.
- [Desenfoque y resplandores afectan rendimiento] → mismas superficies que el demo, alternativa sólida y sin animaciones continuas.
- [Space Grotesk/DM Sans con cifras desalineadas] → `tabular-nums` y verificación visual de tablas; plan B con mono.
- [Rehacer plantillas puede romper pruebas por selectores `.btn`/`.panel`] → conservar los nombres de clase usados por las pruebas o actualizarlos a la vez; las pruebas validan comportamiento, no color.
- [Retrabajo por un cambio previo equivocado] → `tema-fintech-crypto` se archiva sin sincronizar su spec `visual-theme` (reemplazada), ver `tasks.md`.
- [El demo es una página de marketing, la app es una herramienta] → se adopta el lenguaje visual, no las secciones; la jerarquía de la app no cambia.
