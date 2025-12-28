// lib/types/caso-clinico.ts
// Tipos completos para la estructura de casos clínicos

export type AreaPrincipal =
  | "Embarazo y control prenatal"
  | "Parto y atención intraparto"
  | "Puerperio y lactancia"
  | "Urgencias obstétricas"
  | "Ginecología"
  | "ITS"
  | "Salud sexual y anticoncepción"
  | "Neonatología"
  | "APS"
  | "Ética/Legal";

export type Dificultad = "Baja" | "Media" | "Alta";

export type NivelCognitivo = "recall" | "aplicacion" | "razonamiento" | "manejo";

export type LeadInTipo =
  | "diagnostico"
  | "siguiente_paso"
  | "farmacologia"
  | "interpretacion_examenes"
  | "consejeria";

export type NivelAtencion = "APS" | "urgencia" | "hospitalizacion";

export interface Blueprint {
  nivelCognitivo: NivelCognitivo;
  leadInTipos: LeadInTipo[];
  competencias: string[];
  nivelAtencion: NivelAtencion[];
}

export interface DatosEtapa {
  edad?: number;
  semanasGestacion?: number;
  signosVitales?: {
    ta?: string;
    fc?: number;
    fr?: number;
    temp?: number;
    spo2?: number;
  };
  [key: string]: any; // Permite datos adicionales estructurados
}

export interface Etapa {
  id: string;
  titulo: string;
  texto: string;
  datos?: DatosEtapa;
}

export interface Escenario {
  contexto: string;
  etapas: Etapa[];
}

export interface OpcionMCQ {
  id: string; // "a", "b", "c", "d"
  texto: string;
  esCorrecta?: boolean;
  explicacion: string;
}

export interface ControlCalidad {
  checklist: {
    opcionesHomogeneas: boolean;
    sinNegacionesConfusas: boolean;
    sinPistasTecnicas: boolean;
  };
  autor?: string;
  revisor?: string;
  fechaRevision?: string;
}

export interface PreguntaMCQ {
  id: string;
  tipo: "mcq";
  etapaId: string;
  leadInTipo: LeadInTipo;
  enunciado: string;
  puntosMaximos: number;
  opciones: OpcionMCQ[];
  controlCalidad?: ControlCalidad;
  feedbackDocente: string;
}

export interface CriterioRubrica {
  id: string;
  nombre: string;
  puntos: number;
  evidencias: string[];
  descripcion?: string;
}

export interface Rubrica {
  criterios: CriterioRubrica[];
  respuestaModelo: string;
}

export interface EvaluacionAutomatica {
  modo: "human_only" | "keyword_basic" | "ai_rubric";
  umbrales: {
    full: number; // 0-1
    partial: number; // 0-1
  };
}

export interface PreguntaSHORT {
  id: string;
  tipo: "short";
  etapaId: string;
  enunciado: string;
  puntosMaximos: number;
  rubrica: Rubrica;
  guia?: string;
  feedbackDocente: string;
  evaluacionAutomatica?: EvaluacionAutomatica;
}

export type Pregunta = PreguntaMCQ | PreguntaSHORT;

export interface FeedbackDinamico {
  bajo: string;
  medio: string;
  alto: string;
}

export interface TarjetaSRS {
  pregunta: string;
  respuesta: string;
  tags: string[];
}

export interface ErrorFrecuente {
  patron: string;
  microfeedback: string;
  recomendarCasoId?: string;
}

export interface Aprendizaje {
  activarSpacedRepetition: boolean;
  tarjetas?: TarjetaSRS[];
  erroresFrecuentes?: ErrorFrecuente[];
}

export type UsoIA =
  | "tutor_socratico"
  | "feedback_por_rubrica"
  | "detectar_conceptos_faltantes";

export interface ConfigIA {
  habilitado: boolean;
  usosPermitidos: UsoIA[];
  reglas: {
    noDarRespuestaDirectaAntesDeIntento: boolean;
    basarseEnRubricaYRespuestaModelo: boolean;
  };
}

/**
 * Estructura completa de un caso clínico
 */
export interface CasoClinico {
  // Metadatos
  id: string;
  version: number;
  areaPrincipal: AreaPrincipal;
  modulo: string;
  dificultad: Dificultad;
  titulo: string;

  // Académicos
  objetivosAprendizaje: string[];
  blueprint: Blueprint;

  // Caso clínico por etapas
  escenario: Escenario;

  // Evaluación
  pasos: Pregunta[];

  // Feedback
  feedbackDinamico: FeedbackDinamico;

  // Referencias
  referencias: string[];

  // Aprendizaje
  aprendizaje?: Aprendizaje;

  // IA
  ai?: ConfigIA;
}

/**
 * Validación de estructura completa
 */
export function validarEstructuraCasoCompleto(
  caso: Partial<CasoClinico>
): { valido: boolean; errores: string[] } {
  const errores: string[] = [];

  // Validar campos requeridos
  if (!caso.id) errores.push("id es requerido");
  if (!caso.titulo) errores.push("titulo es requerido");
  if (!caso.areaPrincipal) errores.push("areaPrincipal es requerido");
  if (!caso.dificultad) errores.push("dificultad es requerido");

  // Validar estructura de preguntas según dificultad
  if (caso.pasos && caso.dificultad) {
    const mcqCount = caso.pasos.filter((p) => p.tipo === "mcq").length;
    const shortCount = caso.pasos.filter((p) => p.tipo === "short").length;

    const reglas: Record<Dificultad, { mcq: number; short: number }> = {
      Baja: { mcq: 6, short: 0 },
      Media: { mcq: 6, short: 1 },
      Alta: { mcq: 7, short: 1 },
    };

    const regla = reglas[caso.dificultad];
    if (mcqCount !== regla.mcq) {
      errores.push(
        `Dificultad ${caso.dificultad} requiere ${regla.mcq} preguntas MCQ, encontradas ${mcqCount}`
      );
    }
    if (shortCount !== regla.short) {
      errores.push(
        `Dificultad ${caso.dificultad} requiere ${regla.short} preguntas SHORT, encontradas ${shortCount}`
      );
    }

    // Validar que cada MCQ tenga 4 opciones
    caso.pasos.forEach((paso) => {
      if (paso.tipo === "mcq") {
        if (paso.opciones.length !== 4) {
          errores.push(
            `Pregunta ${paso.id}: MCQ debe tener 4 opciones (A-D), encontradas ${paso.opciones.length}`
          );
        }
        // Validar que haya exactamente 1 opción correcta
        const correctas = paso.opciones.filter((o) => o.esCorrecta).length;
        if (correctas !== 1) {
          errores.push(
            `Pregunta ${paso.id}: debe tener exactamente 1 opción correcta, encontradas ${correctas}`
          );
        }
      }
    });
  }

  // Validar escenario
  if (!caso.escenario || !caso.escenario.etapas || caso.escenario.etapas.length === 0) {
    errores.push("escenario debe tener al menos 1 etapa");
  }

  // Validar blueprint
  if (!caso.blueprint) {
    errores.push("blueprint es requerido");
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}
