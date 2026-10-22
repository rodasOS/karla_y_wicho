# Design

## Context

Proyecto académico nuevo (carpeta vacía, sin código). Motivación y alcance en `proposal.md`; requisitos verificables en `specs/`. Restricciones que moldean la arquitectura:

- **Entrega 25/10/2026**, en pareja (Luis Fernando Samayoa Santos 2990-25-21483, Karla Estefani Gonzáles Tista 2990-25-16308), Estadística Aplicada, Sección Única. Ambos deben poder explicar el código.
- **4.0 de 15 puntos son exactitud de cálculo**; el docente probará problemas nuevos y entradas raras.
- El docente debe usarlo **gratis y sin iniciar sesión** con una sola URL → nada de claves, cuotas ni cuentas de estudiantes.
- Stack pedido: **Angular, última versión LTS**. En npm, la etiqueta `v21-lts` apunta a 21.2.x, mientras que `latest` es 22.2.x. Se usa **Angular 21 LTS** (standalone, signals, control flow `@if/@for`, Vitest por defecto, zoneless). Subir a 22 más adelante no cambia la arquitectura.
- Node instalado: 24.x, compatible.

## Goals / Non-Goals

**Goals:**
- Motor de cálculo puro, determinista y probado, separado de la UI.
- Presentación uniforme *fórmula → sustitución → procedimiento → respuesta* generada por el propio motor (no texto escrito a mano por ejercicio).
- Interfaz simple: una tarea por pantalla, resultados inmediatos, mensajes claros.
- Despliegue estático gratuito, funcional offline una vez cargado.

**Non-Goals:**
- Backend, base de datos, cuentas de usuario, persistencia entre dispositivos.
- Llamadas a LLM/APIs de IA: se descarta por costo, claves expuestas, no determinismo y riesgo de cifras erróneas. La "pregunta en lenguaje natural" se resuelve con un analizador de reglas local.
- Pruebas de hipótesis, intervalos de confianza, ANOVA, regresión múltiple (fuera del temario pedido).
- Modo oscuro y multi-idioma en esta versión (solo español).

## Decisions

### D1. SPA 100 % cliente, sin backend ni IA externa
Todo corre en el navegador. **Por qué:** exactitud verificable, gratis, sin login, privacidad y cero puntos de falla durante la revisión. **Alternativas:** (a) API de LLM — respuestas no deterministas y requiere clave/costo; (b) backend Python/Node — hosting extra y más puntos de falla. Se cumple "IA o programación" con programación.

### D2. Arquitectura en capas con dependencias en un solo sentido

```
src/app/
├── core/                    # sin Angular UI; TypeScript puro y testeable
│   ├── math/                # stats.ts, normal.ts, regression.ts, combinatorics.ts, units.ts, rounding.ts
│   ├── steps/               # modelo Solution + builders que generan los 4 pasos
│   ├── parsing/             # data-parser.ts (números/separadores), question-parser.ts (NL)
│   ├── validation/          # reglas y tipos de advertencia
│   └── practice/            # generadores de ejercicios + comprobador de respuestas
├── data/                    # examples.ts (≥12 ejemplos), units.catalog.ts, texts.es.ts
├── shared/                  # componentes presentacionales reutilizables
│   ├── solution-view/       # renderiza una Solution (4 pasos)
│   ├── formula/             # fórmula con KaTeX
│   ├── data-input/          # textarea + chips de datos leídos + errores
│   ├── result-card/         # respuesta final destacada
│   ├── alert-banner/        # advertencias/errores
│   ├── charts/              # histogram.svg, scatter.svg (SVG propio, accesibles)
│   └── layout/              # shell, sidenav/bottom-nav, footer-autores
├── features/                # una carpeta por módulo, carga diferida
│   ├── home/  descriptive/  experimental/  tables-charts/
│   ├── probability/  regression/  interpretation/
│   └── practice/  examples/  ask/
└── app.routes.ts            # loadComponent por feature
```

Regla: `features → shared → core`; `core` jamás importa Angular. **Por qué:** el motor se prueba con Vitest sin TestBed, y los dos integrantes pueden trabajar en paralelo (uno en `core`, otra en UI) sin choques.

### D3. Modelo `Solution`: el motor produce la explicación
Cada cálculo devuelve un objeto, no un número:

```ts
interface Solution {
  title: string;
  steps: Step[];              // un Step por medida (media, s, r, z, …)
  answer: AnswerItem[];       // valores finales con unidad y valor sin redondear
  interpretation: string[];   // frases en español
  warnings: Warning[];        // n pequeño, extrapolación, atípicos…
}
interface Step { label: string; formulaTex: string; substitutionTex: string; procedure: string[]; result: number; unit?: string }
```

`solution-view` solo lo dibuja. **Por qué:** garantiza el requisito 4 del proyecto en todos los módulos y que sustitución y resultado nunca se desincronicen. **Alternativa:** plantillas por ejercicio → riesgo de errores y no sirve con datos nuevos.

### D4. Numérica: doble precisión, redondeo solo al mostrar
- Varianza con **dos pasadas** (media primero) o Welford, no la fórmula Σx² − (Σx)²/n (cancelación catastrófica).
- Normal: CDF con `erf` de alta precisión (error < 1e-12, p. ej. algoritmo de Cody/W. J. o serie+fracción continua) y **inversa de la normal** con Acklam + un paso de refinamiento de Halley. No se usa la aproximación de Abramowitz-Stegun 7.1.26 (≈1e-7, insuficiente para 4 decimales fiables en colas).
- Aritmética decimal visible: se usa `toFixed` en la capa de presentación; los datos de entrada se conservan como `number` y su texto original para mostrar la sustitución exacta tal como los escribió el usuario.
- Cifras significativas del reporte x̄ ± s/√n: incertidumbre a 1 cifra (2 si empieza en 1) y media al mismo decimal.
- **Contra-verificación:** pruebas con valores de referencia calculados con Python/SciPy (se generan una vez y se guardan como casos fijos).

### D5. Entrada de datos: parser tolerante y transparente
`data-parser` acepta `, ; espacio \n \t`, coma o punto decimal (regla: si hay `;` o salto de línea, la coma es decimal; si solo hay comas y espacios tras coma, la coma separa). Devuelve `{values, original[], errors[{token, index}]}`. La UI muestra los datos leídos como *chips* para que el usuario confirme la interpretación (evita errores silenciosos). Pares (x, y): dos campos o una tabla editable; se valida igualdad de longitud.

### D6. Pregunta en lenguaje natural: reglas, no IA
`question-parser`: normaliza (minúsculas, sin tildes), puntúa intenciones por palabras clave en español (media, mediana, moda, desviación, varianza, correlación, regresión, normal, z, probabilidad, combinaciones, histograma, frecuencias…), extrae números y unidades, y devuelve `{module, params, confidence}`. Con confianza baja → pregunta de aclaración; sin números → advierte datos faltantes; fuera de alcance → lo declara. El resultado **precarga el módulo**, el usuario confirma. **Alternativa descartada:** LLM, por D1.

### D7. Gráficas con SVG propio, sin librería
Histograma y dispersión son simples; SVG en componentes Angular (escalas lineales, ticks "agradables", rótulos). **Por qué:** cero dependencias, control total de accesibilidad (`role="img"`, `aria-label` con resumen, tabla de datos equivalente, formas además de color), menor bundle. **Alternativa:** Chart.js/ng2-charts — más rápido de integrar pero menos control y +~70 KB; se reconsidera si el tiempo apremia.

### D8. Fórmulas con KaTeX
Paquete `katex` empaquetado localmente (sin CDN), render a HTML con `katex.renderToString` en el componente `formula`, `aria-label` con la versión textual. **Alternativa:** MathML nativo (soporte desigual) o texto plano (ilegible, contra el requisito).

### D9. Estado con signals, formularios reactivos
Cada feature usa `signal`/`computed`: entrada → `computed` Solution (puro, sin botón "calcular" donde sea posible; calcula al escribir con *debounce* corto, o con botón explícito en módulos con varios campos). `ReactiveFormsModule` para campos con validación por campo. Sin NgRx: no hay estado global complejo. Un `SessionStore` (signal) guarda solo marcador de prácticas y decimales elegidos; sin `localStorage` obligatorio.

### D10. Enrutamiento y publicación
Rutas diferidas (`/`, `/descriptiva`, `/experimentales`, `/tablas-graficas`, `/probabilidad`, `/regresion`, `/interpretacion`, `/ejemplos`, `/practicas`, `/pregunta`). **Hosting: GitHub Pages** (gratis, URL pública estable, sin login para el docente) con `base-href` del repositorio y **`404.html` copia de `index.html`** para que recargar rutas profundas no falle; **alternativa equivalente:** Cloudflare Pages/Netlify (soportan reglas SPA nativas). Despliegue con GitHub Actions o `ngh-pages`. Alternativa de respaldo: usar enrutado por hash (`withHashLocation`) si Pages diera problemas con las rutas — decisión simple de revertir.

### D11. Pruebas
Vitest (predeterminado en Angular 21). Prioridad por rúbrica: (1) `core/math` con valores de referencia (incluye el caso 2.1/2.3/2.2/2.4/2.0), (2) parsers y validación con entradas hostiles, (3) generadores de prácticas (la respuesta esperada siempre coincide con el motor), (4) pruebas de componentes de `solution-view` y un par de flujos E2E manuales documentados con capturas para el informe.

### D12. UI/UX (resultado de UI UX Pro Max)

**Hallazgo y ajuste.** La herramienta propuso Claymorphism + tipografías infantiles (Baloo 2 / Comic Neue). Se **descarta** el estilo y las fuentes por no ser adecuados a una herramienta universitaria de ingeniería; se conservan de su salida la paleta índigo (contraste verificable), las reglas de accesibilidad, el checklist y la ausencia de modo oscuro. Estilo adoptado: **minimalismo académico moderno** (superficies blancas, bordes finos, sombras suaves, esquinas 12 px, mucho aire).

**Principios:** una tarea por pantalla · resultado visible sin scroll en escritorio · datos de ejemplo a un clic · errores junto al campo · nunca un resultado sin sus cuatro pasos.

**Estructura de pantallas**

```
┌ Header: ◐ Sigma Lab · [🔍 Pregunta…]                       ┐
├ Nav lateral (≥1024px) / barra inferior 5 ítems (móvil)     ┤
│  Inicio · Calcular ▾ · Ejemplos · Prácticas · Σ vs s       │
├ Contenido                                                  ┤
│  [Entrada de datos] → [Resultado: respuesta destacada]     │
│                        ├ 1 Fórmula  2 Sustitución          │
│                        └ 3 Procedimiento  4 Interpretación │
├ Footer: Integrantes · Carnés · Estadística Aplicada · Sec. Única · UMG ┤
└────────────────────────────────────────────────────────────┘
```

- **Inicio:** nombre, una frase de propósito, **barra grande de pregunta**, 6 tarjetas de módulos (icono SVG + 1 línea) y botón "Probar con el ejemplo de corriente".
- **Módulo (patrón común):** panel de entrada a la izquierda (campos, unidad, decimales, "Cargar ejemplo", "Limpiar"), panel de resultado a la derecha; en móvil se apilan. La tarjeta de **respuesta final** va primero y los pasos debajo en acordeón (abierto por defecto el primero, "expandir todo").
- **Prácticas:** tarjeta de enunciado → campo de respuesta → botón *Comprobar* → bloque de retroalimentación (correcto / incorrecto + pista) → *Ver solución* / *Siguiente*; marcador "aciertos / intentos".
- **Estados:** vacío (texto guía + ejemplo), cargando (no aplica, cálculo instantáneo), error (alerta bajo el campo + resumen enfocado al fallar el envío), advertencia (banner ámbar no bloqueante).

**Tokens de diseño** (CSS variables en `:root`, sin hex sueltos en componentes)

| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | `#4F46E5` | acciones, enlaces, foco (contraste 6.3:1 sobre blanco) |
| `--color-primary-soft` | `#EEF2FF` | fondos de selección, chips |
| `--color-bg` | `#F8FAFC` | fondo de página |
| `--color-surface` | `#FFFFFF` | tarjetas |
| `--color-text` | `#0F172A` | texto (≈17:1) |
| `--color-text-muted` | `#475569` | secundario (≈7.6:1) |
| `--color-border` | `#CBD5E1` | bordes |
| `--color-success` | `#15803D` | respuesta correcta |
| `--color-warning` | `#B45309` sobre `#FEF3C7` | advertencias |
| `--color-danger` | `#B91C1C` sobre `#FEE2E2` | errores |
| `--radius` | 12 px (campos 8 px) | |
| `--space-*` | 4, 8, 12, 16, 24, 32, 48 | escala 4 px |

El color nunca es el único portador de significado: toda alerta lleva icono y texto.

**Tipografía:** *Plus Jakarta Sans* (títulos y UI) + *JetBrains Mono* (datos y números, cifras tabulares `font-variant-numeric: tabular-nums`); base 16 px, interlineado 1.5, escala 1.25. Fuentes autohospedadas vía `@fontsource` (sin dependencia de red en la revisión). Fórmulas en KaTeX.

**Iconografía:** SVG (Lucide) en línea, sin emojis como iconos; los decorativos con `aria-hidden`, los botones con solo icono con `aria-label`.

**Interacción y movimiento:** objetivos táctiles ≥ 44 px, `cursor: pointer`, transiciones 150–250 ms (`transform`/`opacity`), aparición suave del resultado, respeto a `prefers-reduced-motion`. Movimiento sutil (dial 3/10); sin GSAP.

**Accesibilidad (WCAG 2.2 AA):** etiquetas visibles en todo campo (nunca solo placeholder), `aria-describedby` hacia ayuda y error, resumen de errores con foco al fallar, región `aria-live="polite"` para anunciar resultados, foco visible 2 px en `--color-primary`, orden de tabulación lógico, `lang="es"`, gráficas con alternativa en tabla.

**Responsive:** mobile-first; puntos de quiebre 375 / 768 / 1024 / 1440; sin scroll horizontal (tablas y fórmulas largas con `overflow-x: auto` contenido en su caja); barra inferior con 5 destinos en móvil.

**Nombre:** **Sigma Lab** — "Asistente Virtual de Estadística Aplicada" (original, corto y evoca σ/Σ).

## Risks / Trade-offs

- **[Riesgo] Cálculo erróneo en caso nuevo del docente** → pruebas con valores de referencia SciPy, `Solution` única fuente de verdad y revisión cruzada entre integrantes de las fórmulas antes de entregar.
- **[Riesgo] Convención ambigua (cuartiles, desviación muestral vs poblacional, moda)** → documentar el método usado en el procedimiento (cuartiles por interpolación lineal tipo Excel `QUARTILE.INC`) y mostrar ambas desviaciones cuando aplique.
- **[Riesgo] El parser de lenguaje natural malinterpreta** → siempre muestra qué entendió y precarga datos editables; ante duda, pregunta; nunca calcula en silencio.
- **[Riesgo] Rutas profundas dan 404 en GitHub Pages** → `404.html` de respaldo y prueba de recarga en tarea de despliegue; plan B hash routing.
- **[Riesgo] Enlace caído en la revisión** → verificar el enlace desde una ventana privada sin sesión antes de entregar y desplegar un respaldo en un segundo hosting gratuito.
- **[Trade-off] Gráficas SVG propias** → más código que Chart.js, pero accesibles y sin dependencia; acotado a dos tipos de gráfica.
- **[Trade-off] Sin IA generativa** → menos "conversacional", pero exacto y gratuito; la barra de pregunta cubre lo esencial del requisito 2.
- **[Trade-off] Angular 21 LTS en lugar de 22** → coincide con el pedido de LTS; la migración a 22 es una actualización menor.
- **[Riesgo] Plazo corto (entrega 25/10/2026)** → priorizar por rúbrica: motor y módulos obligatorios primero, luego prácticas, luego pulido de UI y la barra de pregunta.

## Migration Plan

No hay migración (proyecto nuevo). Despliegue: `ng build` → publicar `dist/` en GitHub Pages (workflow o `ngh-pages`) → verificar URL en ventana privada y en móvil → copiar URL al informe y a Canvas. Rollback: re-publicar el commit anterior; mantener un hosting de respaldo.

## Open Questions

- ¿Se publicará en un repositorio de GitHub de alguno de los integrantes (afecta solo el `base-href` y la URL final)?
- ¿El docente exige un formato de nombre del PDF/Word del informe? (no afecta la app).
