/**
 * Base de datos de recursos MINSAL
 * Catálogo completo de PDFs disponibles con metadatos
 * @module lib/data/minsal-resources
 */

import { Resource } from '@/lib/types/resources';

export const MINSAL_RESOURCES: Resource[] = [
  // === ADOLESCENCIA ===
  {
    id: 'atencion-integral-adolescentes',
    title: 'Atención Integral de Adolescentes con Pertinencia Cultural',
    description: 'Orientaciones técnicas para la atención integral de adolescentes y jóvenes con enfoque intercultural y de derechos.',
    fileName: 'ATENCION-INTEGRAL-ADOLESCENTES-CON-PERTINENCIA-CULTURAL.pdf',
    fileUrl: '/resources/cases/normas-minsal/ATENCION-INTEGRAL-ADOLESCENTES-CON-PERTINENCIA-CULTURAL.pdf',
    category: 'Adolescencia',
    source: 'MINSAL',
    year: 2023,
    tags: ['adolescentes', 'atención integral', 'interculturalidad', 'derechos'],
  },
  {
    id: 'programa-adolescentes-jovenes',
    title: 'Programa Nacional de Salud de Adolescentes y Jóvenes',
    description: 'Lineamientos programáticos para la atención de salud de adolescentes y jóvenes en el sistema público.',
    fileName: 'Programa-Nacional-de-Salud-de-Adolescentes-y-Jovenes-MINSAL-2023.pdf',
    fileUrl: '/resources/cases/normas-minsal/Programa-Nacional-de-Salud-de-Adolescentes-y-Jovenes-MINSAL-2023.pdf',
    category: 'Adolescencia',
    source: 'MINSAL',
    year: 2023,
    tags: ['adolescentes', 'programa nacional', 'salud joven'],
  },
  {
    id: 'vih-adolescentes',
    title: 'VIH en Adolescentes - Guía Clínica',
    description: 'Protocolo de atención, prevención y tratamiento de VIH en población adolescente.',
    fileName: 'VIH-Adolescentes.pdf',
    fileUrl: '/resources/cases/normas-minsal/VIH-Adolescentes.pdf',
    category: 'Adolescencia',
    source: 'MINSAL',
    year: 2021,
    tags: ['VIH', 'adolescentes', 'prevención', 'tratamiento'],
  },

  // === ITS/VIH ===
  {
    id: 'estrategia-its',
    title: 'Estrategia de Prevención de las ITS',
    description: 'Estrategia nacional para la prevención y control de infecciones de transmisión sexual.',
    fileName: 'Estrategia-de-Prevención-de-las-Infecciones-de-Transmisión-Sexual-final-09-07-2020.pdf',
    fileUrl: '/resources/cases/normas-minsal/Estrategia-de-Prevención-de-las-Infecciones-de-Transmisión-Sexual-final-09-07-2020.pdf',
    category: 'ITS/VIH',
    source: 'MINSAL',
    year: 2020,
    tags: ['ITS', 'prevención', 'estrategia nacional'],
  },
  {
    id: 'protocolo-mujeres-vih',
    title: 'Protocolo de Atención a Mujeres Viviendo con VIH',
    description: 'Guía técnica para la atención integral de mujeres con VIH, incluyendo embarazo y parto.',
    fileName: 'PROTOCOLO-ATENCION-A-MUJERES-VIVIENDO-CON-VIH_web.pdf',
    fileUrl: '/resources/cases/normas-minsal/PROTOCOLO-ATENCION-A-MUJERES-VIVIENDO-CON-VIH_web.pdf',
    category: 'ITS/VIH',
    source: 'MINSAL',
    year: 2019,
    tags: ['VIH', 'mujeres', 'embarazo', 'transmisión vertical'],
  },
  {
    id: 'prep-vih',
    title: 'Profilaxis Pre-Exposición (PrEP) al VIH',
    description: 'Orientaciones técnicas para la implementación de PrEP como estrategia de prevención del VIH.',
    fileName: 'OT-2019-Profilaxis-Pre-Exposición-PrEP-a-la-infección-por-VIH.pdf',
    fileUrl: '/resources/cases/normas-minsal/OT-2019-Profilaxis-Pre-Exposición-PrEP-a-la-infección-por-VIH.pdf',
    category: 'ITS/VIH',
    source: 'MINSAL',
    year: 2019,
    tags: ['PrEP', 'VIH', 'prevención', 'profilaxis'],
  },
  {
    id: 'consejeria-vih-its',
    title: 'Manual de Formación Básica en Consejería para VIH e ITS',
    description: 'Manual de capacitación para profesionales en técnicas de consejería en VIH e ITS.',
    fileName: 'Manual-de-Formación-Básica-en-Consejería-para-el-VIH-y-las-ITS-2011.pdf',
    fileUrl: '/resources/cases/normas-minsal/Manual-de-Formación-Básica-en-Consejería-para-el-VIH-y-las-ITS-2011.pdf',
    category: 'ITS/VIH',
    source: 'MINSAL',
    year: 2011,
    tags: ['consejería', 'VIH', 'ITS', 'capacitación'],
  },

  // === ANTICONCEPCIÓN Y FERTILIDAD ===
  {
    id: 'normas-fertilidad',
    title: 'Normas Nacionales de Regulación de la Fertilidad',
    description: 'Norma técnica nacional para la regulación de la fertilidad y anticoncepción en el sistema público.',
    fileName: 'normas.nacionales.fertilidad.pdf',
    fileUrl: '/resources/cases/normas-minsal/normas.nacionales.fertilidad.pdf',
    category: 'Anticoncepción',
    source: 'MINSAL',
    year: 2018,
    tags: ['anticoncepción', 'fertilidad', 'planificación familiar', 'MAC'],
  },

  // === EMBARAZO Y PARTO ===
  {
    id: 'antenatal-care-oms',
    title: 'Antenatal Care for a Positive Pregnancy Experience (OMS)',
    description: 'Guía de la OMS sobre atención prenatal centrada en la experiencia positiva del embarazo.',
    fileName: 'antenatal_care_for_a_positive_pregnanc_experience_OMS_ENGLISH.pdf',
    fileUrl: '/resources/cases/normas-minsal/antenatal_care_for_a_positive_pregnanc_experience_OMS_ENGLISH.pdf',
    category: 'Embarazo y Parto',
    source: 'OMS',
    year: 2016,
    tags: ['embarazo', 'prenatal', 'OMS', 'english'],
  },

  // === PUERPERIO ===
  {
    id: 'atencion-integral-puerperio',
    title: 'Norma Técnica para la Atención Integral en el Puerperio',
    description: 'Protocolo para la atención de la mujer en el período posparto inmediato y tardío.',
    fileName: 'NORMA-TECNICA-PARA-LA-ATENCION-INTEGRAL-EN-EL-PUERPERIO_web.-08.10.2015-R (1).pdf',
    fileUrl: '/resources/cases/normas-minsal/NORMA-TECNICA-PARA-LA-ATENCION-INTEGRAL-EN-EL-PUERPERIO_web.-08.10.2015-R (1).pdf',
    category: 'Puerperio',
    source: 'MINSAL',
    year: 2015,
    tags: ['puerperio', 'posparto', 'lactancia'],
  },

  // === RECIÉN NACIDO ===
  {
    id: 'atencion-recien-nacido',
    title: 'Norma 194: Atención del Recién Nacido',
    description: 'Norma técnica para la atención inmediata del recién nacido en sala de parto y puerperio.',
    fileName: 'Norma-194-Atencion-del-Recien-Nacido.Version-WEB.pdf',
    fileUrl: '/resources/cases/normas-minsal/Norma-194-Atencion-del-Recien-Nacido.Version-WEB.pdf',
    category: 'Embarazo y Parto',
    source: 'MINSAL',
    year: 2018,
    tags: ['recién nacido', 'neonatología', 'parto'],
  },

  // === CLIMATERIO ===
  {
    id: 'orientaciones-climaterio',
    title: 'Orientaciones Técnicas para la Atención en Climaterio',
    description: 'Guía clínica para el manejo integral de la mujer en etapa de climaterio y menopausia.',
    fileName: 'OTCLIMATERIOinteriorValenteindd04022014.pdf',
    fileUrl: '/resources/cases/normas-minsal/OTCLIMATERIOinteriorValenteindd04022014.pdf',
    category: 'Climaterio',
    source: 'MINSAL',
    year: 2014,
    tags: ['climaterio', 'menopausia', 'terapia hormonal'],
  },

  // === CÁNCER GINECOLÓGICO ===
  {
    id: 'gpc-cacu',
    title: 'Guía de Práctica Clínica: Cáncer Cervicouterino',
    description: 'GPC para el diagnóstico, tratamiento y seguimiento del cáncer de cuello uterino.',
    fileName: 'GPC-CaCU.pdf',
    fileUrl: '/resources/cases/normas-minsal/GPC-CaCU.pdf',
    category: 'Cáncer Ginecológico',
    source: 'MINSAL',
    year: 2020,
    tags: ['cáncer cervical', 'VPH', 'tamizaje', 'PAP'],
  },
  {
    id: 'gpc-ca-mama',
    title: 'Guía de Práctica Clínica: Cáncer de Mama',
    description: 'GPC para el manejo integral del cáncer de mama: detección, diagnóstico y tratamiento.',
    fileName: 'GPC-CaMama.pdf',
    fileUrl: '/resources/cases/normas-minsal/GPC-CaMama.pdf',
    category: 'Cáncer Ginecológico',
    source: 'MINSAL',
    year: 2019,
    tags: ['cáncer mama', 'mamografía', 'tamizaje'],
  },
  {
    id: 'cancer-ovario',
    title: 'Cáncer de Ovario Epitelial - Protocolo',
    description: 'Protocolo de manejo del cáncer de ovario epitelial.',
    fileName: 'OVARIO_EPITELIAL.pdf',
    fileUrl: '/resources/cases/normas-minsal/OVARIO_EPITELIAL.pdf',
    category: 'Cáncer Ginecológico',
    source: 'MINSAL',
    year: 2018,
    tags: ['cáncer ovario', 'ginecología oncológica'],
  },

  // === SALUD REPRODUCTIVA ===
  {
    id: 'aborto-perdidas',
    title: 'Abortos y Pérdidas Reproductivas',
    description: 'Protocolo para el manejo de abortos espontáneos y pérdidas reproductivas.',
    fileName: 'abortos-perdidas-reproductivas.pdf',
    fileUrl: '/resources/cases/normas-minsal/abortos-perdidas-reproductivas.pdf',
    category: 'Salud Reproductiva',
    source: 'MINSAL',
    year: 2019,
    tags: ['aborto', 'pérdida gestacional', 'misoprostol'],
  },
  {
    id: 'directrices-aborto-oms',
    title: 'Directrices sobre la Atención para el Aborto (OMS)',
    description: 'Guía de la OMS para el manejo seguro del aborto y atención post-aborto.',
    fileName: 'Directrices_sobre_la_atencion_para_el_aborto_OMS.pdf',
    fileUrl: '/resources/cases/normas-minsal/Directrices_sobre_la_atencion_para_el_aborto_OMS.pdf',
    category: 'Salud Reproductiva',
    source: 'OMS',
    year: 2022,
    tags: ['aborto', 'OMS', 'derechos reproductivos'],
  },
  {
    id: 'ley-mila',
    title: 'Norma Técnica Ley 21.372 - Ley Mila',
    description: 'Implementación de la Ley de Acompañamiento de Niños, Niñas y Adolescentes en el Sistema de Salud.',
    fileName: 'NT-Ley-21.372-Mila.pdf',
    fileUrl: '/resources/cases/normas-minsal/NT-Ley-21.372-Mila.pdf',
    category: 'Salud Reproductiva',
    source: 'MINSAL',
    year: 2021,
    tags: ['ley mila', 'derechos', 'acompañamiento'],
  },
  {
    id: 'ssrr-pueblos-indigenas',
    title: 'Guía de SSRR y Pueblos Indígenas',
    description: 'Orientaciones para la atención en salud sexual y reproductiva con pertinencia cultural para pueblos indígenas.',
    fileName: 'GUIA-SSRR-Y-PUEBLOS-INDÍGENAS.pdf',
    fileUrl: '/resources/cases/normas-minsal/GUIA-SSRR-Y-PUEBLOS-INDÍGENAS.pdf',
    category: 'Salud Reproductiva',
    source: 'MINSAL',
    year: 2020,
    tags: ['pueblos indígenas', 'interculturalidad', 'pertinencia cultural'],
  },
];

/**
 * Obtiene todos los recursos con filtros opcionales
 */
export function getResources(filters?: Partial<{
  category: string;
  source: string;
  search: string;
  tags: string[];
}>): Resource[] {
  let results = [...MINSAL_RESOURCES];

  if (filters?.category && filters.category !== 'Todos') {
    results = results.filter(r => r.category === filters.category);
  }

  if (filters?.source && filters.source !== 'Todos') {
    results = results.filter(r => r.source === filters.source);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    results = results.filter(r =>
      r.title.toLowerCase().includes(searchLower) ||
      r.description.toLowerCase().includes(searchLower) ||
      r.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  if (filters?.tags && filters.tags.length > 0) {
    results = results.filter(r =>
      filters.tags!.some(tag => r.tags.includes(tag))
    );
  }

  return results;
}

/**
 * Obtiene un recurso por su ID
 */
export function getResourceById(id: string): Resource | undefined {
  return MINSAL_RESOURCES.find(r => r.id === id);
}

/**
 * Obtiene estadísticas de los recursos
 */
export function getResourceStats() {
  const byCategory: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const allTags: Set<string> = new Set();

  MINSAL_RESOURCES.forEach(resource => {
    byCategory[resource.category] = (byCategory[resource.category] || 0) + 1;
    bySource[resource.source] = (bySource[resource.source] || 0) + 1;
    resource.tags.forEach(tag => allTags.add(tag));
  });

  return {
    totalResources: MINSAL_RESOURCES.length,
    byCategory,
    bySource,
    popularTags: Array.from(allTags).sort(),
  };
}
