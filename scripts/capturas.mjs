// Genera las capturas para el informe en docs/capturas. Uso: node scripts/capturas.mjs [baseUrl]
import { chromium } from 'playwright-core';
const base = process.argv[2] ?? 'http://127.0.0.1:4300';
const out = 'docs/capturas';
const D30 = '12, 15, 17, 18, 20, 21, 22, 22, 25, 27, 28, 30, 31, 33, 35, 36, 38, 40, 41, 44, 45, 47, 48, 50, 52, 54, 55, 58, 60, 62';
const b = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
const shot = async (name, full = false) => { await p.screenshot({ path: `${out}/${name}.png`, fullPage: full }); console.log('captura', name); };
const go = (u) => p.goto(base + u, { waitUntil: 'networkidle' });

await go('/'); await shot('01-inicio');
await go('/descriptiva?datos=2.1,2.3,2.2,2.4,2.0&unidad=A'); await shot('02-descriptiva-corriente', true);
await go('/experimentales?datos=2.1,2.3,2.2,2.4,2.0&unidad=A'); await shot('03-experimentales-corriente', true);
await go('/tablas-graficas?datos=' + encodeURIComponent(D30)); await shot('04-histograma', true);
await go('/probabilidad?mu=100&sigma=15&tipoNormal=entre&a=85&b=115'); await shot('05-normal', true);
await go('/regresion?x=1,2,3,4,5&y=2.1,3.9,6.2,7.8,10.1&unidadX=A&unidadY=V'); await shot('06-regresion', true);
await go('/practicas');
await p.click('.empty-prac button');
await p.fill('#respuesta-estudiante', '9999');
await p.click('form.answer button[type=submit]');
await shot('07-practica-retroalimentacion');
await go('/descriptiva');
await p.fill('textarea', '2.1, abc, 2.3');
await p.click('form.panel button[type=submit]');
await shot('08-error-de-entrada');
await go('/pregunta?q=' + encodeURIComponent('hazme una prueba de hipótesis'));
await shot('09-pregunta-no-soportada');
await b.close();
