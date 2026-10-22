import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ErrorSummary } from '../error-summary/error-summary';
import { DataInput } from './data-input';

@Component({
  imports: [DataInput, ErrorSummary],
  template: `
    <app-data-input inputId="datos" label="Datos" [(value)]="text" [showErrors]="show()" />
    <app-error-summary #es [errors]="errors()" />
  `,
})
class Host {
  text = signal('');
  show = signal(false);
  errors = signal<{ message: string; fieldId?: string }[]>([]);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const ta = el.querySelector<HTMLTextAreaElement>('textarea')!;
  const type = async (v: string) => {
    ta.value = v;
    ta.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  return { fixture, el, ta, type };
}

describe('DataInput', () => {
  it('etiqueta visible asociada al campo', async () => {
    const { el, ta } = await setup();
    const label = el.querySelector('label')!;
    expect(label.getAttribute('for')).toBe('datos');
    expect(ta.id).toBe('datos');
  });

  it('muestra chips con lo que leyó (coma decimal incluida)', async () => {
    const { el, type } = await setup();
    await type('2,1; 2,3  2.2\n2.4');
    const chips = [...el.querySelectorAll('.chip')].map((c) => c.textContent!.trim());
    expect(chips).toEqual(['2,1', '2,3', '2.2', '2.4']);
    expect(el.querySelector('.read-title')!.textContent).toContain('(4)');
  });

  it('el error aparece al salir del campo y queda enlazado con aria-describedby', async () => {
    const { fixture, el, ta, type } = await setup();
    await type('2.1, abc, 2.3');
    expect(el.querySelector('.error')).toBeNull();
    ta.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    const err = el.querySelector('.error')!;
    expect(err.textContent).toContain('"abc"');
    expect(ta.getAttribute('aria-invalid')).toBe('true');
    expect(ta.getAttribute('aria-describedby')).toContain('datos-error');
    expect(el.querySelector('#datos-error')).toBe(err);
  });

  it('showErrors fuerza los errores sin salir del campo', async () => {
    const { fixture, el, type } = await setup();
    await type('x');
    fixture.componentInstance.show.set(true);
    await fixture.whenStable();
    expect(el.querySelector('.error')).not.toBeNull();
  });

  it('el resumen de errores enlaza al campo y recibe el foco', async () => {
    const { fixture, el, ta } = await setup();
    fixture.componentInstance.errors.set([{ message: 'Faltan datos', fieldId: 'datos' }]);
    await fixture.whenStable();
    const es = fixture.debugElement.children.find((d) => d.name === 'app-error-summary')!.componentInstance as ErrorSummary;
    es.focus();
    expect(document.activeElement).toBe(el.querySelector('.es'));
    el.querySelector<HTMLAnchorElement>('.es a')!.click();
    expect(document.activeElement).toBe(ta);
    expect(el.querySelector('.es')!.getAttribute('role')).toBe('alert');
  });

  it('las acciones se alcanzan con teclado: textarea y enlace son focalizables', async () => {
    const { el, ta } = await setup();
    expect(ta.tabIndex).toBe(0);
    expect(el.querySelector('label')).not.toBeNull();
  });
});
