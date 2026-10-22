import { TestBed } from '@angular/core/testing';
import { parseData } from '../../core/parsing/data-parser';
import { solveDescriptive } from '../../core/steps/descriptive';
import { ResultCard } from '../result-card/result-card';
import { Kpi } from './kpi';

describe('Kpi y tarjetas de respuesta', () => {
  it('muestra etiqueta, cifra y unidad por separado', async () => {
    const f = TestBed.createComponent(Kpi);
    f.componentRef.setInput('label', 'Media');
    f.componentRef.setInput('value', '2.2000');
    f.componentRef.setInput('unit', 'A');
    f.componentRef.setInput('primary', true);
    await f.whenStable();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.label')!.textContent).toContain('Media');
    expect(el.querySelector('.value')!.firstChild!.textContent).toBe('2.2000');
    expect(el.querySelector('.unit')!.textContent!.trim()).toBe('A');
    expect(el.querySelector('.kpi')!.classList).toContain('primary');
    expect(el.querySelector('.value')!.classList).toContain('num');
  });

  it('ejemplo de corriente: media 2.2 A y s = 0.1581 A en tarjetas, las principales a todo el ancho', async () => {
    const p = parseData('2.1, 2.3, 2.2, 2.4, 2.0');
    const sol = solveDescriptive({ values: p.values, labels: p.labels, unit: 'A' });
    const f = TestBed.createComponent(ResultCard);
    f.componentRef.setInput('items', sol.answer);
    f.componentRef.setInput('decimals', 4);
    await f.whenStable();
    const el = f.nativeElement as HTMLElement;
    const cards = [...el.querySelectorAll('app-kpi')];
    expect(cards.length).toBe(sol.answer.length);
    const by = (label: string) => cards.find((c) => c.querySelector('.label')!.textContent!.startsWith(label))!;
    expect(by('Media').querySelector('.value')!.textContent!.replace(/\s+/g, ' ').trim()).toBe('2.2000 A');
    expect(by('Desviación estándar muestral').querySelector('.value')!.textContent!.replace(/\s+/g, ' ').trim()).toBe('0.1581 A');
    expect(by('Media').classList).toContain('wide');
    expect(by('Mediana').classList).not.toContain('wide');
  });

  it('un texto (p. ej. "No hay moda") se muestra como texto sin unidad', async () => {
    const p = parseData('1, 2, 3, 4');
    const sol = solveDescriptive({ values: p.values, labels: p.labels, unit: 'A' });
    const f = TestBed.createComponent(ResultCard);
    f.componentRef.setInput('items', sol.answer);
    await f.whenStable();
    const moda = [...(f.nativeElement as HTMLElement).querySelectorAll('app-kpi')].find((c) => c.querySelector('.label')!.textContent!.startsWith('Moda'))!;
    expect(moda.querySelector('.value')!.textContent).toContain('No hay moda');
    expect(moda.querySelector('.unit')).toBeNull();
    expect(moda.querySelector('.kpi')!.classList).toContain('is-text');
  });
});
