# Tasks

## 1. Andamiaje del proyecto

- [x] 1.1 Crear el proyecto con `npx @angular/cli@21 new sigma-lab --directory . --style=css --routing --ssr=false` en la raíz y verificar que `ng build` y `ng test` terminan sin errores
- [x] 1.2 Instalar `katex` y `@fontsource` (Plus Jakarta Sans, JetBrains Mono) y verificar que `ng build` los incluye sin peticiones a CDN
- [x] 1.3 Crear la estructura `core/ data/ shared/ features/` de `design.md` (D2) y verificar que `core/` no importa `@angular/*` con un `grep` en CI/script
- [x] 1.4 Definir tokens CSS en `styles.css` (colores, radio, espacios, tipografía) según D12 y verificar los contrastes de las parejas texto/fondo con un script o herramienta (≥ 4.5:1)

## 2. Motor de cálculo (`core/math`)

- [x] 2.1 Implementar estadística descriptiva (media, mediana, moda/multimodal, rango, varianza y desviación muestral/poblacional, cuartiles `QUARTILE.INC`, RIC, CV) y verificar con pruebas Vitest, incluido el caso 2.1/2.3/2.2/2.4/2.0 (media 2.2, s = 0.15811, σ = 0.14142)
- [x] 2.2 Implementar distribución normal (CDF de alta precisión e inversa con refinamiento) y verificar con pruebas contra valores de referencia SciPy (z = 1 → 0.841345, percentil 95 → 1.644854, error < 1e-9)
- [x] 2.3 Implementar correlación de Pearson, regresión lineal simple, R² y predicción y verificar con pruebas, incluidos r = 1 perfecto y variable constante (indefinido)
- [x] 2.4 Implementar probabilidad básica (complemento, unión, condicional, Bayes, permutaciones, combinaciones) y verificar con pruebas (C(10,3) = 120, P(A∪B) = 0.7)
- [x] 2.5 Implementar unidades SI (prefijos y magnitudes compatibles), error estándar, cifras significativas y valores atípicos 1.5·RIC y verificar con pruebas (2.20 ± 0.07 A; A→mA ×1000; A→m rechazado)
- [x] 2.6 Implementar tabla de frecuencias (Sturges, amplitud, acumuladas) y verificar con pruebas que Σf = n y que las frecuencias relativas suman 1

## 3. Parsers, validación y modelo `Solution`

- [x] 3.1 Implementar `data-parser` (separadores `, ; espacio \n`, coma/punto decimal, errores por token) y verificar con pruebas de entradas hostiles ("2,1; 2,3  2.2\n2.4", "2.1, abc", vacío, solo separadores)
- [x] 3.2 Definir `Solution`/`Step`/`Warning` y los builders de pasos (fórmula TeX, sustitución con los datos originales del usuario, procedimiento, respuesta, interpretación en español) y verificar con pruebas que la sustitución reproduce el resultado numérico
- [x] 3.3 Implementar reglas de validación y advertencias (n mínimo, σ ≤ 0, probabilidad fuera de [0,1], longitudes x/y distintas, extrapolación, atípicos) y verificar con una prueba por cada escenario de `input-validation-and-guidance`
- [x] 3.4 Implementar `question-parser` (intención por palabras clave, extracción de números, confianza, fuera de alcance) y verificar con ≥ 15 frases de prueba, incluida "calcula la media y la desviación estándar muestral de 2.1, 2.3, 2.2, 2.4 y 2.0"

## 4. Componentes compartidos y shell

- [x] 4.1 Implementar `layout` (header con barra de pregunta, nav lateral/inferior, footer con integrantes, carnés, asignatura y sección) y verificar que el footer aparece en todas las rutas y no hay scroll horizontal a 375 px
- [x] 4.2 Implementar `formula` con KaTeX y `aria-label` y verificar que s = √(Σ(xᵢ−x̄)²/(n−1)) se renderiza y se lee con un lector/inspección del DOM
- [x] 4.3 Implementar `solution-view`, `result-card` y `alert-banner` (cuatro pasos, acordeón, `aria-live`) y verificar con pruebas de componente que dibujan una `Solution` de ejemplo en el orden fórmula → sustitución → procedimiento → respuesta
- [x] 4.4 Implementar `data-input` (textarea, chips de lectura, error por campo con `aria-describedby`, resumen enfocable) y verificar con pruebas de componente y navegación solo con teclado
- [x] 4.5 Configurar rutas diferidas (`app.routes.ts`) para todos los módulos y una página 404 interna y verificar que cada URL carga su módulo tras recargar con `ng serve`

## 5. Módulos de cálculo (UI)

- [x] 5.1 Construir `home` (nombre Sigma Lab, propósito, barra de pregunta, 6 tarjetas, botón "ejemplo de corriente") y verificar que el botón abre el resultado 2.2 A / 0.158 A
- [x] 5.2 Construir `descriptive` (datos, tipo poblacional/muestral, decimales 2–6) y verificar con el ejemplo de corriente y con datos sin moda y multimodales
- [x] 5.3 Construir `experimental` (unidad, error estándar, reporte x̄ ± s/√n, conversión, atípicos) y verificar el reporte 2.20 ± 0.07 A y el rechazo A→m
- [x] 5.4 Construir componentes SVG `histogram` y `scatter` (ejes rotulados, `role="img"`, tabla equivalente) y verificar con pruebas de componente y revisión visual a 375 y 1024 px
- [x] 5.5 Construir `tables-charts` (tabla de frecuencias, clases automáticas/manuales, histograma, dispersión) y verificar Σf = n y la advertencia de pares incompletos
- [x] 5.6 Construir `probability` (pestañas Eventos / Clásica / Normal / Inverso, usar media y s de la serie) y verificar P(X<115) = 0.8413, P(85<X<115) = 0.6827, percentil 95 ≈ 124.67 y σ ≤ 0 rechazado
- [x] 5.7 Construir `regression` (pares x,y, r, a, b, R², predicción, recta sobre dispersión, interpretación con unidades) y verificar r = 1 en el caso perfecto, la advertencia con 2 pares y la de extrapolación
- [x] 5.8 Construir `interpretation` (σ vs s con los datos del usuario, explicación de n − 1) y verificar que muestra 0.1414 y 0.1581 para el ejemplo de corriente
- [x] 5.9 Construir `ask` (barra de pregunta, resultados de intención, aclaración, precarga de módulo) y verificar los escenarios de pregunta reconocida, ambigua y sin datos

## 6. Ejemplos y prácticas

- [x] 6.1 Escribir `data/examples.ts` con ≥ 12 ejemplos que cubran los 6 módulos (incluido corriente 2.1…2.0 A) y la pantalla `examples` con carga en un clic; verificar con una prueba que cada ejemplo se resuelve sin advertencias bloqueantes
- [x] 6.2 Implementar generadores de prácticas por módulo y nivel y el comprobador de respuestas con tolerancia y pistas de error común (n vs n − 1); verificar con pruebas que la respuesta esperada siempre iguala la del motor con 500 semillas aleatorias
- [x] 6.3 Construir `practice` (enunciado, respuesta, comprobar, retroalimentación, ver solución, siguiente, marcador aciertos/intentos) y verificar los escenarios correcto, incorrecto con pista y no numérico

## 7. Pulido, accesibilidad y evidencia

- [x] 7.1 Aplicar `prefers-reduced-motion`, foco visible, objetivos táctiles ≥ 44 px y `lang="es"`; verificar con Lighthouse accesibilidad ≥ 95 en inicio, descriptiva y prácticas
- [x] 7.2 Añadir captura global de errores con mensaje en español y botón de reinicio; verificar provocando un error y comprobando que la app no queda en blanco
- [ ] 7.3 Revisión cruzada de fórmulas: cada integrante verifica a mano 3 problemas nuevos por módulo contra el asistente y anota los resultados en `docs/pruebas.md`; verificar que todas las diferencias son < 0.5 % del último dígito mostrado
- [x] 7.4 Escribir `README.md` (cómo ejecutar, probar y desplegar, autores) y verificar que los comandos documentados funcionan en una copia limpia

## 8. Publicación y entrega

- [ ] 8.1 Configurar `base-href` y el despliegue a GitHub Pages (workflow o `ngh-pages`) con `404.html` copia de `index.html`; verificar que la URL pública carga y que recargar `/probabilidad` no da 404
- [ ] 8.2 Verificar el enlace en ventana privada, sin sesión, en escritorio y en móvil, y desplegar un respaldo en un segundo hosting gratuito; verificar que ambas URL funcionan
- [ ] 8.3 Tomar capturas (inicio, descriptiva con ejemplo de corriente, histograma, normal, regresión, práctica con retroalimentación, error de entrada) y redactar el informe de ≤ 3 páginas (integrantes, herramientas, funcionalidades, pruebas, capturas); verificar el conteo de páginas y que incluye la URL
- [ ] 8.4 Ensayo de defensa: cada integrante explica y demuestra el flujo de un módulo y el motor de cálculo; verificar con una lista de preguntas que ambos responden sobre arquitectura, `Solution` y σ vs s

## Workflow follow-up

- Subir a Canvas el enlace único y el informe antes del domingo 25/10/2026.
- Mantener el enlace disponible durante la revisión.
- Archivar este change con `/opsx:archive` tras la entrega.
