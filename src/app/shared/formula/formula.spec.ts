import { TestBed } from '@angular/core/testing';
import { Formula, texToSpeech } from './formula';

describe('Formula (KaTeX)', () => {
  async function render(tex: string, display = false) {
    const fixture = TestBed.createComponent(Formula);
    fixture.componentRef.setInput('tex', tex);
    fixture.componentRef.setInput('display', display);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renderiza s = √(Σ(xᵢ−x̄)²/(n−1)) con KaTeX', async () => {
    const el = await render(String.raw`s=\sqrt{\dfrac{\sum (x_i-\bar{x})^2}{n-1}}`, true);
    expect(el.querySelector('.katex')).not.toBeNull();
    expect(el.querySelector('.katex-html')?.textContent).toContain('s');
    expect(el.querySelector('math')).not.toBeNull();
    expect(el.querySelector('.f')?.getAttribute('role')).toBe('math');
  });

  it('el aria-label se deriva de la fórmula y es legible', async () => {
    const el = await render(String.raw`s=\sqrt{\dfrac{\sum (x_i-\bar{x})^2}{n-1}}`);
    const label = el.querySelector('.f')!.getAttribute('aria-label')!;
    expect(label).toContain('raíz cuadrada');
    expect(label).toContain('entre');
    expect(label).toContain('suma de');
    expect(label).not.toContain('\\');
  });

  it('acepta aria-label explícito', async () => {
    const fixture = TestBed.createComponent(Formula);
    fixture.componentRef.setInput('tex', 'x');
    fixture.componentRef.setInput('ariaLabel', 'equis');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.f').getAttribute('aria-label')).toBe('equis');
  });

  it('una fórmula inválida no rompe la pantalla', async () => {
    const el = await render(String.raw`\frac{`);
    expect(el.querySelector('.f')).not.toBeNull();
  });

  it('texToSpeech de la media', () => {
    expect(texToSpeech(String.raw`\bar{x}=\dfrac{\sum x_i}{n}`)).toBe('x barra igual a (suma de x sub i) entre (n)');
  });
});
