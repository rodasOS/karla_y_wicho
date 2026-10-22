# Tasks

## 1. Mover el proyecto a la raíz

- [x] 1.1 Comprobar que no hay `ng serve` ni otros procesos usando el proyecto (`pgrep -fa "ng serve"` sin resultados) y que la raíz no tiene nombres que choquen con los de `sigma-lab/` (`ls -A` de ambas carpetas)
- [x] 1.2 Mover todo el contenido de `sigma-lab/`, ocultos incluidos, a `proyecto_maza/` y verificar con `ls -A sigma-lab` que queda vacía
- [x] 1.3 Eliminar la carpeta `sigma-lab/` con `rmdir` y verificar que `proyecto_maza/` contiene `.claude`, `openspec`, `src`, `package.json`, `angular.json` y el resto, sin subcarpeta del proyecto

## 2. Referencias y verificación

- [x] 2.1 Cambiar en `openspec/changes/asistente-estadistica-aplicada/tasks.md` el comando de la tarea 1.1 a `ng new sigma-lab --directory .` y verificar con `grep -n "sigma-lab" openspec/changes/*/tasks.md` que ninguna tarea apunta a una subcarpeta
- [x] 2.2 Ejecutar desde la raíz `npm test -- --watch=false` y `npm run build` y verificar 272 pruebas aprobadas y compilación sin errores, con salida en `dist/sigma-lab/browser`
- [x] 2.3 Ejecutar desde la raíz `node scripts/check-contrast.mjs` y `./scripts/check-core-purity.sh` y verificar que terminan con éxito
- [x] 2.4 Ejecutar `openspec validate --all` y `openspec list --json` desde la raíz y verificar que ambos changes siguen siendo válidos, con 34/39 tareas completas en `asistente-estadistica-aplicada`
