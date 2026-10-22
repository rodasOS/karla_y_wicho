# Design

## Context

Estado observado: `proyecto_maza/` contiene `.claude/`, `openspec/` y `sigma-lab/`. `sigma-lab/` contiene el proyecto completo, incluidos archivos ocultos (`.editorconfig`, `.gitignore`, `.prettierrc`, `.github/`, `.vscode/`), `node_modules/`, `dist/` y `.angular/`. La raíz no tiene archivos que choquen con esos nombres. No es un repositorio git. Las únicas referencias textuales a la subcarpeta están en la tarea 1.1 del otro change; `package.json`, `angular.json`, `README.md`, `scripts/build-pages.mjs` y `deploy.yml` usan el nombre `sigma-lab` solo como nombre de proyecto y de carpeta de `dist/`, no como ruta.

## Goals / Non-Goals

**Goals:**
- Que todo el proyecto quede en la raíz, con los mismos resultados de pruebas y de compilación.
- No perder ni duplicar archivos.

**Non-Goals:**
- Renombrar el proyecto Angular ni cambiar `dist/sigma-lab/browser` (cambiaría el workflow y el script de despliegue sin beneficio).
- Tocar el código de la app, `openspec/` o `.claude/`.

## Decisions

### D1. Mover con `mv` en el mismo sistema de archivos, incluido `node_modules/`
Es un renombrado instantáneo y evita reinstalar. **Alternativa:** copiar y reinstalar con `npm ci`: más lento y sin ventaja. Se confirma después con una copia limpia que `npm ci` funciona igual.

### D2. Mantener el nombre `sigma-lab` del proyecto Angular
Define el nombre del paquete y la carpeta de salida; no depende de la carpeta contenedora. **Alternativa:** renombrar a `proyecto_maza`: obligaría a cambiar `angular.json`, el workflow y los scripts.

### D3. Corregir el texto de la tarea 1.1 en vez de dejarlo como historia
La tarea quedaría documentando un comando que crea la subcarpeta; se cambia a `ng new sigma-lab --directory .` para que quien repita el proceso no cometa el mismo error.

### D4. Verificar antes de borrar la carpeta hija
Primero mover y comprobar que `sigma-lab/` quedó vacía (`rmdir` solo borra carpetas vacías, así que falla si algo no se movió).

## Risks / Trade-offs

- [Un servidor de desarrollo o proceso usa archivos de la carpeta] → comprobar que no hay `ng serve` activo antes de mover.
- [Archivos ocultos que un `mv *` no mueve] → mover con un patrón que incluya los ocultos y confirmar con `ls -A` que `sigma-lab/` queda vacía.
- [Algún script asume una ruta relativa] → ejecutar pruebas, compilación y los scripts de `scripts/` desde la raíz tras el movimiento.
