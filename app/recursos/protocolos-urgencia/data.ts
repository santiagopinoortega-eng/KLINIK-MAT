// data.ts - Protocolos de Urgencias Obstétricas
// Basado en: Guías MINSAL Chile, ACOG, RCOG, Williams Obstetrics

export interface UrgencyProtocol {
  id: string;
  title: string;
  category: 'hemorragia' | 'hipertension' | 'parto' | 'fetal' | 'sepsis' | 'otros';
  priority: 'critica' | 'alta' | 'moderada';
  timeWindow: string; // "Minutos críticos" para actuar
  definition: string;
  clinicalPresentation: string[];
  diagnosticCriteria: string[];
  initialManagement: {
    step: number;
    action: string;
    details: string;
    timeframe?: string;
  }[];
  medications: {
    drug: string;
    dose: string;
    route: string;
    indication: string;
  }[];
  redFlags: string[];
  whenToTransfer: string[];
  evidenceLevel: string;
  references: {
    source: string;
    type: 'MINSAL' | 'ACOG' | 'RCOG' | 'WHO' | 'Libro' | 'Paper';
    year: number;
    url?: string;
  }[];
}

export const PROTOCOL_CATEGORIES = {
  hemorragia: {
    id: 'hemorragia',
    name: 'Hemorragias',
    icon: '🩸',
    color: 'from-red-600 to-rose-700',
    description: 'HPP, placenta previa, desprendimiento'
  },
  hipertension: {
    id: 'hipertension',
    name: 'Trastornos Hipertensivos',
    icon: '⚠️',
    color: 'from-orange-600 to-amber-700',
    description: 'Preeclampsia, eclampsia, HELLP'
  },
  parto: {
    id: 'parto',
    name: 'Urgencias del Parto',
    icon: '👶',
    color: 'from-blue-600 to-indigo-700',
    description: 'Distocia, parto pretérmino'
  },
  fetal: {
    id: 'fetal',
    name: 'Emergencias Fetales',
    icon: '💓',
    color: 'from-purple-600 to-pink-700',
    description: 'Pérdida bienestar fetal, prolapso'
  },
  sepsis: {
    id: 'sepsis',
    name: 'Sepsis Materna',
    icon: '🦠',
    color: 'from-green-600 to-emerald-700',
    description: 'Corioamnionitis, sepsis puerperal'
  },
  otros: {
    id: 'otros',
    name: 'Otras Emergencias',
    icon: '🚨',
    color: 'from-gray-600 to-slate-700',
    description: 'Embolia, inversión uterina'
  }
} as const;

export const URGENCY_PROTOCOLS: UrgencyProtocol[] = [
  // ==================== HEMORRAGIAS ====================
  {
    id: 'hemorragia-postparto',
    title: 'Hemorragia Postparto (HPP)',
    category: 'hemorragia',
    priority: 'critica',
    timeWindow: '< 10 minutos',
    definition: 'Pérdida sanguínea >500 mL en parto vaginal o >1000 mL en cesárea, o cualquier pérdida que cause inestabilidad hemodinámica.',
    clinicalPresentation: [
      'Sangrado vaginal abundante continuo',
      'Útero blando, atónico, por sobre ombligo',
      'Signos de shock: taquicardia >110, hipotensión, palidez',
      'Alteración del estado mental, oliguria'
    ],
    diagnosticCriteria: [
      'Cuantificación visual o con bolsa colectora',
      'Hb/Hto en sangrado activo (baseline)',
      'Pruebas de coagulación si >1500 mL',
      'Ecografía: descartar retención, hematomas'
    ],
    initialManagement: [
      {
        step: 1,
        action: 'Activar Código Rojo Obstétrico',
        details: 'Llamar equipo multidisciplinario: obstetra, anestesia, banco sangre, matrona',
        timeframe: 'Inmediato'
      },
      {
        step: 2,
        action: 'Vía venosa + Reanimación',
        details: '2 vías gruesas (14-16G), cristaloides 1000 mL rápido, O2 mascarilla 10 L/min',
        timeframe: '< 2 minutos'
      },
      {
        step: 3,
        action: 'Masaje uterino bimanual',
        details: 'Mano externa en fondo uterino, interna en fórnix posterior. Masaje vigoroso continuo',
        timeframe: '< 3 minutos'
      },
      {
        step: 4,
        action: 'Oxitocina IV',
        details: '10-40 UI en 500-1000 mL cristaloides a 200 mL/h. NO bolo rápido',
        timeframe: '< 5 minutos'
      },
      {
        step: 5,
        action: 'Revisión cavidad + Tracción placentaria',
        details: 'Revisar retención restos, laceraciones, inversión. Tracción controlada cordón',
        timeframe: '5-10 minutos'
      },
      {
        step: 6,
        action: 'Si persiste: Segunda línea',
        details: 'Misoprostol 800 mcg sublingual/rectal O Metilergonovina 0.2 mg IM',
        timeframe: '10-15 minutos'
      },
      {
        step: 7,
        action: 'Taponamiento uterino con balón',
        details: 'Balón Bakri 300-500 mL o sonda Foley + gasa. Control ecográfico',
        timeframe: '15-20 minutos'
      },
      {
        step: 8,
        action: 'Preparar pabellón',
        details: 'Si >1500 mL o inestabilidad: suturas hemostáticas, ligadura arterias, histerectomía',
        timeframe: '< 30 minutos'
      }
    ],
    medications: [
      {
        drug: 'Oxitocina',
        dose: '10-40 UI en 500 mL SF',
        route: 'IV infusión lenta',
        indication: 'Primera línea. NO bolo rápido (hipotensión)'
      },
      {
        drug: 'Misoprostol',
        dose: '800-1000 mcg',
        route: 'Sublingual o rectal',
        indication: 'Si falla oxitocina. Efecto en 10-15 min'
      },
      {
        drug: 'Metilergonovina',
        dose: '0.2 mg c/2-4h (máx 5 dosis)',
        route: 'IM (nunca IV)',
        indication: 'Contraindicada en HTA. Causa vasoconstricción'
      },
      {
        drug: 'Ácido Tranexámico',
        dose: '1 g en 10 min, repetir en 30 min si persiste',
        route: 'IV lento',
        indication: 'Dentro de 3 horas del sangrado. Reduce mortalidad'
      },
      {
        drug: 'Factor VII activado (rFVIIa)',
        dose: '90 mcg/kg',
        route: 'IV',
        indication: 'Rescate en hemorragia masiva refractaria'
      }
    ],
    redFlags: [
      'Sangrado >1500 mL en primera hora',
      'Útero que no responde a masaje + oxitocina',
      'Signos de coagulopatía (sangrado en sitios punción)',
      'Alteración conciencia, anuria, extremidades frías',
      'Necesidad de >4 unidades GR en 1 hora'
    ],
    whenToTransfer: [
      'Centro sin banco de sangre disponible 24/7',
      'Sangrado refractario a medidas médicas',
      'Necesidad de radiología intervencionista',
      'Requerimiento de histerectomía en centro sin UCI',
      'Coagulopatía que requiere hemoderivados complejos'
    ],
    evidenceLevel: 'IA (Guías MINSAL, ACOG, OMS)',
    references: [
      {
        source: 'Guía Perinatal MINSAL Chile 2015 - Hemorragia Postparto',
        type: 'MINSAL',
        year: 2015,
        url: 'https://www.minsal.cl'
      },
      {
        source: 'ACOG Practice Bulletin No. 183: Postpartum Hemorrhage',
        type: 'ACOG',
        year: 2017
      },
      {
        source: 'WHO Recommendations on Prevention and Treatment of PPH',
        type: 'WHO',
        year: 2012
      },
      {
        source: 'Williams Obstetrics 26th Edition - Chapter 41: Obstetric Hemorrhage',
        type: 'Libro',
        year: 2022
      }
    ]
  },

  {
    id: 'desprendimiento-placenta',
    title: 'Desprendimiento Prematuro de Placenta (DPPNI)',
    category: 'hemorragia',
    priority: 'critica',
    timeWindow: '< 20 minutos hasta parto',
    definition: 'Separación total o parcial de la placenta normalmente inserta antes del nacimiento del feto (≥20 semanas).',
    clinicalPresentation: [
      'Dolor abdominal intenso, continuo, de inicio súbito',
      'Sangrado vaginal oscuro (70-80% casos)',
      'Útero hipertónico, "leñoso", doloroso',
      'Signos de sufrimiento fetal (bradicardia, deceleraciones)',
      'Shock desproporcionado al sangrado visible'
    ],
    diagnosticCriteria: [
      'Clínica: dolor + sangrado + útero hipertónico',
      'Ecografía: hematoma retroplacentario (solo 50% sensibilidad)',
      'Monitoreo fetal: patrón sinusoidal, bradicardia',
      'Laboratorio: anemia, coagulopatía (30% casos severos)'
    ],
    initialManagement: [
      {
        step: 1,
        action: 'Estabilización materna',
        details: '2 vías 16G, cristaloides, tipo/cruza 4 U, labs (Hb, coagulación, fibrinógeno)',
        timeframe: 'Simultáneo'
      },
      {
        step: 2,
        action: 'Evaluación fetal',
        details: 'CTG continuo. Si bradicardia sostenida >10 min → cesárea inmediata',
        timeframe: '< 5 minutos'
      },
      {
        step: 3,
        action: 'Vía del parto según severidad',
        details: 'Leve + feto vivo: prueba parto. Moderada-Severa: cesárea urgente',
        timeframe: '< 20 minutos'
      },
      {
        step: 4,
        action: 'Preparar sangre',
        details: 'Activar protocolo transfusión masiva si inestabilidad',
        timeframe: 'Inmediato'
      }
    ],
    medications: [
      {
        drug: 'Cristaloides',
        dose: '1-2 L rápido',
        route: 'IV',
        indication: 'Reanimación inicial'
      },
      {
        drug: 'Concentrado Glóbulos Rojos',
        dose: 'Según Hb/sangrado',
        route: 'IV',
        indication: 'Mantener Hb >8 g/dL'
      },
      {
        drug: 'Plasma Fresco Congelado',
        dose: '10-15 mL/kg',
        route: 'IV',
        indication: 'Si coagulopatía (INR >1.5, TP >1.5x control)'
      },
      {
        drug: 'Sulfato de Magnesio',
        dose: '4-6 g carga',
        route: 'IV',
        indication: 'Si HTA asociada. Neuroprotección fetal <32 sem'
      }
    ],
    redFlags: [
      'Útero de consistencia leñosa',
      'Sangrado oculto masivo (hemoperitoneo)',
      'Coagulación Intravascular Diseminada (CID)',
      'Muerte fetal intrauterina',
      'Shock materno refractario'
    ],
    whenToTransfer: [
      'Centro sin capacidad de cesárea emergente 24/7',
      'Falta de banco de sangre inmediato',
      'Coagulopatía severa sin acceso a hemoderivados',
      'Necesidad de UCI materna'
    ],
    evidenceLevel: 'IA (ACOG, RCOG)',
    references: [
      {
        source: 'Guía Perinatal MINSAL - Desprendimiento Placenta',
        type: 'MINSAL',
        year: 2015
      },
      {
        source: 'ACOG Practice Bulletin: Placental Abruption',
        type: 'ACOG',
        year: 2018
      },
      {
        source: 'Williams Obstetrics 26th Ed - Placental Abruption',
        type: 'Libro',
        year: 2022
      }
    ]
  },

  // ==================== HIPERTENSIÓN ====================
  {
    id: 'preeclampsia-severa',
    title: 'Preeclampsia Severa / Eclampsia',
    category: 'hipertension',
    priority: 'critica',
    timeWindow: '< 15 minutos hasta control PA',
    definition: 'HTA ≥160/110 + proteinuria/daño órgano blanco. Eclampsia: convulsiones tónico-clónicas en contexto preeclampsia.',
    clinicalPresentation: [
      'PA ≥160/110 en 2 tomas separadas 4h',
      'Cefalea frontal/occipital intensa',
      'Alteraciones visuales (escotomas, fotopsias)',
      'Dolor epigástrico/HCD (distensión cápsula hepática)',
      'Convulsión tónico-clónica generalizada (eclampsia)'
    ],
    diagnosticCriteria: [
      'PA ≥160/110 mmHg confirmada',
      'Proteinuria ≥300 mg/24h o índice P/C ≥0.3',
      'Plaquetas <100.000/μL',
      'Creatinina >1.1 mg/dL o duplica basal',
      'Transaminasas elevadas (>2x normal)',
      'Edema pulmonar, alteración visual/neurológica'
    ],
    initialManagement: [
      {
        step: 1,
        action: 'Manejo emergente HTA',
        details: 'Labetalol IV o Hidralazina IV. Meta: PA <160/105 en 30-60 min',
        timeframe: '< 15 minutos'
      },
      {
        step: 2,
        action: 'Sulfato de Magnesio',
        details: 'Carga 4-6 g IV en 20 min, luego 1-2 g/h. Prevención/tratamiento convulsiones',
        timeframe: '< 30 minutos'
      },
      {
        step: 3,
        action: 'Evaluación laboratorio',
        details: 'Hemograma, función renal, hepática, LDH, orina. Descartar HELLP',
        timeframe: 'Urgente'
      },
      {
        step: 4,
        action: 'Evaluación fetal',
        details: 'CTG, perfil biofísico, Doppler. Valorar compromiso',
        timeframe: '< 1 hora'
      },
      {
        step: 5,
        action: 'Decidir vía/timing parto',
        details: '≥34 sem: interrupción en 24-48h. <34 sem: corticoides + estabilizar',
        timeframe: 'Según edad gestacional'
      },
      {
        step: 6,
        action: 'Si eclampsia: proteger vía aérea',
        details: 'Decúbito lateral, aspirar, O2, MgSO4 si no tenía. Control PA',
        timeframe: 'Inmediato'
      }
    ],
    medications: [
      {
        drug: 'Labetalol',
        dose: '20 mg IV, luego 40-80 mg c/10 min (máx 300 mg)',
        route: 'IV bolo lento',
        indication: 'Primera línea antihipertensivo'
      },
      {
        drug: 'Hidralazina',
        dose: '5 mg IV, repetir 5-10 mg c/20 min (máx 30 mg)',
        route: 'IV bolo',
        indication: 'Alternativa. Inicio efecto en 10-20 min'
      },
      {
        drug: 'Nifedipino',
        dose: '10-20 mg VO, repetir c/30 min si necesario',
        route: 'Oral',
        indication: 'Si no hay acceso IV. NO sublingual'
      },
      {
        drug: 'Sulfato de Magnesio',
        dose: 'Carga 4-6 g IV en 20 min, mantención 1-2 g/h x 24h post parto',
        route: 'IV infusión',
        indication: 'Neuroprotección, prevención convulsiones. Monitorear ROT, FR, diuresis'
      },
      {
        drug: 'Betametasona',
        dose: '12 mg IM c/24h (2 dosis)',
        route: 'IM',
        indication: 'Maduración pulmonar fetal 24-34 semanas'
      }
    ],
    redFlags: [
      'PA >180/120 refractaria (emergencia hipertensiva)',
      'Convulsión a pesar de MgSO4 terapéutico',
      'Signos HELLP: plaquetas <50K, LDH >1000',
      'Oliguria <30 mL/h, creatinina >1.5',
      'Eclampsia con Glasgow <13, aspiración'
    ],
    whenToTransfer: [
      'Falta de acceso a cesárea emergente',
      'Compromiso multiorgánico que requiere UCI',
      'Centro sin capacidad de manejo neonatal <32 semanas',
      'Eclampsia refractaria a tratamiento'
    ],
    evidenceLevel: 'IA (MINSAL, ACOG, NICE)',
    references: [
      {
        source: 'Guía Perinatal MINSAL - SHE del Embarazo',
        type: 'MINSAL',
        year: 2015
      },
      {
        source: 'ACOG Practice Bulletin 222: Gestational Hypertension and Preeclampsia',
        type: 'ACOG',
        year: 2020
      },
      {
        source: 'Magpie Trial - Lancet 2002: MgSO4 for eclampsia',
        type: 'Paper',
        year: 2002
      },
      {
        source: 'Williams Obstetrics 26th Ed - Hypertensive Disorders',
        type: 'Libro',
        year: 2022
      }
    ]
  },

  {
    id: 'sindrome-hellp',
    title: 'Síndrome HELLP',
    category: 'hipertension',
    priority: 'critica',
    timeWindow: '< 24 horas hasta parto',
    definition: 'Hemólisis microangiopática + Elevación enzimas hepáticas + Plaquetopenia. Variante severa de preeclampsia.',
    clinicalPresentation: [
      'Dolor epigástrico o hipocondrio derecho',
      'Náuseas, vómitos',
      'Malestar general inespecífico',
      'Puede ocurrir SIN HTA severa (15-20%)',
      'Ictericia, hematuria en casos severos'
    ],
    diagnosticCriteria: [
      'Hemólisis: LDH >600 U/L, bilirrubina >1.2 mg/dL, esquistocitos',
      'AST >70 U/L (o >2x límite superior)',
      'Plaquetas <100,000/μL',
      'Clasificación: Clase 1 (<50K), Clase 2 (50-100K), Clase 3 (100-150K)'
    ],
    initialManagement: [
      {
        step: 1,
        action: 'Hospitalización UCI/Intermedio',
        details: 'Monitoreo estricto. Control PA, laboratorio c/6-12h',
        timeframe: 'Inmediato'
      },
      {
        step: 2,
        action: 'Sulfato de Magnesio',
        details: 'Prevención convulsiones. Carga + mantención estándar',
        timeframe: '< 1 hora'
      },
      {
        step: 3,
        action: 'Corticoides si <34 semanas',
        details: 'Betametasona para maduración pulmonar fetal. También mejora plaquetas maternas',
        timeframe: 'Urgente'
      },
      {
        step: 4,
        action: 'Transfusión plaquetas si necesario',
        details: 'Solo si sangrado activo o cirugía inminente con plaquetas <50K',
        timeframe: 'Según indicación'
      },
      {
        step: 5,
        action: 'Interrupción embarazo',
        details: '≥34 sem: parto inmediato. 27-34 sem: estabilizar + corticoides → parto 24-48h',
        timeframe: '24-48 horas'
      }
    ],
    medications: [
      {
        drug: 'Sulfato de Magnesio',
        dose: 'Esquema estándar preeclampsia',
        route: 'IV',
        indication: 'Profilaxis convulsiones'
      },
      {
        drug: 'Betametasona',
        dose: '12 mg IM c/24h x2',
        route: 'IM',
        indication: 'Maduración pulmonar + mejoría plaquetas maternas'
      },
      {
        drug: 'Concentrado Plaquetas',
        dose: '1 U aumenta 5-10K plaquetas',
        route: 'IV',
        indication: 'Solo si <50K + sangrado o cesárea urgente'
      }
    ],
    redFlags: [
      'Plaquetas <50,000 con tendencia descendente',
      'LDH >1000, AST >500 (necrosis hepática)',
      'Hematoma subcapsular hepático (dolor HCD + shock)',
      'CID: fibrinógeno <200, TP/TTPK prolongados',
      'Oliguria, creatinina >1.5, edema pulmonar'
    ],
    whenToTransfer: [
      'Sin UCI disponible',
      'Complicaciones: hematoma hepático, CID, falla renal',
      'Necesidad de plasmaféresis (muy raro)',
      'Centro sin banco de sangre para soporte transfusional'
    ],
    evidenceLevel: 'IB (ACOG, Sibai)',
    references: [
      {
        source: 'Guía MINSAL - HELLP Syndrome',
        type: 'MINSAL',
        year: 2015
      },
      {
        source: 'ACOG Practice Bulletin: HELLP Syndrome',
        type: 'ACOG',
        year: 2020
      },
      {
        source: 'Sibai BM. The HELLP syndrome (hemolysis, elevated liver enzymes, and low platelets): much ado about nothing? Am J Obstet Gynecol 1990',
        type: 'Paper',
        year: 1990
      }
    ]
  },

  // ==================== EMERGENCIAS FETALES ====================
  {
    id: 'perdida-bienestar-fetal',
    title: 'Pérdida de Bienestar Fetal Aguda',
    category: 'fetal',
    priority: 'critica',
    timeWindow: '< 30 minutos',
    definition: 'Alteración aguda del intercambio materno-fetal que produce hipoxia fetal y riesgo de secuelas neurológicas o muerte.',
    clinicalPresentation: [
      'Bradicardia fetal sostenida <110 lpm >10 minutos',
      'Deceleraciones variables severas repetidas',
      'Desaceleraciones tardías recurrentes',
      'Variabilidad ausente con desaceleraciones',
      'Líquido amniótico meconial espeso'
    ],
    diagnosticCriteria: [
      'Categoría III de CTG: bradicardia + ausencia variabilidad O patrón sinusoidal',
      'Categoría II con factores de riesgo: meconio, RCIU, oligoamnios',
      'pH cuero cabelludo <7.20 (si disponible)',
      'Clínica materna: desprendimiento, hipotensión, convulsión'
    ],
    initialManagement: [
      {
        step: 1,
        action: 'Maniobras de reanimación intrauterina',
        details: 'Decúbito lateral izquierdo, O2 mascarilla 10 L/min, suspender oxitocina',
        timeframe: 'Inmediato'
      },
      {
        step: 2,
        action: 'Fluidoterapia',
        details: '500-1000 mL cristaloides rápido (corregir hipotensión materna)',
        timeframe: '< 5 minutos'
      },
      {
        step: 3,
        action: 'Tacto vaginal',
        details: 'Descartar prolapso cordón, dilatación completa. Si prolapso: elevación presentación',
        timeframe: 'Inmediato'
      },
      {
        step: 4,
        action: 'Amnioinfusión si disponible',
        details: '500 mL SF 0.9% por catéter intrauterino. Reduce variables por compresión cordón',
        timeframe: 'Si oligoamnios + variables'
      },
      {
        step: 5,
        action: 'Tocolisis aguda si necesario',
        details: 'Terbutalina 0.25 mg SC si taquisistolia. Gana tiempo para preparar cesárea',
        timeframe: 'Si hiperdinamia'
      },
      {
        step: 6,
        action: 'Decisión vía del parto',
        details: 'Si no recupera en 5-10 min: cesárea emergente. Si dilatación completa: instrumental',
        timeframe: '< 30 minutos decisión-nacimiento'
      }
    ],
    medications: [
      {
        drug: 'Oxígeno materno',
        dose: '10 L/min mascarilla reservorio',
        route: 'Inhalado',
        indication: 'Aumentar PaO2 materna → fetal'
      },
      {
        drug: 'Terbutalina',
        dose: '0.25 mg SC (puede repetir x1)',
        route: 'Subcutánea',
        indication: 'Tocolisis aguda en taquisistolia'
      },
      {
        drug: 'Solución Fisiológica',
        dose: '500-1000 mL rápido',
        route: 'IV',
        indication: 'Expansión volumen, corregir hipotensión'
      }
    ],
    redFlags: [
      'Bradicardia persistente <100 lpm sin recuperación',
      'Prolapso de cordón palpable',
      'Desprendimiento placenta o rotura uterina',
      'Patrón sinusoidal en CTG',
      'Convulsión materna, shock, hipoxia materna'
    ],
    whenToTransfer: [
      'Centro sin capacidad cesárea inmediata (<30 min)',
      'Falta de equipo neonatal reanimación avanzada',
      'Gestación <34 semanas sin UCIN nivel III'
    ],
    evidenceLevel: 'IA (ACOG, FIGO)',
    references: [
      {
        source: 'Guía Perinatal MINSAL - Monitoreo Fetal Intraparto',
        type: 'MINSAL',
        year: 2015
      },
      {
        source: 'ACOG Practice Bulletin 116: Intrapartum Fetal Heart Rate Monitoring',
        type: 'ACOG',
        year: 2010
      },
      {
        source: 'FIGO Consensus Guidelines on Intrapartum Fetal Monitoring',
        type: 'ACOG',
        year: 2015
      }
    ]
  },

  {
    id: 'prolapso-cordon',
    title: 'Prolapso de Cordón Umbilical',
    category: 'fetal',
    priority: 'critica',
    timeWindow: '< 10 minutos',
    definition: 'Descenso del cordón umbilical por delante o al lado de la presentación fetal, con riesgo de compresión y muerte fetal.',
    clinicalPresentation: [
      'Cordón palpable en introito vaginal o visible',
      'Bradicardia fetal súbita severa (<100 lpm)',
      'Deceleraciones variables severas',
      'Factores de riesgo: rotura membranas con presentación alta, situación transversa, polihidramnios'
    ],
    diagnosticCriteria: [
      'Palpación cordón en tacto vaginal',
      'Visualización cordón en introito',
      'Bradicardia fetal aguda post rotura membranas',
      'Ecografía: cordón entre presentación y OCI'
    ],
    initialManagement: [
      {
        step: 1,
        action: 'NO reintroducir cordón',
        details: 'Mantener cordón húmedo con compresa tibia. NO intentar reinsertar',
        timeframe: 'Inmediato'
      },
      {
        step: 2,
        action: 'Elevación de presentación',
        details: 'Mano en vagina empuja cabeza/nalgas hacia arriba. Mantener hasta cesárea',
        timeframe: 'Inmediato'
      },
      {
        step: 3,
        action: 'Posición rodilla-pecho o Trendelenburg',
        details: 'Gravedad ayuda a disminuir compresión. Mantener hasta pabellón',
        timeframe: 'Inmediato'
      },
      {
        step: 4,
        action: 'Llenar vejiga con SF 500 mL',
        details: 'A través de sonda Foley. Eleva presentación. Mantener llena',
        timeframe: '< 5 minutos'
      },
      {
        step: 5,
        action: 'Tocolisis si contracciones',
        details: 'Terbutalina 0.25 mg SC. Reduce compresión por contracciones',
        timeframe: 'Si actividad uterina'
      },
      {
        step: 6,
        action: 'Cesárea STAT',
        details: 'Código azul. Pabellón en menos de 10 minutos. Mantener maniobras hasta extracción',
        timeframe: '< 10 minutos'
      }
    ],
    medications: [
      {
        drug: 'Terbutalina',
        dose: '0.25 mg SC',
        route: 'Subcutánea',
        indication: 'Tocolisis para reducir compresión'
      },
      {
        drug: 'Solución Fisiológica',
        dose: '500 mL en vejiga',
        route: 'Sonda Foley',
        indication: 'Elevación presentación por llenado vesical'
      }
    ],
    redFlags: [
      'Cordón pulsátil pero bradicardia <60 lpm',
      'Cordón no pulsátil (muerte fetal)',
      'Imposibilidad elevar presentación',
      'Demora >15 minutos hasta cesárea'
    ],
    whenToTransfer: [
      'NUNCA. Es cesárea inmediata en el lugar',
      'Si definitivamente no hay pabellón: mantener maniobras durante traslado',
      'Alertar centro receptor para que tenga pabellón listo'
    ],
    evidenceLevel: 'III (Expert Opinion, Case Series)',
    references: [
      {
        source: 'RCOG Green-top Guideline 50: Umbilical Cord Prolapse',
        type: 'RCOG',
        year: 2014
      },
      {
        source: 'Williams Obstetrics 26th Ed - Obstetric Emergencies',
        type: 'Libro',
        year: 2022
      }
    ]
  },

  // ==================== PARTO ====================
  {
    id: 'distocia-hombros',
    title: 'Distocia de Hombros',
    category: 'parto',
    priority: 'critica',
    timeWindow: '< 5 minutos',
    definition: 'Impactación del hombro anterior contra sínfisis púbica tras expulsión de la cabeza, requiriendo maniobras adicionales para completar el parto.',
    clinicalPresentation: [
      'Signo de la tortuga: cabeza retrae contra periné',
      'Falla descenso hombros con tracción habitual',
      'Imposibilidad rotación externa cabeza',
      'Feto macrosómico, madre diabética (factores riesgo)'
    ],
    diagnosticCriteria: [
      'Diagnóstico clínico: cabeza expulsada pero hombros no descienden',
      'Tiempo cabeza-hombros >60 segundos',
      'Necesidad de maniobras especiales'
    ],
    initialManagement: [
      {
        step: 1,
        action: 'Pedir AYUDA inmediata',
        details: 'Código: "Distocia de Hombros". Llamar obstetra, matrona adicional, pediatra, anestesia',
        timeframe: 'Inmediato'
      },
      {
        step: 2,
        action: 'Maniobra McRoberts',
        details: 'Hiperflexión muslos sobre abdomen. Reduce ángulo lumbosacro. Éxito 90%',
        timeframe: '< 30 segundos'
      },
      {
        step: 3,
        action: 'Presión suprapúbica',
        details: 'Ayudante presiona firme sobre hombro anterior, lateral a línea media. NO fondo uterino',
        timeframe: 'Simultáneo con McRoberts'
      },
      {
        step: 4,
        action: 'Episiotomía si necesario',
        details: 'NO resuelve distocia pero da espacio para maniobras internas',
        timeframe: 'Si aún impactado'
      },
      {
        step: 5,
        action: 'Maniobras rotacionales: Woods/Rubin',
        details: 'Woods: rotar hombros 180°. Rubin: empujar hombro posterior hacia anterior',
        timeframe: '30-60 segundos cada una'
      },
      {
        step: 6,
        action: 'Extracción hombro/brazo posterior',
        details: 'Seguir hueco sacro, tomar antebrazo, barrer sobre tórax. Libera hombro',
        timeframe: 'Si fallan previas'
      },
      {
        step: 7,
        action: 'Maniobra Gaskin (4 apoyos)',
        details: 'Poner madre en 4 apoyos (manos-rodillas). Cambia diámetros pélvicos',
        timeframe: 'Si paciente puede moverse'
      },
      {
        step: 8,
        action: 'Maniobras de rescate',
        details: 'Zavanelli (reintroducir cabeza) + cesárea. Sinfisiotomía. Fractura clavícula intencional',
        timeframe: 'Solo si falla todo'
      }
    ],
    medications: [
      {
        drug: 'Terbutalina',
        dose: '0.25 mg SC',
        route: 'Subcutánea',
        indication: 'Relajación uterina si necesario (raro)'
      }
    ],
    redFlags: [
      'Tiempo >5 minutos sin resolver',
      'Bradicardia fetal severa sostenida',
      'Imposibilidad realizar maniobras internas',
      'Lesión plexo braquial evidente al nacer'
    ],
    whenToTransfer: [
      'NO SE TRASLADA durante emergencia activa',
      'Post-evento: si lesión materna severa (rotura uterina, desgarro III-IV)',
      'Si RN con lesión neurológica requiere UCIN'
    ],
    evidenceLevel: 'III (Maniobras basadas en experiencia, no RCTs)',
    references: [
      {
        source: 'ACOG Practice Bulletin 178: Shoulder Dystocia',
        type: 'ACOG',
        year: 2017
      },
      {
        source: 'RCOG Green-top Guideline 42: Shoulder Dystocia',
        type: 'RCOG',
        year: 2012
      },
      {
        source: 'Williams Obstetrics - Shoulder Dystocia Management',
        type: 'Libro',
        year: 2022
      }
    ]
  },

  {
    id: 'retencion-placenta',
    title: 'Retención de Placenta',
    category: 'parto',
    priority: 'alta',
    timeWindow: '< 30 minutos',
    definition: 'Falla expulsión placenta >30 minutos postparto o necesidad de extracción manual por sangrado.',
    clinicalPresentation: [
      'Placenta no expulsada >30 minutos',
      'Sangrado abundante con placenta retenida',
      'Cordón avulsionado sin placenta',
      'Acretismo placentario sospechado'
    ],
    diagnosticCriteria: [
      'Tiempo >30 minutos sin alumbramiento espontáneo',
      'Sangrado >500 mL con placenta retenida',
      'Ecografía: masa intrauterina >15 mm',
      'Imposibilidad tracción controlada del cordón'
    ],
    initialManagement: [
      {
        step: 1,
        action: 'Revisar contraindicaciones extracción',
        details: 'Si sospecha acretismo: NO tracción forzada. Considerar histerectomía programada',
        timeframe: 'Antes de proceder'
      },
      {
        step: 2,
        action: 'Analgesia adecuada',
        details: 'Pudendo, peridural, o sedación IV (ketamina). Relajación esencial',
        timeframe: '< 10 minutos'
      },
      {
        step: 3,
        action: 'Tracción controlada cordón',
        details: 'Mano en fondo uterino (contrapresión), otra tracciona cordón suave. Maniobra Brandt-Andrews',
        timeframe: 'Primero intentar'
      },
      {
        step: 4,
        action: 'Extracción manual si falla',
        details: 'Mano busca borde placentario, despega con borde cubital, extrae completa',
        timeframe: '< 30 minutos'
      },
      {
        step: 5,
        action: 'Revisión cavidad',
        details: 'Palpar paredes, fondo, anexos. Confirmar no restos, no rotura',
        timeframe: 'Inmediato post extracción'
      },
      {
        step: 6,
        action: 'Oxitocina post-extracción',
        details: '10-40 UI en infusión. Prevenir atonía post-manipulación',
        timeframe: 'Durante y después'
      }
    ],
    medications: [
      {
        drug: 'Oxitocina',
        dose: '10 UI IM O 10-40 UI en infusión',
        route: 'IM o IV',
        indication: 'Contraer útero, facilitar desprendimiento'
      },
      {
        drug: 'Misoprostol',
        dose: '600 mcg sublingual',
        route: 'Sublingual',
        indication: 'Si falla oxitocina. Aumenta contracciones'
      },
      {
        drug: 'Ketamina',
        dose: '0.5-1 mg/kg IV',
        route: 'IV',
        indication: 'Sedoanalgesia para extracción manual'
      },
      {
        drug: 'Nitroglicerina',
        dose: '50-100 mcg IV (bajo supervisión anestesia)',
        route: 'IV',
        indication: 'Relajación uterina en placenta encarcelada. Usar con precaución'
      }
    ],
    redFlags: [
      'Sangrado masivo durante extracción (>1000 mL)',
      'Imposibilidad encontrar plano de clivaje (acreta)',
      'Sospecha inversión uterina durante maniobra',
      'Perforación uterina'
    ],
    whenToTransfer: [
      'Acretismo confirmado que requiere histerectomía',
      'Sangrado no controlado post-extracción',
      'Necesidad de radiología intervencionista',
      'Centro sin banco de sangre'
    ],
    evidenceLevel: 'III (Based on case series, experience)',
    references: [
      {
        source: 'WHO Recommendations for Retained Placenta',
        type: 'WHO',
        year: 2012
      },
      {
        source: 'RCOG: Management of Third Stage of Labour',
        type: 'RCOG',
        year: 2018
      },
      {
        source: 'Guía Perinatal MINSAL - Alumbramiento',
        type: 'MINSAL',
        year: 2015
      }
    ]
  },

  // ==================== SEPSIS ====================
  {
    id: 'corioamnionitis',
    title: 'Corioamnionitis Clínica',
    category: 'sepsis',
    priority: 'alta',
    timeWindow: '< 1 hora hasta antibióticos',
    definition: 'Infección de membranas corioamnióticas y líquido amniótico, con inflamación sistémica materna.',
    clinicalPresentation: [
      'Fiebre materna ≥38°C intraparto',
      'Taquicardia fetal sostenida (>160 lpm)',
      'Leucocitosis materna >15,000 (sin corticoides)',
      'Líquido amniótico purulento o fétido',
      'Sensibilidad uterina a la palpación'
    ],
    diagnosticCriteria: [
      'Fiebre + 2 criterios: taquicardia materna/fetal, leucocitosis, LA purulento, dolor uterino',
      'PCR elevada, procalcitonina >0.5',
      'Cultivo LA (no esperar resultado para tratar)'
    ],
    initialManagement: [
      {
        step: 1,
        action: 'Antibióticos de amplio espectro',
        details: 'Ampicilina 2 g IV c/6h + Gentamicina 5 mg/kg/día. Iniciar ANTES del parto',
        timeframe: '< 1 hora del diagnóstico'
      },
      {
        step: 2,
        action: 'Antipiréticos',
        details: 'Paracetamol 1 g IV/VO. Controlar fiebre reduce taquicardia fetal',
        timeframe: 'Simultáneo'
      },
      {
        step: 3,
        action: 'Interrupción del embarazo',
        details: 'Continuar trabajo parto si ya iniciado. NO indicación absoluta cesárea',
        timeframe: 'Lo antes posible'
      },
      {
        step: 4,
        action: 'Si cesárea: agregar Clindamicina',
        details: 'Clindamicina 900 mg IV c/8h. Mejor cobertura anaerobios poscesárea',
        timeframe: 'Intraoperatorio'
      },
      {
        step: 5,
        action: 'Mantener antibióticos posparto',
        details: 'Hasta 24-48h afebril. Total 48-72h si parto vaginal, 5-7 días si cesárea',
        timeframe: 'Posparto'
      },
      {
        step: 6,
        action: 'Notificar neonatología',
        details: 'RN requiere hemocultivos y antibióticos profilácticos (ampicilina + gentamicina)',
        timeframe: 'Inmediato'
      }
    ],
    medications: [
      {
        drug: 'Ampicilina',
        dose: '2 g IV c/6h',
        route: 'IV',
        indication: 'Cobertura Estreptococo grupo B, E. coli'
      },
      {
        drug: 'Gentamicina',
        dose: '5 mg/kg/día (dosis única diaria)',
        route: 'IV',
        indication: 'Gram negativos. Ajustar por función renal'
      },
      {
        drug: 'Clindamicina',
        dose: '900 mg IV c/8h',
        route: 'IV',
        indication: 'Anaerobios. Agregar si cesárea o alergia penicilina'
      },
      {
        drug: 'Paracetamol',
        dose: '1 g IV c/6h',
        route: 'IV u oral',
        indication: 'Antipirético'
      }
    ],
    redFlags: [
      'Shock séptico: hipotensión, oliguria, lactato >2',
      'Fallo respuesta a antibióticos en 24h',
      'Absceso pélvico posparto',
      'Coagulación intravascular diseminada',
      'Sepsis neonatal precoz'
    ],
    whenToTransfer: [
      'Shock séptico refractario que requiere UCI',
      'Necesidad de RN de manejo en UCIN nivel III',
      'Complicaciones: trombosis séptica, absceso profundo'
    ],
    evidenceLevel: 'IA (ACOG, CDC)',
    references: [
      {
        source: 'ACOG Committee Opinion 712: Intrapartum Management of Intraamniotic Infection',
        type: 'ACOG',
        year: 2017
      },
      {
        source: 'Guía Perinatal MINSAL - Infecciones en Embarazo',
        type: 'MINSAL',
        year: 2015
      },
      {
        source: 'CDC: Prevention of Perinatal Group B Streptococcal Disease',
        type: 'ACOG',
        year: 2019
      }
    ]
  }
];

// Helper functions
export function getProtocolsByCategory(category: string): UrgencyProtocol[] {
  return URGENCY_PROTOCOLS.filter(p => p.category === category);
}

export function getProtocolById(id: string): UrgencyProtocol | undefined {
  return URGENCY_PROTOCOLS.find(p => p.id === id);
}

export function searchProtocols(query: string): UrgencyProtocol[] {
  const lowerQuery = query.toLowerCase();
  return URGENCY_PROTOCOLS.filter(protocol =>
    protocol.title.toLowerCase().includes(lowerQuery) ||
    protocol.definition.toLowerCase().includes(lowerQuery) ||
    protocol.clinicalPresentation.some(s => s.toLowerCase().includes(lowerQuery))
  );
}

export function getProtocolsByPriority(priority: 'critica' | 'alta' | 'moderada'): UrgencyProtocol[] {
  return URGENCY_PROTOCOLS.filter(p => p.priority === priority);
}
