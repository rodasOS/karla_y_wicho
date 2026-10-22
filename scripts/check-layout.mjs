// Verifica que no haya scroll horizontal en varios anchos y rutas, y que el pie sea visible.
// Uso: node scripts/check-layout.mjs [baseUrl]   (requiere la app sirviéndose y Chrome instalado)
import { chromium } from 'playwright-core';

const base = process.argv[2] ?? 'http://127.0.0.1:4300';
const D30 = encodeURIComponent('12, 15, 17, 18, 20, 21, 22, 22, 25, 27, 28, 30, 31, 33, 35, 36, 38, 40, 41, 44, 45, 47, 48, 50, 52, 54, 55, 58, 60, 62');
const rutas = [
  '/', '/descriptiva', '/experimentales', '/tablas-graficas', '/probabilidad', '/regresion', '/interpretacion', '/ejemplos', '/practicas', '/pregunta',
  // Con resultados en pantalla (tarjetas KPI, fórmulas largas, gráficas)
  '/descriptiva?datos=2.1,2.3,2.2,2.4,2.0&unidad=A',
  '/descriptiva?datos=123456.789,98765.4321,111111.1111,222222.2222&unidad=kg',
  '/experimentales?datos=2.1,2.3,2.2,2.4,2.0&unidad=A',
  '/tablas-graficas?datos=' + D30,
  '/tablas-graficas?pestana=dispersion&x=1,2,3,4,5&y=2.1,3.9,6.2,7.8,10.1',
  '/probabilidad?mu=100&sigma=15&tipoNormal=entre&a=85&b=115',
  '/regresion?x=1,2,3,4,5&y=2.1,3.9,6.2,7.8,10.1&unidadX=A&unidadY=V',
  '/interpretacion?datos=2.1,2.3,2.2,2.4,2.0&unidad=A',
];
const anchos = [375, 768, 1024, 1440];

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: true });
let fallos = 0;
for (const w of anchos) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } });
  for (const ruta of rutas) {
    await page.goto(base + ruta, { waitUntil: 'networkidle' });
    const r = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      footer: document.querySelector('footer')?.textContent ?? '',
      h1: document.querySelector('h1')?.textContent ?? '',
    }));
    const ok = r.sw <= r.cw && r.footer.includes('2990-25-21483') && r.footer.includes('2990-25-16308') && r.footer.includes('Sección Única');
    if (!ok) fallos++;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${String(w).padStart(4)}px ${ruta.padEnd(18)} scroll ${r.sw}/${r.cw}  h1="${r.h1}"`);
  }
  await page.close();
}
await browser.close();
process.exit(fallos ? 1 : 0);
