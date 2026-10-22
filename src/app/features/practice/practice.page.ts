import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CheckResult, checkAnswer } from '../../core/practice/check';
import { Exercise, Level, PRACTICE_MODULES, PracticeModule, generateExercise } from '../../core/practice/exercises';
import { newSeed } from '../../core/practice/rng';
import { formatFixed } from '../../core/math/rounding';
import { AlertBanner } from '../../shared/alert-banner/alert-banner';
import { Icon } from '../../shared/icon/icon';
import { SessionStore } from '../../shared/session.store';
import { SolutionView } from '../../shared/solution-view/solution-view';

@Component({
  selector: 'app-practice-page',
  imports: [AlertBanner, Icon, SolutionView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './practice.page.html',
})
export class PracticePage {
  protected readonly session = inject(SessionStore);
  protected readonly modules = PRACTICE_MODULES;

  protected readonly module = signal<PracticeModule>('descriptive');
  protected readonly level = signal<Level>('basico');
  protected readonly exercise = signal<Exercise | null>(null);
  protected readonly answerText = signal('');
  protected readonly result = signal<CheckResult | null>(null);
  protected readonly revealed = signal(false);

  protected readonly solved = computed(() => this.result()?.status === 'correct');
  protected readonly expectedText = computed(() => {
    const e = this.exercise();
    return e ? `${formatFixed(e.expected, e.decimals)}${e.unit ? ' ' + e.unit : ''}` : '';
  });

  protected generate(): void {
    this.exercise.set(generateExercise(this.module(), this.level(), newSeed()));
    this.answerText.set('');
    this.result.set(null);
    this.revealed.set(false);
  }

  protected check(ev: Event): void {
    ev.preventDefault();
    const ex = this.exercise();
    if (!ex || this.solved()) return;
    const r = checkAnswer(ex, this.answerText());
    this.result.set(r);
    if (r.counts) this.session.record(r.status === 'correct');
  }

  protected reveal(): void {
    this.revealed.set(true);
  }
}
