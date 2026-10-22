// Compila para GitHub Pages: base-href del repositorio y 404.html (copia de index.html)
// para que recargar una ruta profunda (p. ej. /probabilidad) no dé error 404.
// Uso: npm run build:pages -- /nombre-del-repo/        (para usuario.github.io/nombre-del-repo/)
//      npm run build:pages                              (base "/", p. ej. dominio propio)
import { copyFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

let base = process.argv[2] ?? '/';
if (!base.startsWith('/')) base = '/' + base;
if (!base.endsWith('/')) base += '/';

const win = process.platform === 'win32';
const r = spawnSync(win ? 'npx.cmd' : 'npx', ['ng', 'build', '--base-href', base], { stdio: 'inherit', shell: win });
if (r.status !== 0) process.exit(r.status ?? 1);

const out = 'dist/sigma-lab/browser';
copyFileSync(`${out}/index.html`, `${out}/404.html`);
writeFileSync(`${out}/.nojekyll`, '');
console.log(`\nListo: ${out} (base-href ${base}, 404.html y .nojekyll incluidos)`);
