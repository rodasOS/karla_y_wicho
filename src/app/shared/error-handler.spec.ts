import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { App } from '../app';
import { routes } from '../app.routes';
import { AppErrorHandler, FatalErrorState } from './error-handler';
import { SessionStore } from './session.store';

describe('error global', () => {
  it('un error inesperado muestra un aviso en español y la app sigue visible; Reiniciar lo limpia', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({ providers: [provideRouter(routes), { provide: ErrorHandler, useClass: AppErrorHandler }] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.fatal')).toBeNull();

    TestBed.inject(SessionStore).record(true);
    TestBed.inject(ErrorHandler).handleError(new Error('boom'));
    await fixture.whenStable();
    expect(TestBed.inject(FatalErrorState).failed()).toBe(true);
    expect(el.querySelector('.fatal')!.textContent).toContain('Algo salió mal');
    expect(el.querySelector('footer')).not.toBeNull();
    expect(el.querySelector('router-outlet')).not.toBeNull();

    el.querySelector<HTMLButtonElement>('.fatal button')!.click();
    await fixture.whenStable();
    expect(el.querySelector('.fatal')).toBeNull();
    expect(TestBed.inject(SessionStore).label()).toBe('0 / 0');
  });
});
