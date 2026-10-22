# Tasks

## 1. Tokens y tipografía

- [x] 1.1 Instalar `@fontsource/orbitron` y `@fontsource/exo-2`, retirar `@fontsource/plus-jakarta-sans` y verificar con `npm run build` que las fuentes salen en `dist/` y que no hay peticiones a CDN (`grep -rE "https?://(fonts|cdn)" dist`)
- [x] 1.2 Reemplazar los tokens de `src/styles.css` por la paleta oscura de `design.md` (fondo, superficies, texto, dorado, violeta, estados, `--color-border-strong`, sombras y brillo) y roles de fuente (`--font-display`, `--font-ui`, `--font-mono`); actualizar `theme-color` en `index.html`; verificar con `npm run build` sin errores
- [x] 1.3 Ampliar `scripts/check-contrast.mjs` con todas las parejas del tema (texto ≥ 4.5:1, bordes de control ≥ 3:1, estados con fondo translúcido compuesto sobre la tarjeta) y verificar que el script termina con éxito, ajustando `--color-warning`, `--color-border-strong` u otros valores hasta cumplir

## 2. Patrones globales

- [x] 2.1 Restyling de paneles, botones (primario dorado y secundario), campos, selectores, radios, tablas de datos, pestañas y estados vacíos con los nuevos tokens, foco dorado de 2 px y brillo sutil al pasar el cursor; verificar con `npm test -- --watch=false` y revisión visual a 375 y 1024 px
- [x] 2.2 Añadir la utilidad de vidrio dentro de `@supports (backdrop-filter: blur(1px))` con alternativa sólida y `prefers-reduced-transparency`, y confirmar con una prueba en navegador (Playwright) que sin soporte el fondo es sólido y que `prefers-reduced-motion` anula transiciones

## 3. Estructura y pantallas

- [x] 3.1 Aplicar el tema a cabecera (vidrio), barra lateral, barra inferior móvil, hoja de módulos, pie y aviso de error global, usando Orbitron solo en marca y títulos; verificar con `node scripts/check-layout.mjs` sin desbordes a 375, 768, 1024 y 1440 px
- [x] 3.2 Rediseñar el inicio (héroe sobrio sin degradados violeta/rosa, tarjetas de módulo, botón del ejemplo de corriente) y verificar con las pruebas de `modules.spec.ts` y una captura revisada

## 4. Resultados, formularios y gráficas

- [x] 4.1 Convertir `result-card` y el resumen superior de `solution-view` en tarjetas KPI (cifra grande en mono y dorado, etiqueta, unidad, `clamp` y `overflow-wrap`), con pasos y procedimiento sobre superficies sólidas y fórmulas KaTeX legibles en oscuro; verificar con las pruebas de `solution-view` y que el ejemplo de corriente muestra 2.2 A y 0.158 A en tarjetas sin desbordar a 375 px
- [x] 4.2 Aplicar el tema a `data-input`, `number-field`, `error-summary`, `alert-banner` y a los avisos de práctica (correcto/incorrecto) manteniendo icono y texto además del color; verificar con las pruebas de componentes y que cada estado tiene icono y texto
- [x] 4.3 Aplicar la paleta oscura a histograma y dispersión (barras doradas, recta violeta discontinua con leyenda, cuadrícula y ejes en secundario, puntos con borde) y verificar con las pruebas de `charts.spec.ts` y una captura de ambas gráficas

## 5. Verificación y documentación

- [x] 5.1 Ejecutar `npm test -- --watch=false`, `npm run build` y `node scripts/check-layout.mjs` y verificar que las 272 pruebas pasan, la compilación no da errores ni avisos de presupuesto y no hay desbordes
- [x] 5.2 Ejecutar Lighthouse de accesibilidad en inicio, descriptiva con datos y prácticas y verificar puntaje ≥ 95 en las tres
- [x] 5.3 Regenerar `docs/capturas/` con `node scripts/capturas.mjs`, revisar las imágenes y actualizar `README.md` (tema, fuentes y script de contraste) y verificar que las capturas muestran el tema oscuro

## Workflow follow-up

- Si el tema no convence, la reversión es restaurar los tokens de `styles.css` y las fuentes; no hay cambios de lógica.
- Una variante clara o un selector de tema puede proponerse como change aparte.
