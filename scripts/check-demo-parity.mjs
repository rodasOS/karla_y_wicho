// Compara el estilo de la app con las medidas del demo https://uupm.cc/demo/fintech-crypto guardadas en docs/demo-reference.json.
// Tolera solo las desviaciones de accesibilidad declaradas en el JSON (_desviacionesPorAccesibilidad).
// Uso: node scripts/check-demo-parity.mjs [baseUrl]   (la app debe estar sirviéndose; requiere Chrome)
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const ref = JSON.parse(readFileSync(new URL('../docs/demo-reference.json', import.meta.url), 'utf8'));
const base = process.argv[2] ?? 'http://127.0.0.1:4300';
const b = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(base + '/', { waitUntil: 'networkidle' });

let fail = 0;
let n = 0;
const eq = (name, got, want) => {
  n++;
  const ok = String(got).replace(/\s+/g, '') === String(want).replace(/\s+/g, '');
  if (!ok) fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name.padEnd(46)} app=${got}  demo=${want}`);
};
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
const v = ref.variables;

// 1) Variables del demo ↔ tokens de la app
const tokens = await p.evaluate(() => {
  const s = getComputedStyle(document.documentElement);
  return Object.fromEntries(['--color-bg', '--color-surface', '--color-surface-2', '--color-text', '--color-text-muted', '--color-border', '--color-primary', '--color-cta', '--color-danger-solid'].map((k) => [k, s.getPropertyValue(k).trim().toLowerCase()]));
});
eq('--bg', tokens['--color-bg'], v.bg);
eq('--bg-card', tokens['--color-surface'], v.bgCard);
eq('--bg-card-hover', tokens['--color-surface-2'], v.bgCardHover);
eq('--text', tokens['--color-text'], v.text);
eq('--text-muted', tokens['--color-text-muted'], v.textMuted);
eq('--border', tokens['--color-border'], v.border);
eq('--primary', tokens['--color-primary'], v.primary);
eq('--cta / --secondary', tokens['--color-cta'], v.cta);
eq('rojo', tokens['--color-danger-solid'], v.red);

// 2) Componentes
const m = await p.evaluate(() => {
  const c = (s) => getComputedStyle(document.querySelector(s));
  const h2 = c('.sec-title');
  return {
    body: c('body').fontFamily, h1: c('h1').fontFamily, h1w: c('h1').fontWeight, h1s: c('h1').fontSize, h1l: c('h1').lineHeight,
    h2s: h2.fontSize, h2w: h2.fontWeight, lead: c('.sub').fontSize, leadL: c('.sub').lineHeight,
    bpBg: c('.cta .btn-primary').backgroundColor, bpC: c('.cta .btn-primary').color, bpR: c('.cta .btn-primary').borderRadius, bpP: c('.cta .btn-primary').padding, bpW: c('.cta .btn-primary').fontWeight, bpBorder: c('.cta .btn-primary').borderStyle,
    bsBg: c('.cta .btn-secondary').backgroundColor, bsC: c('.cta .btn-secondary').color, bsB: c('.cta .btn-secondary').border, bsR: c('.cta .btn-secondary').borderRadius, bsP: c('.cta .btn-secondary').padding, bsW: c('.cta .btn-secondary').fontWeight,
    gcBg: c('.cards .card').backgroundColor, gcB: c('.cards .card').border, gcR: c('.cards .card').borderRadius, gcP: c('.cards .card').padding, gcBlur: c('.cards .card').backdropFilter,
    pillC: c('.eyebrow').color, pillP: c('.eyebrow').padding, pillS: c('.eyebrow').fontSize, pillW: c('.eyebrow').fontWeight,
    tileW: c('.cards .icon-tile').width, tileR: c('.cards .icon-tile').borderRadius, tileC: c('.cards .icon-tile').color,
    hdBlur: c('header').backdropFilter, hdBb: c('header').borderBottom, hdH: document.querySelector('header').getBoundingClientRect().height,
    logoW: c('.logo').width, logoR: c('.logo').borderRadius, logoBg: c('.logo').backgroundImage,
    grad: c('.gradient-text').backgroundImage, gridSize: c('.hero').backgroundSize,
  };
});
const font = (s) => s.split(',')[0].replace(/"/g, '').trim();
eq('cuerpo: familia', font(m.body), ref.fuentes.cuerpo);
eq('h1: familia', font(m.h1), ref.fuentes.titulos);
eq('h1: peso', m.h1w, ref.fuentes.h1.weight);
eq('h1: tamaño', m.h1s, ref.fuentes.h1.size + 'px');
eq('h1: interlínea', m.h1l, ref.fuentes.h1.lineHeight + 'px');
eq('h2: peso', m.h2w, ref.fuentes.h2.weight);
eq('lead: tamaño', m.lead, ref.fuentes.lead.size + 'px');
eq('lead: interlínea', m.leadL, ref.fuentes.lead.lineHeight + 'px');
eq('btn-primary: fondo', m.bpBg, ref.btnPrimary.background);
eq('btn-primary: texto', m.bpC, ref.btnPrimary.color);
eq('btn-primary: radio', m.bpR, ref.btnPrimary.borderRadiusPx + 'px');
eq('btn-primary: padding', m.bpP, ref.btnPrimary.paddingPx);
eq('btn-primary: peso', m.bpW, ref.btnPrimary.weight);
eq('btn-primary: sin borde', m.bpBorder, 'none');
eq('btn-secondary: fondo', m.bsBg, ref.btnSecondary.background);
eq('btn-secondary: texto', m.bsC, ref.btnSecondary.color);
eq('btn-secondary: borde', m.bsB.replace(/ none.*$/, ''), ref.btnSecondary.border);
eq('btn-secondary: radio', m.bsR, ref.btnSecondary.borderRadiusPx + 'px');
eq('btn-secondary: padding', m.bsP, ref.btnSecondary.paddingPx);
eq('btn-secondary: peso', m.bsW, ref.btnSecondary.weight);
eq('glass-card: fondo', m.gcBg, ref.glassCard.background);
eq('glass-card: borde', m.gcB, ref.glassCard.border);
eq('glass-card: radio', m.gcR, ref.glassCard.borderRadiusPx + 'px');
eq('glass-card: relleno', m.gcP, ref.glassCard.paddingPx + 'px');
eq('glass-card: desenfoque', m.gcBlur, `blur(${ref.glassCard.blurPx}px)`);
eq('píldora verde: color', m.pillC, ref.pildoraVerde.color);
eq('píldora verde: padding', m.pillP, ref.pildoraVerde.paddingPx);
eq('píldora verde: tamaño', m.pillS, ref.pildoraVerde.sizePx + 'px');
eq('píldora verde: peso', m.pillW, ref.pildoraVerde.weight);
eq('icon-tile: tamaño', m.tileW, ref.iconTile.sizePx + 'px');
eq('icon-tile: radio', m.tileR, ref.iconTile.borderRadiusPx + 'px');
eq('icon-tile: icono azul', m.tileC, ref.iconTile.iconColor);
eq('cabecera: desenfoque', m.hdBlur, `blur(${ref.cabecera.blurPx}px)`);
eq('cabecera: borde inferior', m.hdBb.match(/^1px solid rgb\(\d+, \d+, \d+\)/)?.[0], ref.cabecera.borderBottom);
eq('cabecera: alto (≥ demo)', m.hdH >= ref.cabecera.heightPx, true);
eq('logo: tamaño', m.logoW, ref.logoTile.sizePx + 'px');
eq('logo: radio', m.logoR, ref.logoTile.borderRadiusPx + 'px');
eq('degradado azul → verde 135°', /135deg.*rgb\(0, 128, 255\).*rgb\(57, 255, 20\)/.test(m.grad), true);
eq('cuadrícula: tamaño', m.gridSize.split(',')[0].trim(), `${ref.gridBg.sizePx}px ${ref.gridBg.sizePx}px`);

// 3) Hover (botón primario y secundario, tarjeta)
await p.hover('.cta .btn-primary');
await p.waitForTimeout(350);
const hp = await p.evaluate(() => { const c = getComputedStyle(document.querySelector('.cta .btn-primary')); return { tf: c.transform, sh: c.boxShadow }; });
eq('btn-primary hover: desplazamiento', hp.tf, `matrix(1, 0, 0, ${1 * 0 + 1}, 0, ${ref.btnPrimary.hoverTranslateYPx})`.replace('0, 1, 0,', '0, 1, 0,'));
eq('btn-primary hover: resplandor verde', hp.sh.includes('rgba(57, 255, 20, 0.4)') && hp.sh.includes('30px'), true);
await p.hover('.cta .btn-secondary');
await p.waitForTimeout(350);
const hs = await p.evaluate(() => { const c = getComputedStyle(document.querySelector('.cta .btn-secondary')); return { bc: c.borderColor, bg: c.backgroundColor }; });
eq('btn-secondary hover: borde', hs.bc, ref.btnSecondary.hoverBorder);
eq('btn-secondary hover: fondo', hs.bg, ref.btnSecondary.hoverBackground);
await p.hover('.cards .card');
await p.waitForTimeout(450);
const hc = await p.evaluate(() => { const c = getComputedStyle(document.querySelector('.cards .card')); return { bc: c.borderColor, bg: c.backgroundColor, sh: c.boxShadow }; });
eq('glass-card hover: borde', hc.bc, ref.glassCard.hoverBorder);
eq('glass-card hover: fondo', hc.bg, ref.glassCard.hoverBackground);
eq('glass-card hover: brillo azul', hc.sh.includes('rgba(0, 128, 255, 0.15)') && hc.sh.includes('30px'), true);

// 4) Pestaña activa (desviación declarada: texto azul marino en vez de blanco)
await p.goto(base + '/probabilidad', { waitUntil: 'networkidle' });
const t = await p.evaluate(() => { const c = getComputedStyle(document.querySelector('app-tabs button.on')); const i = getComputedStyle(document.querySelector('app-tabs button:not(.on)')); return { bg: c.backgroundColor, r: c.borderRadius, off: i.color }; });
eq('pestaña activa: fondo azul', t.bg, ref.tab.activeBackground);
eq('pestaña: radio', t.r, ref.tab.borderRadiusPx + 'px');
eq('pestaña inactiva: color', t.off, ref.tab.inactiveColor);
console.log('INFO desviaciones aceptadas por accesibilidad:', Object.keys(ref._desviacionesPorAccesibilidad).join(', '));

await b.close();
console.log(fail ? `\n${fail} de ${n} no coinciden con el demo` : `\nTodas las ${n} medidas coinciden con el demo`);
process.exit(fail ? 1 : 0);
