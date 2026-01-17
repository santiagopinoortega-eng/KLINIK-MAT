/**
 * lib/constants/areas-clinicas.ts
 * Constantes para áreas y subáreas clínicas de KLINIK-MAT
 * Estas deben coincidir con los valores usados en los casos JSON5
 */

export const AREAS_CLINICAS = {
  EMBARAZO_PRENATAL: {
    id: 'embarazo-prenatal',
    nombre: 'Embarazo y Control Prenatal',
    descripcion: 'Control prenatal, patología del embarazo, diagnóstico prenatal y complicaciones materno-fetales',
    subareas: {
      CONTROL_NORMAL: {
        id: 'control-normal',
        nombre: 'Control Prenatal Normal',
        descripcion: 'Cálculo EG, PA, ganancia peso, cambios normales'
      },
      PATOLOGIA: {
        id: 'patologia-embarazo',
        nombre: 'Patología del Embarazo',
        descripcion: 'Preeclampsia, diabetes gestacional, infecciones'
      },
      DIAGNOSTICO_PRENATAL: {
        id: 'diagnostico-prenatal',
        nombre: 'Diagnóstico Prenatal',
        descripcion: 'Ecografía, medidas fetales, screening, anomalías'
      },
      COMPLICACIONES: {
        id: 'complicaciones-materno-fetales',
        nombre: 'Complicaciones Materno-Fetales',
        descripcion: 'RCIU, polihidramnios, placenta previa, abrupcio'
      }
    }
  },

  PARTO_INTRAPARTO: {
    id: 'parto-intraparto',
    nombre: 'Parto y Atención Intraparto',
    descripcion: 'Trabajo de parto, monitoreo fetal, parto instrumental y urgencias obstétricas',
    subareas: {
      PARTO_NORMAL: {
        id: 'parto-normal',
        nombre: 'Parto Normal y Mecánica',
        descripcion: 'Trabajo de parto, fases, conducción'
      },
      MONITOREO_FETAL: {
        id: 'monitoreo-fetal',
        nombre: 'Monitoreo Fetal Intraparto',
        descripcion: 'CTG, patrones FHR, sufrimiento fetal'
      },
      PARTO_INSTRUMENTAL: {
        id: 'parto-instrumental',
        nombre: 'Parto Instrumental',
        descripcion: 'Fórceps, vacuum, indicaciones, técnica'
      },
      URGENCIAS: {
        id: 'urgencias-intraparto',
        nombre: 'Urgencias Obstétricas Intraparto',
        descripcion: 'Prolapso cordón, embolia amniótica, distocia hombro'
      }
    }
  },

  PUERPERIO_LACTANCIA: {
    id: 'puerperio-lactancia',
    nombre: 'Puerperio y Lactancia',
    descripcion: 'Puerperio normal, complicaciones, lactancia materna y cuidados del RN',
    subareas: {
      PUERPERIO_NORMAL: {
        id: 'puerperio-normal',
        nombre: 'Puerperio Normal',
        descripcion: 'Involución uterina, loquios, recuperación'
      },
      COMPLICACIONES: {
        id: 'complicaciones-puerperio',
        nombre: 'Complicaciones del Puerperio',
        descripcion: 'Endometritis, hemorragia, TVP, depresión postparto'
      },
      LACTANCIA: {
        id: 'lactancia-materna',
        nombre: 'Lactancia Materna',
        descripcion: 'Fisiología, técnica, mastitis, grietas'
      },
      CUIDADOS_RN: {
        id: 'cuidados-rn',
        nombre: 'Cuidados del RN',
        descripcion: 'Cordón umbilical, baño, signos alarma, vínculo'
      }
    }
  },

  GINECOLOGIA: {
    id: 'ginecologia',
    nombre: 'Ginecología',
    descripcion: 'Trastornos menstruales, infecciones, patología de mamas y ovárica/endometrial',
    subareas: {
      TRASTORNOS_MENSTRUALES: {
        id: 'trastornos-menstruales',
        nombre: 'Trastornos Menstruales',
        descripcion: 'Amenorrea, menorragia, dismenorrea, SDP'
      },
      INFECCIONES: {
        id: 'infecciones-genitales',
        nombre: 'Infecciones Genitales',
        descripcion: 'Vaginitis, EIP, úlceras, HPV'
      },
      PATOLOGIA_MAMAS: {
        id: 'patologia-mamas',
        nombre: 'Patología de Mamas',
        descripcion: 'Mastopatía fibroquística, fibroadenoma, mastalgias'
      },
      PATOLOGIA_OVARICA: {
        id: 'patologia-ovarica-endometrial',
        nombre: 'Patología Ovárica/Endometrial',
        descripcion: 'SOP, endometriosis, hiperplasia, cáncer early'
      }
    }
  },

  SALUD_SEXUAL: {
    id: 'salud-sexual-anticoncepcion',
    nombre: 'Salud Sexual y Anticoncepción',
    descripcion: 'Métodos anticonceptivos, ITS y planificación familiar',
    subareas: {
      ANTICONCEPTIVOS: {
        id: 'metodos-anticonceptivos',
        nombre: 'Métodos Anticonceptivos',
        descripcion: 'Píldora, parche, DIU, implante, inyectable'
      },
      BARRERA_NATURALES: {
        id: 'metodos-barrera-naturales',
        nombre: 'Métodos Barrera y Naturales',
        descripcion: 'Preservativo, diafragma, Ogino, coito interrumpido'
      },
      ITS: {
        id: 'infecciones-transmision-sexual',
        nombre: 'Infecciones de Transmisión Sexual',
        descripcion: 'Gonorrea, sífilis, VIH, herpes, hepatitis'
      },
      PLANIFICACION_FAMILIAR: {
        id: 'planificacion-familiar',
        nombre: 'Planificación Familiar',
        descripcion: 'Fertilidad, consejería, infertilidad, reproducción asistida'
      }
    }
  },

  NEONATOLOGIA: {
    id: 'neonatologia',
    nombre: 'Neonatología / Recién Nacido',
    descripcion: 'Atención inmediata, prematuro, patología neonatal y cuidados',
    subareas: {
      ATENCION_INMEDIATA: {
        id: 'atencion-inmediata-rn',
        nombre: 'Atención Inmediata del RN',
        descripcion: 'Apgar, evaluación física, reanimación, reflejos'
      },
      PREMATURO: {
        id: 'recien-nacido-prematuro',
        nombre: 'Recién Nacido Prematuro',
        descripcion: 'Edad gestacional, SDR, NEC, ROP, BPD'
      },
      PATOLOGIA_NEONATAL: {
        id: 'patologia-neonatal',
        nombre: 'Patología Neonatal',
        descripcion: 'Ictericia, hipoglucemia, sepsis, anomalías, lesiones'
      },
      CUIDADOS: {
        id: 'cuidados-neonatales',
        nombre: 'Cuidados Neonatales',
        descripcion: 'Temperatura, alimentación, cordón, screening, vacunas'
      }
    }
  }
} as const;

// Tipo para TypeScript
export type AreaId = keyof typeof AREAS_CLINICAS;
export type SubareaId<T extends AreaId> = keyof typeof AREAS_CLINICAS[T]['subareas'];

// Helper para obtener lista de áreas
export function getAreas() {
  return Object.values(AREAS_CLINICAS).map(area => ({
    id: area.id,
    nombre: area.nombre,
    descripcion: area.descripcion
  }));
}

// Helper para obtener subáreas de un área
export function getSubareas(areaId: string) {
  const area = Object.values(AREAS_CLINICAS).find(a => a.id === areaId);
  if (!area) return [];
  
  return Object.values(area.subareas).map(subarea => ({
    id: subarea.id,
    nombre: subarea.nombre,
    descripcion: subarea.descripcion
  }));
}

// Helper para validar área y subárea
export function isValidArea(areaId: string): boolean {
  return Object.values(AREAS_CLINICAS).some(a => a.id === areaId);
}

export function isValidSubarea(areaId: string, subareaId: string): boolean {
  const area = Object.values(AREAS_CLINICAS).find(a => a.id === areaId);
  if (!area) return false;
  
  return Object.values(area.subareas).some(s => s.id === subareaId);
}
