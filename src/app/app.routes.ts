import { Routes } from '@angular/router';

const T = (t: string) => `${t} · Proteus`;

export const routes: Routes = [
  { path: '', pathMatch: 'full', title: 'Proteus · Asistente de Estadística Aplicada', loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage) },
  { path: 'descriptiva', title: T('Estadística descriptiva'), loadComponent: () => import('./features/descriptive/descriptive.page').then((m) => m.DescriptivePage) },
  { path: 'experimentales', title: T('Datos experimentales'), loadComponent: () => import('./features/experimental/experimental.page').then((m) => m.ExperimentalPage) },
  { path: 'tablas-graficas', title: T('Tablas y gráficas'), loadComponent: () => import('./features/tables-charts/tables-charts.page').then((m) => m.TablesChartsPage) },
  { path: 'probabilidad', title: T('Probabilidad y normal'), loadComponent: () => import('./features/probability/probability.page').then((m) => m.ProbabilityPage) },
  { path: 'regresion', title: T('Correlación y regresión'), loadComponent: () => import('./features/regression/regression.page').then((m) => m.RegressionPage) },
  { path: 'interpretacion', title: T('Interpretación σ vs s'), loadComponent: () => import('./features/interpretation/interpretation.page').then((m) => m.InterpretationPage) },
  { path: 'ejemplos', title: T('Ejemplos'), loadComponent: () => import('./features/examples/examples.page').then((m) => m.ExamplesPage) },
  { path: 'practicas', title: T('Prácticas'), loadComponent: () => import('./features/practice/practice.page').then((m) => m.PracticePage) },
  { path: 'pregunta', title: T('Pregunta'), loadComponent: () => import('./features/ask/ask.page').then((m) => m.AskPage) },
  { path: '**', title: T('Página no encontrada'), loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage) },
];
