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
  puntosMaximos?: number; // Por defecto 2 puntos
  criteriosEvaluacion?: string[]; // Lista simple de criterios esperados
  guia?: string;
  feedbackDocente?: string;
};

// Union type: un Paso puede ser MCQ o Short
export type Paso = McqPaso | ShortPaso;

// --- Feedback Adaptativo (Nueva estructura) ---

export type FeedbackDinamico = {
  bajo?: string;    // 0-30% correctas
  medio?: string;   // 31-60% correctas
  alto?: string;    // 61-100% correctas
};

// --- Definición del Caso Completo (Cliente) ---

export type CasoClient = {
  id: string;
  titulo: string;
  modulo?: string;           // Nuevo: Anticoncepción, ITS, Consejería, Climaterio
  area?: string;             // Legacy, mantener compatibilidad
  dificultad: string | number; // Nuevo: "Baja"/"Media"/"Alta" o número legacy
  vigneta?: string | null;
  pasos: Paso[];
  referencias?: string[];
  debrief?: string;
  feedback_dinamico?: FeedbackDinamico; // Nuevo: feedback por porcentaje
};

// --- Definición de las Respuestas del Usuario ---

export type Respuesta = {
  pasoId: string;
  opcionId?: string;       // Usado si es MCQ
  respuestaTexto?: string; // Usado si es Short (desarrollo)
  esCorrecta?: boolean;
  puntos?: number;         // Puntos autoevaluados (0, 1 o 2 para Short)
  revelado?: boolean;
};

// --- Type Guards (Esenciales para que TypeScript no se queje) ---

// Comprueba si un paso es MCQ
export const isMcq = (p: Paso): p is McqPaso => p.tipo === 'mcq';

// Comprueba si un paso es Short (Desarrollo)
export const isShort = (p: Paso): p is ShortPaso => p.tipo === 'short';

// --- Sistema de Feedback Integrado ---
export type FeedbackNivel = {
  rangoMin: number; // Porcentaje mínimo (ej: 0, 50, 70, 90)
  rangoMax: number; // Porcentaje máximo (ej: 49, 69, 89, 100)
  titulo: string;   // Ej: "Necesitas Revisar", "Bien", "Muy Bien", "Excelente"
  mensaje: string;  // Feedback específico del caso
  emoji?: string;   // Ej: "📝", "✓", "⭐", "🏆"
};
