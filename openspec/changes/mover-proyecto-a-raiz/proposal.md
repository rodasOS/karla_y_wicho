# Proposal

## Why

El proyecto Angular quedó dentro de una subcarpeta `sigma-lab/` de la carpeta raíz `proyecto_maza/`, porque la tarea 1.1 de `asistente-estadistica-aplicada` usó `ng new sigma-lab`, que crea una carpeta hija. Nadie pidió esa subcarpeta: el proyecto debe vivir directamente en la carpeta raíz, junto a `openspec/` y `.claude/`.

## What Changes

- Mover el contenido de `sigma-lab/` (código, `package.json`, `angular.json`, `src/`, `docs/`, `scripts/`, `.github/`, archivos ocultos de configuración y `node_modules/`) a la raíz `proyecto_maza/`.
- Eliminar la carpeta `sigma-lab/` una vez vacía.
- Corregir la referencia a la subcarpeta en las tareas del change `asistente-estadistica-aplicada` (tarea 1.1) para que el comando documentado coincida con el resultado final.
- Sin cambios de comportamiento: la app, sus pruebas, el nombre del proyecto Angular (`sigma-lab`) y la ruta de salida `dist/sigma-lab/browser` se mantienen.

## Capabilities

### New Capabilities

(ninguna: es una reorganización de archivos)

### Modified Capabilities

(ninguna: no cambia ningún requisito; el change declara `skip_specs: true`)

## Impact

- Estructura de carpetas: `sigma-lab/*` pasa a `./*`. Los comandos (`npm test`, `npm run build`, `node scripts/…`) se ejecutan desde la raíz.
- `openspec/` y `.claude/` no se tocan, salvo el texto de la tarea 1.1.
- El workflow de GitHub Pages queda coherente: la raíz del repositorio pasa a ser `proyecto_maza/` y contiene el proyecto, `openspec/` y `.claude/`.
- No hay repositorio git todavía, así que no hay historial que reescribir.
