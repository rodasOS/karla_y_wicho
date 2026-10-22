// Genera comparaciones lado a lado (demo | app) en docs/comparacion. Requiere red para abrir el demo.
// Uso: node scripts/comparar-demo.mjs [baseUrl]
import { readFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const base = process.argv[2] ?? 'http://127.0.0.1:4300';
const out = 'docs/comparacion';
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true });
const demo = await b.newPage({ viewport: { width: 1440, height: 900 } });
await demo.goto('https://uupm.cc/demo/fintech-crypto', { waitUntil: 'networkidle', timeout: 60000 });
const app = await b.newPage({ viewport: { width: 1440, height: 900 } });

const leaf = (page, text, tag = '*') => page.evaluateHandle(([t, g]) => { const c = [...document.querySelectorAll(g)].filter((e) => e.textContent.trim() === t); return c[c.length - 1]; }, [text, tag]);
const shot = async (page, handle, file) => {
  const el = handle.asElement();
  if (!el) throw new Error('No se encontró el elemento para ' + file);
  await el.screenshot({ path: file });
};
const pairs = [];
const add = async (name, demoEl, appEl) => {
  await shot(demo, demoEl, `${out}/_d-${name}.png`);
  await shot(app, appEl, `${out}/_a-${name}.png`);
  pairs.push(name);
};

// Inicio / botones / píldora / tarjeta
await app.goto(base + '/', { waitUntil: 'networkidle' });
await add('botones', await demo.evaluateHandle(() => document.querySelector('.btn-primary.text-base').parentElement), await app.evaluateHandle(() => document.querySelector('.cta')));
await add('pildora', await leaf(demo, 'Live Trading Available'), await app.evaluateHandle(() => document.querySelector('.eyebrow')));
await add('tarjeta', await demo.evaluateHandle(() => [...document.querySelectorAll('div')].find((d) => d.textContent.startsWith('Instant TradesExecute') && getComputedStyle(d).backdropFilter !== 'none')), await app.evaluateHandle(() => document.querySelector('.cards .card')));
await add('cabecera', await demo.evaluateHandle(() => document.querySelector('nav, header')), await app.evaluateHandle(() => document.querySelector('header')));
await add('titulo', await demo.evaluateHandle(() => document.querySelector('h1')), await app.evaluateHandle(() => document.querySelector('h1')));
// Cifra con degradado
await demo.evaluate(() => window.scrollTo(0, 1500));
await app.goto(base + '/descriptiva?datos=2.1,2.3,2.2,2.4,2.0&unidad=A', { waitUntil: 'networkidle' });
await add('cifra', await demo.evaluateHandle(() => [...document.querySelectorAll('div')].find((d) => d.textContent.startsWith('$12B+Trading Volume24h') && d.children.length <= 3)), await app.evaluateHandle(() => document.querySelector('.final app-kpi')));
// Pestañas
await app.goto(base + '/probabilidad', { waitUntil: 'networkidle' });
await add('pestanas', await demo.evaluateHandle(() => document.querySelector('button.rounded-lg').parentElement), await app.evaluateHandle(() => document.querySelector('app-tabs')));

// Composición lado a lado
const page = await b.newPage({ viewport: { width: 1500, height: 400 } });
for (const n of pairs) {
  const d = readFileSync(`${out}/_d-${n}.png`).toString('base64');
  const a = readFileSync(`${out}/_a-${n}.png`).toString('base64');
  await page.setContent(`<body style="margin:0;background:#050818;color:#8b92b3;font:14px sans-serif;display:flex;gap:32px;padding:24px;align-items:flex-start">
    <figure style="margin:0"><figcaption style="margin-bottom:8px">Demo (uupm.cc/demo/fintech-crypto)</figcaption><img src="data:image/png;base64,${d}"></figure>
    <figure style="margin:0"><figcaption style="margin-bottom:8px">Sigma Lab</figcaption><img src="data:image/png;base64,${a}"></figure></body>`);
  await page.screenshot({ path: `${out}/${n}.png`, fullPage: true });
  console.log('comparación', n);
}
await b.close();
