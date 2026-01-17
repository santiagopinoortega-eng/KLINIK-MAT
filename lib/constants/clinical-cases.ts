/**
 * 🏥 KLINIK-MAT - Constantes de Casos Clínicos
 * 
 * Sistema de 1200 casos distribuidos en 6 TEMAs y 24 subáreas
 * Optimizado para aprendizaje progresivo y pensamiento clínico
 * 
 * @version 3.0
 * @date Enero 2026
 */

// ============================================================================
// 📊 CONFIGURACIÓN GENERAL
// ============================================================================

export const CLINICAL_CASES_CONFIG = {
  TOTAL_CASES: 1200,
  TOTAL_TEMAS: 6,
  SUBAREAS_PER_TEMA: 4,
  CASES_PER_TEMA: 200,
  CASES_PER_SUBAREA: 50,
} as const;

// ============================================================================
// 🎯 NIVELES DE DIFICULTAD
// ============================================================================

export enum Difficulty {
  BAJA = 1,
  MEDIA = 2,
  ALTA = 3,
}

export const DIFFICULTY_CONFIG = {
  [Difficulty.BAJA]: {
    label: 'Baja',
    mcqQuestions: 6,
    shortQuestions: 0,
    description: 'Conocimiento básico, identificación de signos/síntomas clave',
    objective: 'Reconocer patrones clínicos fundamentales',
    color: 'green',
  },
  [Difficulty.MEDIA]: {
    label: 'Media',
    mcqQuestions: 6,
    shortQuestions: 1,
    description: 'Aplicación de conocimiento, interpretación de datos clínicos',
    objective: 'Toma de decisiones basadas en evidencia, criterios diagnósticos clave',
    color: 'yellow',
  },
  [Difficulty.ALTA]: {
    label: 'Alta',
    mcqQuestions: 7,
    shortQuestions: 1,
    description: 'Integración de materias, manejo de casos complejos',
    objective: 'Pensamiento clínico avanzado, manejo de complicaciones',
    color: 'red',
  },
} as const;

// Distribución de casos por dificultad en cada subárea (50 casos)
export const DIFFICULTY_DISTRIBUTION = {
  [Difficulty.BAJA]: {
    count: 17,
    percentage: 34,
  },
  [Difficulty.MEDIA]: {
    count: 20,
    percentage: 40,
  },
  [Difficulty.ALTA]: {
    count: 13,
    percentage: 26,
  },
} as const;

// ============================================================================
// 🗂️ TEMAS Y SUBÁREAS
// ============================================================================

export const CLINICAL_TEMAS = {
  TEMA1: {
    id: 'tema1',
    name: 'TEMA 1: Embarazo y Control Prenatal',
    folder: 'TEMA1-EMBARAZO-PRENATAL',
    totalCases: 200,
    subareas: {
      CONTROL_NORMAL: {
        id: '01-control-normal',
        name: 'Control Prenatal Normal',
        cases: 50,
        keywords: ['EG', 'PA', 'peso', 'exámenes', 'calendario', 'primera consulta'],
      },
      PATOLOGIA_EMBARAZO: {
        id: '02-patologia-embarazo',
        name: 'Patología del Embarazo',
        cases: 50,
        keywords: ['preeclampsia', 'diabetes gestacional', 'infecciones', 'anemia'],
      },
      DIAGNOSTICO_PRENATAL: {
        id: '03-diagnostico-prenatal',
        name: 'Diagnóstico Prenatal',
        cases: 50,
        keywords: ['ecografía', 'screening', 'anomalías', 'medidas fetales'],
      },
      COMPLICACIONES: {
        id: '04-complicaciones',
        name: 'Complicaciones Materno-Fetales',
        cases: 50,
        keywords: ['RCIU', 'polihidramnios', 'placenta previa', 'abrupcio'],
      },
    },
  },
  TEMA2: {
    id: 'tema2',
    name: 'TEMA 2: Parto y Atención Intraparto',
    folder: 'TEMA2-PARTO-INTRAPARTO',
    totalCases: 200,
    subareas: {
      PARTO_NORMAL: {
        id: '01-parto-normal',
        name: 'Parto Normal y Mecánica',
        cases: 50,
        keywords: ['trabajo de parto', 'dilatación', 'conducción', 'Friedman', 'fases'],
      },
      MONITOREO_FETAL: {
        id: '02-monitoreo-fetal',
        name: 'Monitoreo Fetal Intraparto',
        cases: 50,
        keywords: ['CTG', 'FHR', 'deceleraciones', 'sufrimiento fetal', 'patrones'],
      },
      PARTO_INSTRUMENTAL: {
        id: '03-parto-instrumental',
        name: 'Parto Instrumental',
        cases: 50,
        keywords: ['fórceps', 'vacuum', 'cesárea', 'indicaciones', 'técnica'],
      },
      URGENCIAS: {
        id: '04-urgencias',
        name: 'Urgencias Obstétricas Intraparto',
        cases: 50,
        keywords: ['prolapso cordón', 'embolia amniótica', 'distocia hombro', 'ruptura uterina'],
      },
    },
  },
  TEMA3: {
    id: 'tema3',
    name: 'TEMA 3: Puerperio y Lactancia',
    folder: 'TEMA3-PUERPERIO-LACTANCIA',
    totalCases: 200,
    subareas: {
      PUERPERIO_NORMAL: {
        id: '01-puerperio-normal',
        name: 'Puerperio Normal',
        cases: 50,
        keywords: ['involución uterina', 'loquios', 'recuperación', 'alta'],
      },
      COMPLICACIONES: {
        id: '02-complicaciones',
        name: 'Complicaciones del Puerperio',
        cases: 50,
        keywords: ['endometritis', 'hemorragia', 'TVP', 'depresión postparto'],
      },
      LACTANCIA: {
        id: '03-lactancia',
        name: 'Lactancia Materna',
        cases: 50,
        keywords: ['técnica', 'mastitis', 'grietas', 'hipogalactia', 'fisiología'],
      },
      CUIDADOS_RN: {
        id: '04-cuidados-rn',
        name: 'Cuidados del RN',
        cases: 50,
        keywords: ['cordón umbilical', 'baño', 'signos alarma', 'screening', 'vínculo'],
      },
    },
  },
  TEMA4: {
    id: 'tema4',
    name: 'TEMA 4: Ginecología',
    folder: 'TEMA4-GINECOLOGIA',
    totalCases: 200,
    subareas: {
      TRASTORNOS_MENSTRUALES: {
        id: '01-trastornos-menstruales',
        name: 'Trastornos Menstruales',
        cases: 50,
        keywords: ['amenorrea', 'menorragia', 'dismenorrea', 'SDP'],
      },
      INFECCIONES: {
        id: '02-infecciones',
        name: 'Infecciones Genitales',
        cases: 50,
        keywords: ['vaginitis', 'EIP', 'úlceras', 'HPV'],
      },
      PATOLOGIA_MAMAS: {
        id: '03-patologia-mamas',
        name: 'Patología de Mamas',
        cases: 50,
        keywords: ['mastopatía', 'fibroadenoma', 'mastalgia', 'screening'],
      },
      PATOLOGIA_OVARICA: {
        id: '04-patologia-ovarica',
        name: 'Patología Ovárica/Endometrial',
        cases: 50,
        keywords: ['SOP', 'endometriosis', 'hiperplasia', 'cáncer'],
      },
    },
  },
  TEMA5: {
    id: 'tema5',
    name: 'TEMA 5: Salud Sexual y Anticoncepción',
    folder: 'TEMA5-SALUD-SEXUAL',
    totalCases: 200,
    subareas: {
      ANTICONCEPTIVOS: {
        id: '01-anticonceptivos',
        name: 'Métodos Anticonceptivos',
        cases: 50,
        keywords: ['píldora', 'parche', 'DIU', 'implante', 'inyectable'],
      },
      METODOS_BARRERA: {
        id: '02-metodos-barrera',
        name: 'Métodos Barrera y Naturales',
        cases: 50,
        keywords: ['preservativo', 'diafragma', 'Ogino', 'coito interrumpido'],
      },
      ITS: {
        id: '03-its',
        name: 'Infecciones de Transmisión Sexual',
        cases: 50,
        keywords: ['gonorrea', 'sífilis', 'VIH', 'herpes', 'hepatitis'],
      },
      PLANIFICACION: {
        id: '04-planificacion',
        name: 'Planificación Familiar',
        cases: 50,
        keywords: ['fertilidad', 'consejería', 'infertilidad', 'reproducción asistida'],
      },
    },
  },
  TEMA6: {
    id: 'tema6',
    name: 'TEMA 6: Neonatología / Recién Nacido',
    folder: 'TEMA6-NEONATOLOGIA',
    totalCases: 200,
    subareas: {
      ATENCION_INMEDIATA: {
        id: '01-atencion-inmediata',
        name: 'Atención Inmediata del RN',
        cases: 50,
        keywords: ['Apgar', 'evaluación física', 'reanimación', 'reflejos'],
      },
      PREMATURO: {
        id: '02-prematuro',
        name: 'Recién Nacido Prematuro',
        cases: 50,
        keywords: ['edad gestacional', 'SDR', 'NEC', 'ROP', 'BPD'],
      },
      PATOLOGIA: {
        id: '03-patologia',
        name: 'Patología Neonatal',
        cases: 50,
        keywords: ['ictericia', 'hipoglucemia', 'sepsis', 'anomalías', 'lesiones'],
      },
      CUIDADOS: {
        id: '04-cuidados',
        name: 'Cuidados Neonatales',
        cases: 50,
        keywords: ['temperatura', 'alimentación', 'cordón', 'screening', 'vacunas'],
      },
    },
  },
} as const;

export type TemaId = keyof typeof CLINICAL_TEMAS;
export type SubareaId = string;
