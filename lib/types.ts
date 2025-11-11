// lib/types.ts

// --- Definiciones de Opciones y Pasos ---

export type McqOpcion = {
  id: string;
  texto: string;
  explicacion?: string;
  esCorrecta?: boolean;
};

export type McqPaso = {
  id: string;
  tipo: 'mcq';
  enunciado: string;
  opciones: McqOpcion[];
  feedbackDocente?: string;
};

export type ShortPaso = {
  id: string;
  tipo: 'short';
  enunciado: string;
  guia?: string;
  feedbackDocente?: string;
};

// Union type: un Paso puede ser MCQ o Short
export type Paso = McqPaso | ShortPaso;

// --- Definición del Caso Completo (Cliente) ---

export type CasoClient = {
  id: string;
  titulo: string;
  area: string;
  dificultad: number;
  vigneta?: string | null;
  pasos: Paso[];
  referencias?: string[];
  debrief?: string;
};

// --- Definición de las Respuestas del Usuario ---

export type Respuesta = {
  pasoId: string;
  opcionId?: string;       // Usado si es MCQ
  respuestaTexto?: string; // Usado si es Short (desarrollo)
  esCorrecta?: boolean;
  revelado?: boolean;
};

// --- Type Guards (Esenciales para que TypeScript no se queje) ---

// Comprueba si un paso es MCQ
export const isMcq = (p: Paso): p is McqPaso => p.tipo === 'mcq';

// Comprueba si un paso es Short (Desarrollo)
export const isShort = (p: Paso): p is ShortPaso => p.tipo === 'short';
