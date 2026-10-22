import { Injectable, computed, signal } from '@angular/core';

/** Marcador de prácticas de la sesión: se reinicia al cerrar la pestaña, sin cuentas ni almacenamiento. */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  readonly attempts = signal(0);
  readonly correct = signal(0);
  readonly label = computed(() => `${this.correct()} / ${this.attempts()}`);

  record(wasCorrect: boolean): void {
    this.attempts.update((n) => n + 1);
    if (wasCorrect) this.correct.update((n) => n + 1);
  }

  reset(): void {
    this.attempts.set(0);
    this.correct.set(0);
  }
}
