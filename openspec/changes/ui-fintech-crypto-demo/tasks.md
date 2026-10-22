# Tasks

## 1. Referencia del demo, tokens y fuentes

- [x] 1.1 Guardar las medidas del demo en `docs/demo-reference.json` (variables, fuentes, botones, tarjeta, píldoras, baldosa, pestaña, cabecera, brillos y rojo) tal como están en `design.md` y verificar que el JSON es válido y contiene `--primary:#0080ff`, `--cta:#39ff14`, `--bg:#0a0e27`, `--bg-card:#0f1635` y `--border:#1e2650`
- [x] 1.2 Instalar `@fontsource/space-grotesk` y `@fontsource/dm-sans`, retirar `@fontsource/orbitron` y `@fontsource/exo-2`, y verificar con `npm run build` que las fuentes salen en `dist/` sin peticiones a CDN (`grep -rE "https?://(fonts|cdn)" dist`)
- [x] 1.3 Reemplazar los tokens de `src/styles.css` por los del demo (más `--color-primary-text`, `--color-danger-text`, `--color-border-strong`, brillos, degradado y sombras) y los roles de fuente, y actualizar `theme-color`; verificar con `npm run build` sin errores y que ya no queda `#f59e0b`, `#8b5cf6` ni `Orbitron` en `src/` (`grep -rniE "f59e0b|8b5cf6|orbitron" src`)
- [x] 1.4 Reescribir `scripts/check-contrast.mjs` con las parejas del estilo del demo (incluidos los pares que fallan con el color original y su variante) y verificar que termina con éxito y que reporta explícitamente blanco sobre `#0080FF` como no usado

## 2. Sistema de componentes globales

- [x] 2.1 Crear en `src/styles.css` los botones del demo (`.btn-primary`, `.btn-secondary`, compacto, deshabilitado, foco verde con separación) y migrar todas las plantillas desde `.btn`/`.btn.secondary`; verificar con `npm test -- --watch=false` y con una prueba en navegador de que el principal mide ≥ 44 px, tiene radio 12 px, fondo `rgb(57, 255, 20)` y eleva 2 px al pasar el cursor
- [x] 2.2 Crear `.glass-card` (+ `-hover`), `.pill` (verde, azul, rojo, ámbar), `.icon-tile`, `.gradient-text`, `.text-glow`, `.glow-*` y `.grid-bg`, con alternativa sólida a `backdrop-filter` y `prefers-reduced-motion`; verificar con `scripts/check-theme.mjs` actualizado que la tarjeta computa fondo `#0F1635` al 80 %, borde de 1 px y radio de 16 px
- [x] 2.3 Restyling de campos, selectores, casillas, opciones tipo radio y tablas de datos con las clases y tokens nuevos (foco azul con brillo, borde de control, filas con hover); verificar con las pruebas de `data-input` y `number-field` y una captura del formulario de descriptiva

## 3. Estructura

- [x] 3.1 Rehacer cabecera (vidrio 80 % con `blur(12px)`, logo en baldosa de degradado, marca en Space Grotesk, «Preguntar» como botón principal compacto), menú lateral, barra inferior, hoja de módulos, pie y aviso de error; verificar con `node scripts/check-layout.mjs` sin desbordes y con las pruebas de `app.spec.ts`
- [x] 3.2 Rehacer el inicio: `.grid-bg` con resplandores, píldora verde, título de 60 px con «Lab» en degradado, botones del demo y tarjetas de módulo con baldosas de icono y hover azul; verificar con `modules.spec.ts` y una captura a 1440 px y a 375 px comparada con el demo

## 4. Módulos y resultados

- [x] 4.1 Convertir paneles, resumen superior, pasos del procedimiento (círculo con degradado), `result-card`/`kpi` (cifra principal con `.gradient-text`), formulas, alertas como píldoras con icono y texto, estados vacíos y pestañas en píldora (activa `#0080FF` con texto azul marino); verificar con las pruebas de `solution-view`, `kpi`, `alert-banner` y `tabs` y que el ejemplo de corriente muestra 2.2000 A y 0.1581 A sin desbordar a 375 px
- [x] 4.2 Aplicar el estilo a prácticas (aciertos/intentos, retroalimentación con icono y texto), ejemplos, pregunta, regresión, probabilidad, tablas y gráficas, e interpretación; verificar con `modules.spec.ts` y `examples-practice.spec.ts` sin cambiar su intención
- [x] 4.3 Aplicar la paleta a histograma y dispersión (barras con degradado verde, puntos verdes con halo, recta azul discontinua con leyenda, cuadrícula `#1E2650`) y verificar con `charts.spec.ts` y con `check-theme.mjs` que los colores computados coinciden

## 5. Verificación contra el demo y documentación

- [x] 5.1 Crear `scripts/check-demo-parity.mjs`, que compara los estilos computados de la app con `docs/demo-reference.json` (botones, tarjeta, título, píldora, baldosa, pestaña activa, cabecera, fondo y fuentes) tolerando solo las desviaciones de contraste de `design.md`, y verificar que termina con éxito
- [x] 5.2 Ejecutar `npm test -- --watch=false`, `npm run build`, `check-layout.mjs`, `check-theme.mjs`, `check-contrast.mjs` y `check-demo-parity.mjs` y verificar que todo pasa, que no hay avisos de presupuesto y que no hay desbordes a 375, 768, 1024 y 1440 px
- [x] 5.3 Ejecutar Lighthouse de accesibilidad en inicio, descriptiva con datos y prácticas y verificar puntaje ≥ 95 en las tres
- [x] 5.4 Hacer capturas del demo y de la app lado a lado (inicio, tarjetas, botones, píldoras, cifras con degradado, pestañas) en `docs/comparacion/`, revisarlas y verificar que colorimetría, botones y tarjetas son visualmente equivalentes
- [x] 5.5 Regenerar `docs/capturas/` con `node scripts/capturas.mjs` y actualizar `README.md` (estilo del demo, fuentes y nuevos scripts) y verificar que las capturas muestran el estilo del demo

## Workflow follow-up

- Archivar `tema-fintech-crypto` sin sincronizar su spec `visual-theme`, que este change reemplaza (por ejemplo `openspec archive tema-fintech-crypto --skip-specs`), y luego archivar este change.
- Si algún valor del demo cambia en el futuro, actualizar `docs/demo-reference.json` y volver a ejecutar el script de paridad.
