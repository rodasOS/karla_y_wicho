export interface NavItem {
  path: string;
  label: string;
  icon: string;
  /** Texto corto para la barra inferior. */
  short?: string;
}

export const MODULE_NAV: NavItem[] = [
  { path: '/descriptiva', label: 'Estadística descriptiva', icon: 'sigma' },
  { path: '/experimentales', label: 'Datos experimentales', icon: 'flask' },
  { path: '/tablas-graficas', label: 'Tablas y gráficas', icon: 'chart' },
  { path: '/probabilidad', label: 'Probabilidad y normal', icon: 'dice' },
  { path: '/regresion', label: 'Correlación y regresión', icon: 'trend' },
  { path: '/interpretacion', label: 'Interpretación (σ vs s)', icon: 'book' },
];

export const MAIN_NAV: NavItem[] = [
  { path: '/', label: 'Inicio', icon: 'home' },
  { path: '/ejemplos', label: 'Ejemplos', icon: 'grid' },
  { path: '/practicas', label: 'Prácticas', icon: 'target' },
  { path: '/pregunta', label: 'Pregunta', icon: 'search' },
];
