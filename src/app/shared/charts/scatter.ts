import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatFixed } from '../../core/math/rounding';
import { linearScale, niceTicks, tickLabel } from '../../core/math/ticks';

const W = 640;
const H = 400;
const M = { l: 92, r: 24, t: 24, b: 84 };

/** Diagrama de dispersión en SVG; opcionalmente superpone la recta ŷ = a + bx. */
@Component({
  selector: 'app-scatter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scatter.html',
  styleUrl: './chart.css',
})
export class Scatter {
  readonly x = input.required<number[]>();
  readonly y = input.required<number[]>();
  readonly line = input<{ a: number; b: number } | null>(null);
  readonly xTitle = input('x');
  readonly yTitle = input('y');
  readonly decimals = input(2);

  protected readonly W = W;
  protected readonly H = H;
  protected readonly M = M;

  protected readonly summary = computed(() => {
    const x = this.x();
    const y = this.y();
    const ln = this.line();
    return `Diagrama de dispersión con ${x.length} puntos. x va de ${tickLabel(Math.min(...x))} a ${tickLabel(Math.max(...x))} y y va de ${tickLabel(Math.min(...y))} a ${tickLabel(Math.max(...y))}.${ln ? ' Se muestra la recta de regresión ajustada.' : ''}`;
  });

  protected readonly geometry = computed(() => {
    const x = this.x();
    const y = this.y();
    const xT = niceTicks(Math.min(...x), Math.max(...x), 6);
    const yT = niceTicks(Math.min(...y), Math.max(...y), 6);
    const sx = linearScale(xT, [M.l, W - M.r]);
    const sy = linearScale(yT, [H - M.b, M.t]);
    const ln = this.line();
    const fit = ln ? { x1: sx(xT.min), y1: sy(ln.a + ln.b * xT.min), x2: sx(xT.max), y2: sy(ln.a + ln.b * xT.max) } : null;
    // Recorta la recta al área de dibujo.
    return {
      points: x.map((xv, i) => ({ cx: sx(xv), cy: sy(y[i]) })),
      xTicks: xT.ticks.map((v) => ({ x: sx(v), label: tickLabel(v) })),
      yTicks: yT.ticks.map((v) => ({ y: sy(v), label: tickLabel(v) })),
      fit,
      baseline: H - M.b,
    };
  });

  protected f(v: number): string {
    return formatFixed(v, this.decimals());
  }
}
