// Verifica el contraste WCAG del estilo del demo leyendo los tokens de src/styles.css.
// Texto: >= 4.5:1. Bordes de campos y foco: >= 3:1. Los fondos translúcidos se componen sobre la superficie real.
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const root = css.slice(css.indexOf(':root'), css.indexOf('\n}\n', css.indexOf(':root')));
const tok = {};
for (const m of root.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) tok[m[1]] = m[2].trim();

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function parse(v) {
  v = v.trim();
  if (v.startsWith('#')) return { rgb: hex(v), a: 1 };
  const m = v.match(/rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+)%)?\s*\)/);
  if (!m) throw new Error('Color no reconocido: ' + v);
  return { rgb: [+m[1], +m[2], +m[3]], a: m[4] === undefined ? 1 : +m[4] / 100 };
}
const over = (fg, bg) => {
  const f = parse(fg);
  const b = parse(bg);
  return '#' + f.rgb.map((c, i) => Math.round(c * f.a + b.rgb[i] * (1 - f.a)).toString(16).padStart(2, '0')).join('');
};
const lum = (h) => {
  const c = hex(h).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const T = (n) => {
  if (!tok[n]) throw new Error('Falta el token --' + n);
  return tok[n];
};

const bg = T('color-bg');
const card = T('color-surface');
const hover = T('color-surface-2');
const glassCard = over(T('glass-bg'), bg); // tarjeta de vidrio sobre el fondo
const header = over(T('header-bg'), bg);

const pairs = [];
const add = (name, fg, back, min = 4.5) => pairs.push({ name, fg, back, min });

// Texto principal y secundario sobre todas las superficies
for (const [n, b] of [['fondo', bg], ['tarjeta', card], ['tarjeta hover', hover], ['tarjeta de vidrio', glassCard], ['cabecera de vidrio', header]]) {
  add(`texto / ${n}`, T('color-text'), b);
  add(`texto secundario / ${n}`, T('color-text-muted'), b);
}
// Verde neón (acento, estados positivos, foco)
for (const [n, b] of [['fondo', bg], ['tarjeta', card], ['tarjeta hover', hover]]) add(`verde neón / ${n}`, T('color-cta'), b);
add('texto sobre botón verde', T('color-on-cta'), T('color-cta'));
// Azul: como texto se usa la variante clara; el azul del demo queda para bordes, iconos y relleno
for (const [n, b] of [['fondo', bg], ['tarjeta', card], ['tarjeta hover', hover]]) add(`azul (texto) / ${n}`, T('color-primary-text'), b);
add('texto sobre azul (pestaña activa)', T('color-on-primary'), T('color-primary'));
// Píldoras y estados: texto sobre su fondo al 10 % compuesto con la tarjeta
for (const s of ['success', 'warning', 'danger', 'info']) {
  const tint = over(T(`color-${s}-bg`), card);
  add(`${s} / su fondo`, T(`color-${s}`), tint);
  add(`${s} / tarjeta`, T(`color-${s}`), card);
  add(`texto / fondo ${s}`, T('color-text'), tint);
}
add('píldora azul activa (azul sobre su fondo)', T('color-primary-text'), over(T('color-primary-soft'), card));
// No texto: controles, foco y gráficos (>= 3:1)
for (const [n, b] of [['fondo', bg], ['tarjeta', card], ['tarjeta de vidrio', glassCard]]) add(`borde de campo / ${n}`, T('color-border-strong'), b, 3);
add('foco verde / fondo', T('color-cta'), bg, 3);
add('foco verde / tarjeta', T('color-cta'), card, 3);
add('azul del demo (iconos, bordes) / tarjeta', T('color-primary'), card, 3);
add('azul del demo / fondo', T('color-primary'), bg, 3);
add('verde (puntos y barras) / tarjeta', T('color-cta'), card, 3);

let fail = 0;
for (const p of pairs) {
  const r = ratio(p.fg, p.back);
  const ok = r >= p.min;
  if (!ok) fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${p.name.padEnd(46)} ${r.toFixed(2)}:1 (mín ${p.min})`);
}
// Pares del demo que NO se usan por incumplir (documentados en design.md)
const w = ratio('#ffffff', T('color-primary'));
console.log(`INFO blanco sobre #0080FF = ${w.toFixed(2)}:1 (< 4.5): no se usa; la pestaña activa lleva texto azul marino`);
const bd = ratio(T('color-border'), card);
console.log(`INFO borde del demo #1E2650 / tarjeta = ${bd.toFixed(2)}:1: solo decorativo; los campos usan --color-border-strong`);
if (w >= 4.5) { console.log('FAIL el aviso de blanco sobre azul ya no aplica: revisar design.md'); fail++; }
console.log(fail ? `\n${fail} pareja(s) no cumplen` : `\nTodas las ${pairs.length} parejas cumplen`);
process.exit(fail ? 1 : 0);
