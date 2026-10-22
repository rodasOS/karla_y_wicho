import { ErrorHandler, Injectable, signal } from '@angular/core';

/** Estado de error global: la pantalla muestra un aviso en español en vez de quedarse en blanco. */
@Injectable({ providedIn: 'root' })
export class FatalErrorState {
  readonly failed = signal(false);

  report(): void {
    this.failed.set(true);
  }

  clear(): void {
    this.failed.set(false);
  }
}

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  constructor(private readonly state: FatalErrorState) {}

  handleError(error: unknown): void {
    console.error('[Sigma Lab]', error);
    this.state.report();
  }
}
