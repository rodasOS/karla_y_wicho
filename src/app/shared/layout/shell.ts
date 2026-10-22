import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { APP_NAME, APP_SUBTITLE, AUTHORS, COURSE, FACULTY, SECTION, UNIVERSITY } from '../../data/authors';
import { FatalErrorState } from '../error-handler';
import { Icon } from '../icon/icon';
import { SessionStore } from '../session.store';
import { MAIN_NAV, MODULE_NAV } from './nav-items';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  private readonly router = inject(Router);
  protected readonly fatal = inject(FatalErrorState);
  private readonly session = inject(SessionStore);

  protected readonly appName = APP_NAME;
  protected readonly subtitle = APP_SUBTITLE;
  protected readonly authors = AUTHORS;
  protected readonly course = COURSE;
  protected readonly section = SECTION;
  protected readonly university = UNIVERSITY;
  protected readonly faculty = FACULTY;
  protected readonly mainNav = MAIN_NAV;
  protected readonly moduleNav = MODULE_NAV;

  protected readonly modulesOpen = signal(false);
  protected readonly question = signal('');

  protected toggleModules(): void {
    this.modulesOpen.update((v) => !v);
  }

  protected closeModules(): void {
    this.modulesOpen.set(false);
  }

  protected onQuestion(ev: Event): void {
    ev.preventDefault();
    const q = this.question().trim();
    this.router.navigate(['/pregunta'], { queryParams: q ? { q } : {} });
  }

  protected onQuestionInput(ev: Event): void {
    this.question.set((ev.target as HTMLInputElement).value);
  }

  protected restart(): void {
    this.fatal.clear();
    this.session.reset();
    this.router.navigateByUrl('/');
  }

  protected focusMain(main: HTMLElement): void {
    main.focus();
  }
}
