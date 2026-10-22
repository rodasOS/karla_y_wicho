import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FrequencyTable } from '../../core/math/frequency';
import { formatFixed } from '../../core/math/rounding';
import { linearScale, niceTicks, tickLabel } from '../../core/math/ticks';

const W = 640;
const H = 380;
const M = { l: 76, r: 18, t: 34, b: 84 };

interface Bar {
  x: number;
  y: number;
  w: number;
  h: number;
  f: number;
  cx: number;
}

/** Histograma (o diagrama de barras por valor) en SVG, con tabla equivalente para lectores de pantalla. */
@Component({
  selector: 'app-histogram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './histogram.html',
  styleUrl: './chart.css',
})
export class Histogram {
  readonly table = input.required<FrequencyTable>();
  readonly xTitle = input('Valores');
  readonly yTitle = input('Frecuencia');
  readonly decimals = input(2);

  protected readonly W = W;
  protected readonly H = H;
  protected readonly M = M;

  protected readonly summary = computed(() => {
    const t = this.table();
    return `${t.kind === 'intervalos' ? 'Histograma' : 'Diagrama de barras'} de ${t.n} datos en ${t.k} ${t.k === 1 ? 'clase' : 'clases'}. La mayor frecuencia es ${Math.max(...t.classes.map((c) => c.f))}.`;
  });

  protected readonly geometry = computed(() => {
    const t = this.table();
    const maxF = Math.max(...t.classes.map((c) => c.f));
    const yT = niceTicks(0, maxF, 5);
    const ys = linearScale(yT, [H - M.b, M.t]);
    const plotW = W - M.l - M.r;
    let bars: Bar[];
    let xTicks: { x: number; label: string }[];
    if (t.kind === 'intervalos' && t.width > 0) {
      const lo = t.classes[0].lower;
      const hi = t.classes[t.classes.length - 1].upper;
      const xs = linearScale({ min: lo, max: hi }, [M.l, W - M.r]);
      bars = t.classes.map((c) => ({ x: xs(c.lower), w: xs(c.upper) - xs(c.lower), y: ys(c.f), h: ys(0) - ys(c.f), f: c.f, cx: xs(c.midpoint) }));
      const edges = [...t.classes.map((c) => c.lower), hi];
      const every = edges.length > 9 ? 2 : 1;
      xTicks = edges.map((v, i) => ({ v, i })).filter(({ i }) => i % every === 0).map(({ v }) => ({ x: xs(v), label: tickLabel(Number(v.toFixed(2))) }));
    } else {
      const slot = plotW / t.classes.length;
      const bw = Math.min(slot * 0.8, 80);
      bars = t.classes.map((c, i) => ({ x: M.l + i * slot + (slot - bw) / 2, w: bw, y: ys(c.f), h: ys(0) - ys(c.f), f: c.f, cx: M.l + i * slot + slot / 2 }));
      const every = t.classes.length > 12 ? Math.ceil(t.classes.length / 12) : 1;
      xTicks = t.classes.map((c, i) => ({ c, i })).filter(({ i }) => i % every === 0).map(({ c, i }) => ({ x: M.l + i * slot + slot / 2, label: tickLabel(c.midpoint) }));
    }
    return { bars, xTicks, yTicks: yT.ticks.map((v) => ({ y: ys(v), label: String(v) })), baseline: ys(0) };
  });

  protected range(c: { lower: number; upper: number }): string {
    const d = this.decimals();
    return this.table().kind === 'valores' ? formatFixed(c.lower, d) : `${formatFixed(c.lower, d)} – ${formatFixed(c.upper, d)}`;
  }
}
