# Sigma Lab — Asistente Virtual de Estadística Aplicada

Proyecto académico · Universidad Mariano Gálvez de Guatemala · Facultad de Ingeniería · Estadística Aplicada · Sección Única

**Integrantes**

- Luis Fernando Samayoa Santos — 2990-25-21483
- Karla Estefani Gonzáles Tista — 2990-25-16308

Aplicación web (Angular 21 LTS) que resuelve problemas de estadística y muestra siempre **fórmula → sustitución → procedimiento → respuesta e interpretación**.
Todo se calcula en el navegador: no hay servidor, cuentas ni claves, y los datos del usuario no salen del equipo.

**Estilo visual:** tomado del demo <https://uupm.cc/demo/fintech-crypto> (medido en `docs/demo-reference.json`): fondo azul marino `#0A0E27`, tarjetas de vidrio `#0F1635`, verde neón `#39FF14` en el botón principal y azul `#0080FF` como acento, texto con degradado azul→verde en las cifras principales, píldoras, baldosas de iconos y cuadrícula de fondo. Fuentes Space Grotesk (títulos) y DM Sans (texto), autohospedadas. Todo el aspecto sale de los tokens de `src/styles.css`. Las únicas desviaciones del demo son por accesibilidad y están documentadas en el JSON.

## Módulos

Estadística descriptiva · Datos experimentales (unidades, incertidumbre) · Tablas y gráficas (frecuencias, histograma, dispersión) ·
Probabilidad y distribución normal · Correlación y regresión lineal simple · Interpretación σ frente a s · Ejemplos (14) · Prácticas con retroalimentación · Barra de pregunta en lenguaje natural.

## Requisitos

Node.js 20.19+ (probado con 24) y npm.

## Comandos

```bash
npm ci            # instala dependencias
npm start         # servidor de desarrollo en http://localhost:4200
npm test -- --watch=false   # pruebas (Vitest): motor, parsers, componentes y rutas
npm run build     # compilación de producción en dist/sigma-lab/browser
```

Verificaciones adicionales (con la app sirviéndose y Google Chrome instalado):

```bash
node scripts/check-layout.mjs http://localhost:4200   # sin scroll horizontal a 375/768/1024/1440 px y pie visible
node scripts/check-contrast.mjs                       # contraste WCAG de los tokens (texto 4.5:1, controles 3:1)
node scripts/check-theme.mjs http://localhost:4200    # botones, tarjetas de vidrio, píldoras, pestañas, foco, movimiento reducido y gráficas
node scripts/check-demo-parity.mjs http://localhost:4200  # compara 58 medidas de la app con las del demo
node scripts/comparar-demo.mjs http://localhost:4200  # imágenes demo | app en docs/comparacion (requiere internet)
node scripts/capturas.mjs http://localhost:4200       # regenera las capturas del informe en docs/capturas
./scripts/check-core-purity.sh                        # core/ no importa Angular
```

## Estructura

```
src/app/core      Motor de cálculo en TypeScript puro (math, steps, parsing, validation, practice)
src/app/data      Ejemplos, autores, datos de muestra
src/app/shared    Componentes reutilizables (solution-view, formula, charts SVG, layout…)
src/app/features  Una pantalla por módulo (carga diferida)
docs/pruebas.md   Evidencia de verificación de exactitud
```

## Publicación

Ver la sección «Publicación» más abajo cuando el despliegue esté configurado.
