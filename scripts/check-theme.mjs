// Comprobaciones del estilo del demo en un navegador real: tema oscuro, botones, tarjetas de vidrio, foco,
// movimiento reducido, pestañas y gráficas.
// Uso: node scripts/check-theme.mjs [baseUrl]   (la app debe estar sirviéndose; requiere Chrome)
import { chromium } from 'playwright-core';

const base = process.argv[2] ?? 'http://127.0.0.1:4300';
const b = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true });
let fail = 0;
const check = (name, ok, extra = '') => {
  if (!ok) fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${extra ? ' · ' + extra : ''}`);
};
const px = (v) => parseFloat(v);

// 1) Colores base aunque el sistema esté en tema claro
{
  const ctx = await b.newContext({ colorScheme: 'light' });
  const p = await ctx.newPage();
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const cs = (el, k) => getComputedStyle(el)[k];
    return {
      bg: cs(document.body, 'backgroundColor'),
      text: cs(document.body, 'color'),
      font: cs(document.body, 'fontFamily'),
      h1: cs(document.querySelector('h1'), 'fontFamily'),
      muted: cs(document.querySelector('.sub'), 'color'),
    };
  });
  check('fondo #0A0E27 con el sistema en claro', r.bg === 'rgb(10, 14, 39)', r.bg);
  check('texto blanco', r.text === 'rgb(255, 255, 255)', r.text);
  check('texto secundario #8B92B3', r.muted === 'rgb(139, 146, 179)', r.muted);
  check('cuerpo en DM Sans', r.font.includes('DM Sans'), r.font);
  check('títulos en Space Grotesk', r.h1.includes('Space Grotesk'), r.h1);
  await ctx.close();
}

// 2) Botones del demo
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  const get = (sel) => p.evaluate((s) => {
    const e = document.querySelector(s);
    const c = getComputedStyle(e);
    const r = e.getBoundingClientRect();
    return { bg: c.backgroundColor, color: c.color, radius: c.borderRadius, weight: c.fontWeight, border: c.border, h: r.height, tf: c.transform, shadow: c.boxShadow, bc: c.borderColor, pad: c.padding };
  }, sel);
  const prim = await get('.cta .btn-primary');
  check('botón principal verde neón con texto azul marino', prim.bg === 'rgb(57, 255, 20)' && prim.color === 'rgb(10, 14, 39)', `${prim.bg} / ${prim.color}`);
  check('botón principal: radio 12 px, peso 600, padding 14×32', prim.radius === '12px' && prim.weight === '600' && prim.pad === '14px 32px', `${prim.radius} ${prim.weight} ${prim.pad}`);
  check('botón principal ≥ 44 px de alto', prim.h >= 44, `${prim.h}px`);
  await p.hover('.cta .btn-primary');
  await p.waitForTimeout(350);
  const ph = await get('.cta .btn-primary');
  check('hover principal: se eleva 2 px', /matrix\(1, 0, 0, 1, 0, -2\)/.test(ph.tf), ph.tf);
  check('hover principal: resplandor verde', ph.shadow.includes('57, 255, 20'), ph.shadow);
  const sec = await get('.cta .btn-secondary');
  check('botón secundario transparente, borde 1 px #1E2650, texto blanco', sec.bg === 'rgba(0, 0, 0, 0)' && sec.border.startsWith('1px solid rgb(30, 38, 80)') && sec.color === 'rgb(255, 255, 255)', `${sec.bg} | ${sec.border}`);
  check('botón secundario: radio 12 px, peso 500', sec.radius === '12px' && sec.weight === '500', `${sec.radius} ${sec.weight}`);
  await p.hover('.cta .btn-secondary');
  await p.waitForTimeout(350);
  const sh = await get('.cta .btn-secondary');
  check('hover secundario: borde azul y fondo azul al 10 %', sh.bc === 'rgb(0, 128, 255)' && sh.bg === 'rgba(0, 128, 255, 0.1)', `${sh.bc} | ${sh.bg}`);
  // Deshabilitado
  await p.goto(base + '/probabilidad', { waitUntil: 'networkidle' });
  const dis = await p.evaluate(() => {
    const e = document.querySelector('details.stats-box button:disabled') ?? (document.querySelector('details.stats-box summary').click(), document.querySelector('details.stats-box button:disabled'));
    const c = getComputedStyle(e);
    return { op: c.opacity, cur: c.cursor, tf: c.transform };
  });
  check('botón deshabilitado atenuado y sin elevación', Number(dis.op) <= 0.5 && dis.cur === 'not-allowed' && (dis.tf === 'none' || dis.tf.endsWith('0, 0)')), JSON.stringify(dis));
}

// 3) Tarjetas de vidrio, píldora, baldosa y degradado
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const c = (s) => getComputedStyle(document.querySelector(s));
    const card = c('.cards .card');
    const tile = c('.cards .icon-tile');
    const pill = c('.eyebrow');
    const lab = c('h1 .gradient-text');
    return {
      cardBg: card.backgroundColor, blur: card.backdropFilter, border: card.border, radius: card.borderRadius, pad: card.padding,
      tileW: tile.width, tileR: tile.borderRadius, tileColor: tile.color,
      pillColor: pill.color, pillRadius: pill.borderRadius, pillPad: pill.padding,
      grad: lab.backgroundImage, clip: lab.webkitBackgroundClip || lab.backgroundClip,
      grid: c('.hero').backgroundImage.includes('linear-gradient'), gridSize: c('.hero').backgroundSize,
    };
  });
  check('tarjeta: fondo #0F1635 al 80 % y desenfoque de 20 px', r.cardBg === 'rgba(15, 22, 53, 0.8)' && r.blur.includes('blur(20px)'), `${r.cardBg} ${r.blur}`);
  check('tarjeta: borde 1 px al 50 %, radio 16 px, relleno 24 px', r.border.startsWith('1px solid rgba(30, 38, 80, 0.5)') && r.radius === '16px' && r.pad === '24px', `${r.border} ${r.radius} ${r.pad}`);
  check('baldosa de icono de 48 px, radio 12 px, icono azul', r.tileW === '48px' && r.tileR === '12px' && r.tileColor === 'rgb(0, 128, 255)', `${r.tileW} ${r.tileR} ${r.tileColor}`);
  check('píldora verde con radio completo y padding 6×12', r.pillColor === 'rgb(57, 255, 20)' && px(r.pillRadius) > 100 && r.pillPad === '6px 12px', `${r.pillColor} ${r.pillPad}`);
  check('degradado azul → verde en el texto de énfasis', r.grad.includes('rgb(0, 128, 255)') && r.grad.includes('rgb(57, 255, 20)') && r.grad.includes('135deg') && r.clip === 'text', r.grad.slice(0, 80));
  check('cuadrícula de fondo de 50 px en el inicio', r.grid && r.gridSize.includes('50px'), r.gridSize);
  // hover de tarjeta
  await p.hover('.cards .card');
  await p.waitForTimeout(450);
  const h = await p.evaluate(() => { const c = getComputedStyle(document.querySelector('.cards .card')); return { bc: c.borderColor, bg: c.backgroundColor, sh: c.boxShadow }; });
  check('hover de tarjeta: borde azul, fondo #141B42 al 90 % y brillo azul', h.bc === 'rgb(0, 128, 255)' && h.bg === 'rgba(20, 27, 66, 0.9)' && h.sh.includes('0, 128, 255'), `${h.bc} | ${h.bg}`);
  // Cabecera
  const hd = await p.evaluate(() => { const c = getComputedStyle(document.querySelector('header')); return { bg: c.backgroundColor, blur: c.backdropFilter, bb: c.borderBottom, h: document.querySelector('header').getBoundingClientRect().height }; });
  check('cabecera: fondo #0A0E27 al 80 %, desenfoque 12 px, borde inferior #1E2650, ≥ 65 px', hd.bg === 'rgba(10, 14, 39, 0.8)' && hd.blur.includes('blur(12px)') && hd.bb.startsWith('1px solid rgb(30, 38, 80)') && hd.h >= 65, `${hd.bg} ${hd.blur} ${hd.h}px`);
}

// 4) Alternativa sólida del vidrio y que los paneles de texto sean tarjetas
{
  const p = await b.newPage();
  await p.goto(base + '/descriptiva?datos=2.1,2.3,2.2', { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const out = { solid: false, supports: false };
    const walk = (rules, inSupports) => {
      for (const rule of rules) {
        if (rule instanceof CSSSupportsRule) walk(rule.cssRules, true);
        else if (rule instanceof CSSMediaRule) walk(rule.cssRules, inSupports);
        else if (rule.selectorText && rule.selectorText.includes('.glass-card')) {
          if (!inSupports && rule.style.background && rule.style.background.includes('glass-solid')) out.solid = true;
          if (inSupports && (rule.style.backdropFilter || rule.style.getPropertyValue('-webkit-backdrop-filter'))) out.supports = true;
        }
      }
    };
    for (const sh of document.styleSheets) { try { walk(sh.cssRules, false); } catch {} }
    return out;
  });
  check('tarjetas: fondo sólido por defecto y desenfoque solo con soporte', r.solid && r.supports);
}

// 5) Movimiento reducido
{
  const ctx = await b.newContext({ reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  const d = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.btn-primary')).transitionDuration) * 1000);
  check('transiciones reducidas con prefers-reduced-motion', d < 1, `${d} ms`);
  await ctx.close();
}

// 6) Foco verde de 2 px con separación, también sobre el botón verde
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(base + '/descriptiva', { waitUntil: 'networkidle' });
  await p.keyboard.press('Tab');
  await p.keyboard.press('Tab');
  const o = await p.evaluate(() => { const s = getComputedStyle(document.activeElement); return { w: px(s.outlineWidth), c: s.outlineColor, st: s.outlineStyle, off: px(s.outlineOffset) }; function px(v) { return parseFloat(v); } });
  check('foco: contorno verde de 2 px con separación', o.w >= 2 && o.st !== 'none' && o.c === 'rgb(57, 255, 20)' && o.off >= 2, JSON.stringify(o));
  // sobre el botón principal
  for (let i = 0; i < 40; i++) {
    await p.keyboard.press('Tab');
    if (await p.evaluate(() => document.activeElement?.classList.contains('btn-primary') && document.activeElement.closest('form.panel'))) break;
  }
  await p.waitForTimeout(400); // el botón tiene transition: all .2s
  const f = await p.evaluate(() => { const e = document.activeElement; const s = getComputedStyle(e); return { t: e.textContent.trim().slice(0, 10), cls: e.className, c: s.outlineColor, off: parseFloat(s.outlineOffset) }; });
  check('foco sobre el botón verde visible por separación', f.cls.includes('btn-primary') && f.c === 'rgb(57, 255, 20)' && f.off >= 2, JSON.stringify(f));
}

// 7) Pestañas en píldora
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(base + '/probabilidad', { waitUntil: 'networkidle' });
  const t = await p.evaluate(() => {
    const on = getComputedStyle(document.querySelector('app-tabs button.on'));
    const off = getComputedStyle(document.querySelector('app-tabs button:not(.on)'));
    return { bg: on.backgroundColor, color: on.color, radius: on.borderRadius, h: document.querySelector('app-tabs button.on').getBoundingClientRect().height, offColor: off.color };
  });
  check('pestaña activa azul #0080FF con texto azul marino, radio 8 px, ≥ 44 px', t.bg === 'rgb(0, 128, 255)' && t.color === 'rgb(10, 14, 39)' && t.radius === '8px' && t.h >= 44, JSON.stringify(t));
  check('pestaña inactiva en texto secundario', t.offColor === 'rgb(139, 146, 179)', t.offColor);
}

// 8) Cifra principal con degradado y gráficas con verde y azul
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(base + '/descriptiva?datos=2.1,2.3,2.2,2.4,2.0&unidad=A', { waitUntil: 'networkidle' });
  const k = await p.evaluate(() => { const v = document.querySelector('app-kpi .kpi.primary:not(.is-text) .value'); const c = getComputedStyle(v); return { g: c.backgroundImage, clip: c.webkitBackgroundClip, font: c.fontFamily, unit: getComputedStyle(v.querySelector('.unit')).color }; });
  check('cifra principal con degradado azul → verde en Space Grotesk', k.g.includes('rgb(0, 128, 255)') && k.g.includes('rgb(57, 255, 20)') && k.clip === 'text' && k.font.includes('Space Grotesk'), k.g.slice(0, 60));
  check('unidad en texto secundario', k.unit === 'rgb(139, 146, 179)', k.unit);
  await p.goto(base + '/regresion?x=1,2,3,4,5&y=2.1,3.9,6.2,7.8,10.1', { waitUntil: 'networkidle' });
  const g = await p.evaluate(() => {
    const fit = getComputedStyle(document.querySelector('line.fit'));
    const dot = getComputedStyle(document.querySelector('circle.dot'));
    return { dash: fit.strokeDasharray, stroke: fit.stroke, dot: dot.fill, legend: document.querySelector('.legend')?.textContent?.trim() ?? '' };
  });
  check('recta de regresión azul y discontinua', g.dash !== 'none' && g.stroke === 'rgb(0, 128, 255)', `${g.dash} ${g.stroke}`);
  check('puntos verdes distintos de la recta', g.dot === 'rgb(57, 255, 20)', g.dot);
  check('leyenda de texto de la recta', g.legend.includes('ŷ ='), g.legend);
  await p.goto(base + '/tablas-graficas?datos=' + encodeURIComponent('12,15,17,18,20,21,22,22,25,27,28,30,31,33,35'), { waitUntil: 'networkidle' });
  const bar = await p.evaluate(() => { const r = document.querySelector('rect.bar'); const c = getComputedStyle(r); return { fill: c.fill, stroke: c.stroke, stop: document.querySelector('#bar-grad stop')?.getAttribute('stop-color') }; });
  check('barras del histograma con degradado verde', bar.fill.includes('url(') && bar.stop === '#39ff14' && bar.stroke === 'rgb(57, 255, 20)', JSON.stringify(bar));
}

await b.close();
process.exit(fail ? 1 : 0);
