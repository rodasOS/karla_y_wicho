/** Identidad del proyecto (requisito 7: integrantes, asignatura y sección visibles). */
export interface Author {
  name: string;
  carnet: string;
}

export const APP_NAME = 'Proteus';
export const APP_SUBTITLE = 'Asistente Virtual de Estadística Aplicada';
export const COURSE = 'Estadística Aplicada';
export const SECTION = 'Sección Única';
export const UNIVERSITY = 'Universidad Mariano Gálvez de Guatemala';
export const FACULTY = 'Facultad de Ingeniería';

export const AUTHORS: readonly Author[] = [
  { name: 'Luis Fernando Samayoa Santos', carnet: '2990-25-21483' },
  { name: 'Karla Estefani Gonzáles Tista', carnet: '2990-25-16308' },
];
