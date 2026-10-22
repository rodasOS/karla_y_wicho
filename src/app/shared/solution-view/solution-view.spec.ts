import { TestBed } from '@angular/core/testing';
import { parseData } from '../../core/parsing/data-parser';
import { solveDescriptive } from '../../core/steps/descriptive';
import { Solution } from '../../core/steps/solution';
import { SolutionView } from './solution-view';

function build(text = '2.1, 2.3, 2.2, 2.4, 2.0', unit = 'A'): Solution {
  const p = parseData(text);
  return solveDescriptive({ values: p.values, labels: p.labels, unit });
}

async function render(solution: Solution, decimals = 4) {
  const fixture = TestBed.createComponent(SolutionView);
  fixture.componentRef.setInput('solution', solution);
  fixture.componentRef.setInput('decimals', decimals);
  await fixture.whenStable();
  return fixture;
}

describe('SolutionView', () => {
  it('cada paso muestra fórmula → sustitución → procedimiento → resultado, en ese orden', async () => {
    const el = (await render(build())).nativeElement as HTMLElement;
    const first = el.querySelector('.steps li')!;
    const titles = [...first.querySelectorAll('.body h3')].map((h) => h.textContent!.trim());
    expect(titles).toEqual(['1 · Fórmula', '2 · Sustitución de valores', '3 · Procedimiento', '4 · Resultado']);
  });

  it('la respuesta final e interpretación van después de todos los pasos', async () => {
    const el = (await render(build())).nativeElement as HTMLElement;
    const steps = el.querySelector('.steps')!;
    const final = el.querySelector('#respuesta')!;
    expect(steps.compareDocumentPosition(final) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(final.textContent).toContain('Interpretación');
    expect(final.textContent).toContain('2.2000 A');
  });

  it('muestra la media del ejemplo de corriente con unidad y decimales elegidos', async () => {
    const el = (await render(build(), 2)).nativeElement as HTMLElement;
    expect(el.querySelector('.summary')!.textContent).toContain('2.20 A');
    expect(el.querySelector('.steps li summary')!.textContent).toContain('Media');
  });

  it('muestra las advertencias con icono y texto', async () => {
    const el = (await render(build('5'))).nativeElement as HTMLElement;
    const alert = el.querySelector('app-alert-banner .banner')!;
    expect(alert.textContent).toContain('Advertencia');
    expect(alert.querySelector('svg')).not.toBeNull();
  });

  it('"Expandir todo" abre todos los pasos', async () => {
    const fixture = await render(build());
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('details[open]').length).toBe(1);
    el.querySelector<HTMLButtonElement>('button.link')!.click();
    await fixture.whenStable();
    expect(el.querySelectorAll('details[open]').length).toBe(el.querySelectorAll('details').length);
  });

  it('región con aria-live para anunciar resultados', async () => {
    const el = (await render(build())).nativeElement as HTMLElement;
    expect(el.querySelector('section.sv')!.getAttribute('aria-live')).toBe('polite');
  });
});
