/** Traduce el resultado de `parseQuestion` a una ruta y parámetros de URL que precargan el módulo. */
import { MODULE_ROUTES, QuestionResult } from './question-parser';

export interface Navigation {
  route: string;
  queryParams: Record<string, string>;
}

const list = (xs?: string[]) => (xs && xs.length ? xs.join(', ') : undefined);

export function toNavigation(r: QuestionResult): Navigation | null {
  if (!r.module || (r.status !== 'ok' && r.status !== 'no-data')) return null;
  const p = r.params;
  const q: Record<string, string | undefined> = { desde: 'pregunta' };
  switch (r.module) {
    case 'descriptive':
    case 'experimental':
      q['datos'] = list(p.data);
      q['unidad'] = p.unit;
      q['tipo'] = p.kind;
      break;
    case 'interpretation':
      q['datos'] = list(p.data);
      break;
    case 'tables-charts':
      q['pestana'] = p.chart === 'dispersion' ? 'dispersion' : 'datos';
      q['datos'] = list(p.data);
      q['x'] = list(p.x);
      q['y'] = list(p.y);
      break;
    case 'regression':
      q['x'] = list(p.x);
      q['y'] = list(p.y);
      break;
    case 'probability':
      q['pestana'] = p.tab;
      q['mu'] = p.mu?.toString();
      q['sigma'] = p.sigma?.toString();
      if (p.normal) {
        q['tipoNormal'] = p.normal.type;
        q['a'] = p.normal.a.toString();
        q['b'] = p.normal.b?.toString();
      }
      q['percentil'] = p.percentile?.toString();
      if (p.combinatorics) {
        q['clasica'] = p.combinatorics;
        q['n'] = p.n?.toString();
        q['k'] = p.k?.toString();
      }
      break;
  }
  if (r.status === 'ok') q['entendido'] = r.message;
  else q['aviso'] = r.message;
  if (p.pairsAssumed) q['aviso'] = 'Interpreté la primera mitad de los números como x y la segunda mitad como y. Revísalo.';
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(q)) if (v !== undefined && v !== '') clean[k] = v;
  return { route: MODULE_ROUTES[r.module], queryParams: clean };
}
