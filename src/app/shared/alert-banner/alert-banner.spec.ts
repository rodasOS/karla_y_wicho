import { TestBed } from '@angular/core/testing';
import { WarningLevel } from '../../core/steps/solution';
import { AlertBanner } from './alert-banner';

describe('AlertBanner: el estado no depende solo del color', () => {
  it.each([
    ['info', 'Nota', 'status'],
    ['warning', 'Advertencia', 'status'],
    ['error', 'Error', 'alert'],
  ] as [WarningLevel, string, string][])('%s lleva icono, título de texto y rol %s', async (level, title, role) => {
    const f = TestBed.createComponent(AlertBanner);
    f.componentRef.setInput('level', level);
    f.componentRef.setInput('message', 'Mensaje de prueba');
    await f.whenStable();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('svg')).not.toBeNull();
    expect(el.querySelector('strong')!.textContent).toContain(title);
    expect(el.querySelector('.banner')!.getAttribute('role')).toBe(role);
    expect(el.textContent).toContain('Mensaje de prueba');
  });
});
