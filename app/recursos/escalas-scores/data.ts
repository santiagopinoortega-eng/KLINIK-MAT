// Escalas y Scores Clínicos - Obstetricia
// Referencias: MINSAL Chile, Williams Obstetrics 26th Ed, ACOG, RCOG

export interface ScaleParameter {
  name: string;
  values: {
    score: number;
    description: string;
    criteria?: string;
  }[];
}

export interface ScoreInterpretation {
  range: string;
  classification: string;
  clinicalSignificance: string;
  recommendation: string;
}

export interface ClinicalScale {
  id: string;
  name: string;
  category: string;
  description: string;
  indication: string;
  timingApplication: string;
  parameters: ScaleParameter[];
  totalScoreRange: {
    min: number;
    max: number;
  };
  interpretation: ScoreInterpretation[];
  clinicalPearls: string[];
  limitations: string[];
  references: {
    type: 'MINSAL' | 'ACOG' | 'RCOG' | 'WHO' | 'Libro' | 'Paper';
    citation: string;
    year: number;
    url?: string;
  }[];
}

export interface ScaleCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const SCALE_CATEGORIES: ScaleCategory[] = [
  {
    id: 'neonatal',
    name: 'Evaluación Neonatal',
    icon: '👶',
    color: 'from-pink-500 to-rose-500',
    description: 'Scores para evaluación del recién nacido'
  },
  {
    id: 'cervical',
    name: 'Evaluación Cervical',
    icon: '🔍',
    color: 'from-purple-500 to-indigo-500',
    description: 'Escalas de maduración cervical e inducción'
  },
  {
    id: 'fetal',
    name: 'Bienestar Fetal',
    icon: '💓',
    color: 'from-blue-500 to-cyan-500',
    description: 'Evaluación del estado fetal anteparto e intraparto'
  },
  {
    id: 'materna',
    name: 'Evaluación Materna',
    icon: '👩‍⚕️',
    color: 'from-green-500 to-emerald-500',
    description: 'Scores de riesgo y clasificación materna'
  },
  {
    id: 'respiratoria',
    name: 'Dificultad Respiratoria',
    icon: '🫁',
    color: 'from-orange-500 to-red-500',
    description: 'Evaluación de distress respiratorio neonatal'
  }
];

export const CLINICAL_SCALES: ClinicalScale[] = [
  // ===== ESCALAS NEONATALES =====
  {
    id: 'apgar',
    name: 'Score de Apgar',
    category: 'neonatal',
    description: 'Evaluación rápida de la condición del recién nacido inmediatamente después del nacimiento.',
    indication: 'Todos los recién nacidos. Evaluar vitalidad y necesidad de reanimación neonatal.',
    timingApplication: 'Al minuto 1, 5 y 10 de vida (si Apgar <7 a los 5 minutos)',
    parameters: [
      {
        name: 'Frecuencia Cardíaca',
        values: [
          { score: 0, description: 'Ausente' },
          { score: 1, description: '< 100 lpm' },
          { score: 2, description: '≥ 100 lpm' }
        ]
      },
      {
        name: 'Esfuerzo Respiratorio',
        values: [
          { score: 0, description: 'Ausente' },
          { score: 1, description: 'Irregular, débil, llanto débil' },
          { score: 2, description: 'Bueno, llanto vigoroso' }
        ]
      },
      {
        name: 'Tono Muscular',
        values: [
          { score: 0, description: 'Flácido' },
          { score: 1, description: 'Flexión leve de extremidades' },
          { score: 2, description: 'Movimientos activos, flexión completa' }
        ]
      },
      {
        name: 'Irritabilidad Refleja',
        values: [
          { score: 0, description: 'Sin respuesta' },
          { score: 1, description: 'Mueca o llanto débil' },
          { score: 2, description: 'Llanto vigoroso, estornudo, tos' }
        ]
      },
      {
        name: 'Color',
        values: [
          { score: 0, description: 'Cianosis central, palidez' },
          { score: 1, description: 'Rosado con acrocianosis' },
          { score: 2, description: 'Completamente rosado' }
        ]
      }
    ],
    totalScoreRange: { min: 0, max: 10 },
    interpretation: [
      {
        range: '7-10',
        classification: 'Normal',
        clinicalSignificance: 'Recién nacido vigoroso, adaptación neonatal adecuada.',
        recommendation: 'Contacto piel a piel inmediato. Cuidados de rutina. No requiere reanimación.'
      },
      {
        range: '4-6',
        classification: 'Depresión Moderada',
        clinicalSignificance: 'Dificultad en la transición. Requiere estimulación y posible soporte respiratorio.',
        recommendation: 'Secar, estimular, reposicionar. Considerar VPP con bolsa-máscara si no mejora. Llamar equipo neonatal.'
      },
      {
        range: '0-3',
        classification: 'Depresión Severa',
        clinicalSignificance: 'Asfixia grave. Alto riesgo de daño neurológico si no se interviene.',
        recommendation: 'Reanimación neonatal avanzada INMEDIATA. VPP, intubación si necesario. Código azul neonatal. Documentar minuto a minuto.'
      }
    ],
    clinicalPearls: [
      'Score al minuto 1: Evalúa necesidad de reanimación inmediata',
      'Score a los 5 minutos: Mejor predictor de resultado neurológico',
      'Apgar <7 a los 5 min: Continuar score cada 5 min hasta 20 min',
      'NO retrasar reanimación para calcular Apgar',
      'Apgar bajo NO es sinónimo de asfixia perinatal (requiere acidosis + disfunción multiorgánica)',
      'Factores que afectan: prematurez, medicación materna (MgSO4, opioides), anomalías congénitas'
    ],
    limitations: [
      'Subjetivo en parámetros como color e irritabilidad refleja',
      'Prematuros tienen scores más bajos por inmadurez fisiológica (no patología)',
      'No predice parálisis cerebral de forma individual',
      'Medicación materna puede deprimir score sin hipoxia fetal',
      'Útil como descriptor, NO como diagnóstico único de asfixia'
    ],
    references: [
      {
        type: 'Paper',
        citation: 'Apgar V. A proposal for a new method of evaluation of the newborn infant. Curr Res Anesth Analg. 1953;32(4):260-267.',
        year: 1953,
        url: 'https://pubmed.ncbi.nlm.nih.gov/13083014/'
      },
      {
        type: 'ACOG',
        citation: 'ACOG Committee Opinion No. 644: The Apgar Score. Obstet Gynecol. 2015;126(4):e52-e55.',
        year: 2015
      },
      {
        type: 'MINSAL',
        citation: 'Guía Perinatal 2015. Ministerio de Salud Chile. Capítulo Reanimación Neonatal.',
        year: 2015
      },
      {
        type: 'Libro',
        citation: 'Williams Obstetrics, 26th Edition. Chapter 32: The Newborn.',
        year: 2022
      }
    ]
  },
  {
    id: 'ballard',
    name: 'Escala de Ballard (New Ballard Score)',
    category: 'neonatal',
    description: 'Evaluación de la edad gestacional del recién nacido mediante examen físico y neuromuscular.',
    indication: 'RN con edad gestacional incierta, discordancia entre FUM y ecografía, prematuros, RCIU.',
    timingApplication: 'Primeras 12-24 horas de vida. Puede aplicarse hasta las 96 horas en prematuros.',
    parameters: [
      {
        name: 'Criterios Neuromusculares',
        values: [
          { score: -1, description: 'Inmadurez extrema', criteria: 'Postura: extensión completa. Ángulo poplíteo >180°. Signo bufanda completo. Talón-oreja sin resistencia.' },
          { score: 0, description: '20-22 semanas', criteria: 'Mínima flexión. Ángulo poplíteo 160-180°.' },
          { score: 1, description: '24 semanas', criteria: 'Flexión ligera EEII. Ángulo poplíteo 140-160°.' },
          { score: 2, description: '26 semanas', criteria: 'Flexión moderada. Ángulo poplíteo 120-140°.' },
          { score: 3, description: '28-30 semanas', criteria: 'Flexión de 4 extremidades. Ángulo poplíteo 100-120°.' },
          { score: 4, description: '32-36 semanas', criteria: 'Flexión completa EEII, parcial EESS. Ángulo poplíteo 90-100°.' },
          { score: 5, description: '≥38 semanas', criteria: 'Flexión completa de 4 extremidades. Ángulo poplíteo <90°.' }
        ]
      },
      {
        name: 'Criterios Físicos',
        values: [
          { score: -1, description: 'Piel', criteria: 'Pegajosa, friable, transparente (muy prematuro)' },
          { score: 0, description: 'Piel', criteria: 'Gelatinosa, roja, transparente' },
          { score: 1, description: 'Piel', criteria: 'Lisa, rosada, venas visibles' },
          { score: 2, description: 'Piel', criteria: 'Descamación superficial y/o erupción, pocas venas' },
          { score: 3, description: 'Piel', criteria: 'Grietas, palidez, raras venas' },
          { score: 4, description: 'Piel', criteria: 'Apergaminada, profundas grietas, sin vasos' },
          { score: 5, description: 'Piel', criteria: 'Cuarteada, arrugada' }
        ]
      },
      {
        name: 'Lanugo',
        values: [
          { score: -1, description: 'Ausente (muy prematuro)' },
          { score: 0, description: 'Ninguno' },
          { score: 1, description: 'Abundante' },
          { score: 2, description: 'Adelgazamiento' },
          { score: 3, description: 'Áreas calvas' },
          { score: 4, description: 'Casi ausente' }
        ]
      },
      {
        name: 'Superficie Plantar',
        values: [
          { score: -2, description: 'Talón-punta <40 mm: -2' },
          { score: -1, description: 'Talón-punta 40-50 mm: -1' },
          { score: 0, description: '>50 mm sin pliegues' },
          { score: 1, description: 'Marcas rojas tenues' },
          { score: 2, description: 'Pliegues anteriores solamente' },
          { score: 3, description: 'Pliegues 2/3 anteriores' },
          { score: 4, description: 'Pliegues en toda la planta' }
        ]
      },
      {
        name: 'Mama',
        values: [
          { score: -1, description: 'Apenas perceptible' },
          { score: 0, description: 'Imperceptible' },
          { score: 1, description: 'Apenas perceptible' },
          { score: 2, description: 'Areola plana, sin botón <1-2 mm' },
          { score: 3, description: 'Areola punteada, botón 3-4 mm' },
          { score: 4, description: 'Areola elevada, botón 5-10 mm' }
        ]
      },
      {
        name: 'Ojo/Oreja',
        values: [
          { score: -1, description: 'Párpados fusionados (muy prematuro)' },
          { score: 0, description: 'Párpados cerrados. Oreja plana, sin curvatura' },
          { score: 1, description: 'Párpados abiertos. Pabellón se curva ligeramente' },
          { score: 2, description: 'Curvatura oreja superior bien definida' },
          { score: 3, description: 'Cartílago bien formado, retroceso inmediato' },
          { score: 4, description: 'Cartílago grueso, oreja firme' }
        ]
      },
      {
        name: 'Genitales Masculinos',
        values: [
          { score: -1, description: 'Escroto vacío, sin rugosidades' },
          { score: 0, description: 'Escroto liso, testículos no descendidos' },
          { score: 1, description: 'Testículos en descenso, pocas rugosidades' },
          { score: 2, description: 'Testículos descendidos, buenas rugosidades' },
          { score: 3, description: 'Testículos en bolsas, rugosidades extensas' },
          { score: 4, description: 'Testículos péndulos, rugosidades profundas' }
        ]
      },
      {
        name: 'Genitales Femeninos',
        values: [
          { score: -1, description: 'Clítoris prominente, labios muy separados' },
          { score: 0, description: 'Clítoris prominente, labios menores pequeños' },
          { score: 1, description: 'Clítoris prominente, labios menores aumentando' },
          { score: 2, description: 'Labios mayores y menores igualmente prominentes' },
          { score: 3, description: 'Labios mayores grandes, menores pequeños' },
          { score: 4, description: 'Labios mayores cubren clítoris y menores' }
        ]
      }
    ],
    totalScoreRange: { min: -10, max: 50 },
    interpretation: [
      {
        range: '-10 a 0',
        classification: '20 semanas',
        clinicalSignificance: 'Extremadamente prematuro. Límite de viabilidad. Alto riesgo de mortalidad y secuelas.',
        recommendation: 'UCI neonatal nivel III. Surfactante profiláctico. Manejo multidisciplinario. Discutir pronóstico con familia.'
      },
      {
        range: '5-10',
        classification: '22-24 semanas',
        clinicalSignificance: 'Muy prematuro. Requiere cuidados intensivos especializados.',
        recommendation: 'Esteroides antenatales esenciales. UCI neonatal. Soporte respiratorio prolongado esperado.'
      },
      {
        range: '15-20',
        classification: '28-30 semanas',
        clinicalSignificance: 'Prematuro moderado. Riesgo de SDR, apneas, retinopatía.',
        recommendation: 'UCI neonatal. Surfactante si SDR. Monitoreo apneas. Screening retinopatía.'
      },
      {
        range: '25-30',
        classification: '32-34 semanas',
        clinicalSignificance: 'Prematuro tardío. Riesgo de hipoglicemia, ictericia, dificultad alimentación.',
        recommendation: 'Observación estrecha. Screening hipoglicemia. Fototerapia precoz si ictericia.'
      },
      {
        range: '35-40',
        classification: '36-38 semanas',
        clinicalSignificance: 'Término precoz. Generalmente adapta bien.',
        recommendation: 'Cuidados de rutina. Vigilar alimentación y termorregulación.'
      },
      {
        range: '40-50',
        classification: '≥40 semanas',
        clinicalSignificance: 'Término a postérmino. Mayor riesgo si >42 semanas (síndrome postmadurez).',
        recommendation: 'Si >42 sem: buscar signos postmadurez (piel descamada, uñas largas, pérdida tejido subcutáneo). Vigilar hipoglicemia.'
      }
    ],
    clinicalPearls: [
      'Correlación: Score total = (Score × 2) + 20 = Edad gestacional en semanas',
      'Ejemplo: Score 25 → (25 × 2) + 20 = 70 semanas... ERROR. Usar tabla de correlación directa',
      'Más preciso: Score 25 ≈ 32-34 semanas',
      'Criterios neuromusculares más confiables en primeras 24h',
      'Asfixia perinatal puede alterar criterios neuromusculares (usar solo físicos)',
      'En RN enfermo crítico, diferir examen hasta estabilización',
      'Precisión ±2 semanas en manos expertas'
    ],
    limitations: [
      'Menor precisión en <26 semanas y >44 semanas',
      'Asfixia, sedación, enfermedad neurológica alteran criterios neuromusculares',
      'RCIU simétrico: edad gestacional correcta, pero aspecto "prematuro"',
      'Edema, fotoferapia alteran evaluación de piel',
      'Requiere experiencia del examinador (variabilidad interobservador)',
      'NO reemplaza la mejor estimación por FUM confiable + eco precoz'
    ],
    references: [
      {
        type: 'Paper',
        citation: 'Ballard JL, Khoury JC, Wedig K, et al. New Ballard Score, expanded to include extremely premature infants. J Pediatr. 1991;119(3):417-423.',
        year: 1991,
        url: 'https://pubmed.ncbi.nlm.nih.gov/1880657/'
      },
      {
        type: 'MINSAL',
        citation: 'Guía Perinatal 2015. MINSAL Chile. Evaluación de Edad Gestacional Neonatal.',
        year: 2015
      },
      {
        type: 'Libro',
        citation: 'Williams Obstetrics, 26th Edition. Chapter 32: Assessment of Gestational Age.',
        year: 2022
      }
    ]
  },
  {
    id: 'silverman-andersen',
    name: 'Test de Silverman-Andersen',
    category: 'respiratoria',
    description: 'Evaluación de la intensidad de dificultad respiratoria en el recién nacido.',
    indication: 'RN con signos de distress respiratorio (SDR, taquipnea transitoria, neumonía, aspiración).',
    timingApplication: 'Evaluación seriada cada 2-4 horas según severidad. Desde el nacimiento si hay dificultad respiratoria.',
    parameters: [
      {
        name: 'Movimientos Toracoabdominales',
        values: [
          { score: 0, description: 'Rítmicos y regulares', criteria: 'Tórax y abdomen se elevan simultáneamente' },
          { score: 1, description: 'Asincronía leve', criteria: 'Retraso en la elevación torácica o abdominal' },
          { score: 2, description: 'Balanceo (seesaw)', criteria: 'Tórax se deprime cuando abdomen se eleva (respiración paradójica)' }
        ]
      },
      {
        name: 'Tiraje Intercostal',
        values: [
          { score: 0, description: 'Ausente', criteria: 'No se observa depresión de espacios intercostales' },
          { score: 1, description: 'Leve', criteria: 'Discreta depresión intercostal con la inspiración' },
          { score: 2, description: 'Marcado', criteria: 'Depresión intercostal profunda y evidente' }
        ]
      },
      {
        name: 'Retracción Xifoidea',
        values: [
          { score: 0, description: 'Ausente', criteria: 'No depresión del apéndice xifoides' },
          { score: 1, description: 'Leve', criteria: 'Discreta depresión xifoidea con inspiración' },
          { score: 2, description: 'Marcada', criteria: 'Depresión xifoidea profunda y sostenida' }
        ]
      },
      {
        name: 'Aleteo Nasal',
        values: [
          { score: 0, description: 'Ausente', criteria: 'No dilatación de las fosas nasales' },
          { score: 1, description: 'Leve', criteria: 'Discreta dilatación nasal con la inspiración' },
          { score: 2, description: 'Marcado', criteria: 'Aleteo nasal evidente y sostenido' }
        ]
      },
      {
        name: 'Quejido Espiratorio',
        values: [
          { score: 0, description: 'Ausente', criteria: 'Respiración silenciosa' },
          { score: 1, description: 'Audible con estetoscopio', criteria: 'Quejido solo con auscultación' },
          { score: 2, description: 'Audible sin estetoscopio', criteria: 'Quejido audible a distancia (cierre glótico)' }
        ]
      }
    ],
    totalScoreRange: { min: 0, max: 10 },
    interpretation: [
      {
        range: '0',
        classification: 'Sin Dificultad Respiratoria',
        clinicalSignificance: 'Patrón respiratorio normal. No requiere intervención.',
        recommendation: 'Cuidados de rutina. Vigilancia habitual.'
      },
      {
        range: '1-3',
        classification: 'Dificultad Respiratoria Leve',
        clinicalSignificance: 'Distress respiratorio leve. Puede corresponder a taquipnea transitoria o adaptación.',
        recommendation: 'Monitoreo estrecho. Oximetría de pulso. Considerar Rx tórax. Mantener normotermia. Puede requerir O2 suplementario.'
      },
      {
        range: '4-6',
        classification: 'Dificultad Respiratoria Moderada',
        clinicalSignificance: 'Distress significativo. Probable SDR, neumonía o aspiración meconial.',
        recommendation: 'UCI neonatal. Gases arteriales. Rx tórax. O2 suplementario (hood, CPAP). Considerar antibióticos empíricos. Evaluar necesidad de surfactante.'
      },
      {
        range: '7-10',
        classification: 'Dificultad Respiratoria Severa',
        clinicalSignificance: 'Insuficiencia respiratoria grave. Alto riesgo de falla ventilatoria.',
        recommendation: 'URGENCIA. UCI neonatal. Considerar intubación + ventilación mecánica. Surfactante si SDR. Antibióticos. Hemocultivos. Descartar neumotórax, cardiopatía congénita.'
      }
    ],
    clinicalPearls: [
      'Quejido espiratorio = cierre glótico para mantener presión positiva espiratoria (auto-PEEP)',
      'Evaluar en reposo, sin estímulos (llanto aumenta score artificialmente)',
      'Score aumenta con el esfuerzo (alimentación, manipulación)',
      'Reevaluar cada 2-4h para monitorear evolución',
      'Score en aumento: considerar deterioro → escalar soporte',
      'Score en descenso: buena respuesta al tratamiento',
      'Siempre correlacionar con saturación de O2 y FR'
    ],
    limitations: [
      'No específico de una patología (múltiples causas de SDR)',
      'No incluye frecuencia respiratoria ni saturación de O2',
      'Prematuros tienen menor compliance torácica (scores más altos sin SDR severo)',
      'Subjetivo, requiere experiencia del evaluador',
      'Cardiopatías congénitas pueden dar scores altos sin patología pulmonar',
      'Útil como screening, pero requiere complementar con Rx tórax y gases arteriales'
    ],
    references: [
      {
        type: 'Paper',
        citation: 'Silverman WA, Andersen DH. A controlled clinical trial of effects of water mist on obstructive respiratory signs, death rate and necropsy findings among premature infants. Pediatrics. 1956;17(1):1-10.',
        year: 1956
      },
      {
        type: 'MINSAL',
        citation: 'Guía Perinatal 2015. MINSAL Chile. Evaluación Respiratoria del Recién Nacido.',
        year: 2015
      },
      {
        type: 'Libro',
        citation: 'Cloherty and Stark\'s Manual of Neonatal Care, 8th Edition. Chapter on Respiratory Disorders.',
        year: 2017
      }
    ]
  },

  // ===== ESCALAS DE EVALUACIÓN CERVICAL =====
  {
    id: 'bishop',
    name: 'Score de Bishop',
    category: 'cervical',
    description: 'Evaluación de la maduración cervical y predicción del éxito de la inducción del trabajo de parto.',
    indication: 'Antes de inducción del trabajo de parto. Decidir método de maduración cervical.',
    timingApplication: 'Pre-inducción. Reevaluar cada 12-24h si se usa maduración cervical.',
    parameters: [
      {
        name: 'Dilatación Cervical',
        values: [
          { score: 0, description: 'Cerrado (0 cm)' },
          { score: 1, description: '1-2 cm' },
          { score: 2, description: '3-4 cm' },
          { score: 3, description: '≥5 cm' }
        ]
      },
      {
        name: 'Borramiento Cervical',
        values: [
          { score: 0, description: '0-30%' },
          { score: 1, description: '40-50%' },
          { score: 2, description: '60-70%' },
          { score: 3, description: '≥80%' }
        ]
      },
      {
        name: 'Consistencia Cervical',
        values: [
          { score: 0, description: 'Firme (como punta de nariz)' },
          { score: 1, description: 'Media' },
          { score: 2, description: 'Blanda (como labios)' }
        ]
      },
      {
        name: 'Posición Cervical',
        values: [
          { score: 0, description: 'Posterior' },
          { score: 1, description: 'Media' },
          { score: 2, description: 'Anterior' }
        ]
      },
      {
        name: 'Altura de la Presentación',
        values: [
          { score: 0, description: '-3 (móvil sobre estrecho superior)' },
          { score: 1, description: '-2' },
          { score: 2, description: '-1 a 0' },
          { score: 3, description: '+1 a +2 (insinuada/encajada)' }
        ]
      }
    ],
    totalScoreRange: { min: 0, max: 13 },
    interpretation: [
      {
        range: '0-4',
        classification: 'Cérvix Desfavorable',
        clinicalSignificance: 'Baja probabilidad de inducción exitosa. Alta tasa de cesárea si se induce directamente.',
        recommendation: 'Maduración cervical REQUERIDA antes de oxitocina. Opciones: Misoprostol 25 mcg vaginal c/4-6h, Dinoprostona gel/óvulo, Balón de Foley 30-60 mL por 12-24h. Reevaluar Bishop post-maduración.'
      },
      {
        range: '5-7',
        classification: 'Cérvix Intermedio',
        clinicalSignificance: 'Probabilidad moderada de éxito con inducción. Considerar maduración según urgencia.',
        recommendation: 'Si urgencia alta (preeclampsia, RCIU): inducir con oxitocina + rotura artificial membranas. Si no urgente: considerar maduración cervical para mejorar Bishop.'
      },
      {
        range: '≥8',
        classification: 'Cérvix Favorable',
        clinicalSignificance: 'Alta probabilidad de parto vaginal exitoso. Similar tasa de éxito que trabajo de parto espontáneo.',
        recommendation: 'Inducción directa con oxitocina. Rotura artificial de membranas si membranas íntegras. No requiere maduración cervical previa.'
      }
    ],
    clinicalPearls: [
      'Bishop ≥8: tasa de parto vaginal ~90% (similar a trabajo de parto espontáneo)',
      'Bishop <5: tasa de cesárea por inducción fallida hasta 20-30%',
      'Multíparas: Bishop 5-6 puede ser suficiente (cérvix más "competente")',
      'Cada punto de Bishop aumenta probabilidad de parto vaginal en ~10%',
      'Borramiento y dilatación son los parámetros más predictivos',
      'En rotura prematura de membranas: maduración con misoprostol contraindicada (usar balón de Foley)',
      'Bishop modificado: algunos usan escala 0-10 (sin altura de presentación)'
    ],
    limitations: [
      'Subjetividad en consistencia y posición cervical (variabilidad interobservador)',
      'No predice duración del trabajo de parto, solo probabilidad de parto vaginal',
      'Menos predictivo en nulíparas <30 semanas (cérvix inmaduro fisiológico)',
      'No considera factores obstétricos: macrosomía, distocias previas, cicatriz uterina',
      'Rotura prematura membranas altera evaluación de altura presentación',
      'Score alto no garantiza trabajo de parto rápido (puede ser prolongado igualmente)'
    ],
    references: [
      {
        type: 'Paper',
        citation: 'Bishop EH. Pelvic scoring for elective induction. Obstet Gynecol. 1964;24:266-268.',
        year: 1964
      },
      {
        type: 'ACOG',
        citation: 'ACOG Practice Bulletin No. 107: Induction of Labor. Obstet Gynecol. 2009;114(2 Pt 1):386-397.',
        year: 2009
      },
      {
        type: 'MINSAL',
        citation: 'Guía Perinatal 2015. MINSAL Chile. Inducción del Trabajo de Parto.',
        year: 2015
      },
      {
        type: 'Libro',
        citation: 'Williams Obstetrics, 26th Edition. Chapter 26: Labor Induction.',
        year: 2022
      }
    ]
  },

  // ===== ESCALAS DE BIENESTAR FETAL =====
  {
    id: 'perfil-biofisico',
    name: 'Perfil Biofísico Fetal (PBF)',
    category: 'fetal',
    description: 'Evaluación integral del bienestar fetal mediante ecografía y monitoreo cardíaco.',
    indication: 'Embarazos de alto riesgo: diabetes, hipertensión, RCIU, postérmino, oligohidramnios, disminución movimientos fetales.',
    timingApplication: 'Desde 32-34 semanas. Frecuencia según riesgo: 1-2 veces/semana en alto riesgo.',
    parameters: [
      {
        name: 'Movimientos Respiratorios Fetales',
        values: [
          { score: 0, description: 'Ausentes o <30 segundos en 30 min' },
          { score: 2, description: '≥1 episodio ≥30 segundos en 30 min' }
        ]
      },
      {
        name: 'Movimientos Corporales Fetales',
        values: [
          { score: 0, description: '<3 movimientos corporales/extremidades en 30 min' },
          { score: 2, description: '≥3 movimientos discretos cuerpo/extremidades en 30 min' }
        ]
      },
      {
        name: 'Tono Fetal',
        values: [
          { score: 0, description: 'Extensión lenta con retorno parcial a flexión, o ausencia de movimiento' },
          { score: 2, description: '≥1 episodio de extensión activa con retorno rápido a flexión (mano abierta-cerrada cuenta)' }
        ]
      },
      {
        name: 'Volumen de Líquido Amniótico (ILA)',
        values: [
          { score: 0, description: 'ILA ≤5 cm o bolsillo vertical máximo <2 cm (oligohidramnios)' },
          { score: 2, description: 'ILA >5 cm o bolsillo vertical ≥2 cm (normal)' }
        ]
      },
      {
        name: 'Reactividad de Frecuencia Cardíaca (NST)',
        values: [
          { score: 0, description: 'NST no reactivo: <2 aceleraciones ≥15 lpm x ≥15 seg en 20-40 min' },
          { score: 2, description: 'NST reactivo: ≥2 aceleraciones ≥15 lpm x ≥15 seg en 20-40 min' }
        ]
      }
    ],
    totalScoreRange: { min: 0, max: 10 },
    interpretation: [
      {
        range: '8-10',
        classification: 'Normal',
        clinicalSignificance: 'Riesgo de asfixia fetal casi nulo en la próxima semana. Oxigenación fetal adecuada.',
        recommendation: 'Continuar vigilancia según protocolo de riesgo. Repetir PBF en 1 semana (o antes si riesgo alto). Si 10/10: bajo riesgo. Si 8/10 con ILA bajo: considerar aumentar frecuencia vigilancia.'
      },
      {
        range: '6',
        classification: 'Equívoco/Sospechoso',
        clinicalSignificance: 'Asfixia fetal posible pero no confirmada. Requiere reevaluación.',
        recommendation: 'Repetir PBF en 12-24 horas. Si persiste 6/10 o se asocia a oligohidramnios: considerar finalización embarazo si >34 semanas. Perfil madurez pulmonar si 32-34 semanas.'
      },
      {
        range: '4',
        classification: 'Anormal',
        clinicalSignificance: 'Alta probabilidad de asfixia fetal. Riesgo de muerte fetal.',
        recommendation: 'Considerar PARTO en las próximas 24 horas si ≥34 semanas. Si <34 semanas: hospitalizar, esteroides, repetir PBF en 6-12h. Doppler arteria umbilical. Si deterioro o variables severas: finalizar.'
      },
      {
        range: '0-2',
        classification: 'Severamente Anormal',
        clinicalSignificance: 'Asfixia fetal casi segura. Alto riesgo de muerte fetal inminente.',
        recommendation: 'PARTO URGENTE si ≥32 semanas. Si <32 semanas: individualizar según madurez y viabilidad. Esteroides si tiempo permite. Cesárea probable. Informar neonatología. Preparar reanimación neonatal.'
      }
    ],
    clinicalPearls: [
      'Manning Score: desarrollado en 1980, gold standard para evaluación bienestar fetal',
      'Parámetros agudos (NST, movimientos, respiración, tono): reflejan estado ácido-base ACTUAL',
      'Parámetro crónico (líquido amniótico): refleja función renal y perfusión fetal crónica',
      'PBF modificado (solo NST + ILA): sensibilidad similar, más rápido, usado en muchos centros',
      'Falsos negativos raros: muerte fetal dentro de 1 semana con PBF 10/10 <1:1000',
      'Oligohidramnios aislado con PBF 8/10: aumenta riesgo, vigilancia más frecuente',
      'En postérmino ≥41 semanas: PBF 2 veces/semana',
      'Ciclo sueño-vigilia fetal: puede dar falsos positivos si feto dormido (repetir tras 40 min)'
    ],
    limitations: [
      'Requiere ecografía y experiencia del operador (no disponible en todos los centros)',
      'Consume tiempo (30-60 min si feto en reposo)',
      'No predice acidosis fetal súbita (desprendimiento placenta, prolapso cordón)',
      'Alta tasa de falsos positivos (PBF anormal con feto sano): puede llevar a cesáreas innecesarias',
      'Menos confiable <32 semanas (inmadurez SNC: movimientos respiratorios irregulares)',
      'PBF normal no excluye malformaciones, infección, anemia fetal',
      'No reemplaza el juicio clínico: síntomas maternos (disminución movimientos) pueden requerir parto incluso con PBF normal'
    ],
    references: [
      {
        type: 'Paper',
        citation: 'Manning FA, Platt LD, Sipos L. Antepartum fetal evaluation: development of a fetal biophysical profile. Am J Obstet Gynecol. 1980;136(6):787-795.',
        year: 1980,
        url: 'https://pubmed.ncbi.nlm.nih.gov/7355965/'
      },
      {
        type: 'ACOG',
        citation: 'ACOG Practice Bulletin No. 145: Antepartum Fetal Surveillance. Obstet Gynecol. 2014;124(1):182-192.',
        year: 2014
      },
      {
        type: 'MINSAL',
        citation: 'Guía Perinatal 2015. MINSAL Chile. Evaluación del Bienestar Fetal Anteparto.',
        year: 2015
      },
      {
        type: 'Libro',
        citation: 'Williams Obstetrics, 26th Edition. Chapter 17: Antepartum Assessment.',
        year: 2022
      }
    ]
  },
  {
    id: 'indice-liquido-amniotico',
    name: 'Índice de Líquido Amniótico (ILA)',
    category: 'fetal',
    description: 'Medición ecográfica semicuantitativa del volumen de líquido amniótico.',
    indication: 'Vigilancia fetal anteparto, embarazo postérmino, RCIU, diabetes, rotura prematura membranas.',
    timingApplication: 'Parte del PBF. Evaluación seriada según patología: semanal en oligohidramnios, cada 2-3 días en RPM.',
    parameters: [
      {
        name: 'Técnica de Medición',
        values: [
          { 
            score: 0, 
            description: 'ILA (Índice de Líquido Amniótico)', 
            criteria: 'Dividir útero en 4 cuadrantes con líneas perpendiculares a nivel ombligo. Medir bolsillo vertical más profundo en cada cuadrante (sin cordón/partes fetales). Sumar los 4 valores = ILA en cm.'
          },
          { 
            score: 1, 
            description: 'BVM (Bolsillo Vertical Máximo)', 
            criteria: 'Medir el bolsillo vertical más profundo en cualquier ubicación (sin cordón/partes fetales). Valor único en cm. Alternativa al ILA, algunos estudios muestran menor sobrediagnóstico de oligohidramnios.'
          }
        ]
      }
    ],
    totalScoreRange: { min: 0, max: 35 },
    interpretation: [
      {
        range: 'ILA <5 cm o BVM <2 cm',
        classification: 'Oligohidramnios',
        clinicalSignificance: 'Volumen reducido de líquido amniótico. Causas: RPM, RCIU, insuficiencia placentaria, agenesia renal, postérmino. Riesgo de compresión cordón, desaceleraciones variables, aspiración meconio.',
        recommendation: 'Buscar causa: eco anatómica (agenesia renal, obstrucción urinaria), Doppler (insuficiencia placentaria), descartar RPM (cristalización, IGFBP-1). Si ≥36 semanas: considerar finalización embarazo. Si <36 semanas: vigilancia estrecha con PBF 2-3 veces/semana. Amnioinfusión en trabajo de parto si desaceleraciones variables recurrentes.'
      },
      {
        range: 'ILA 5-8 cm',
        classification: 'Líquido Amniótico Límite Bajo',
        clinicalSignificance: 'Zona gris. Riesgo intermedio. Puede ser variante normal o inicio de oligohidramnios.',
        recommendation: 'Aumentar frecuencia de vigilancia fetal (PBF 2 veces/semana). Buscar tendencia: si ILA en descenso → investigar causa. Hidratación materna (2-3 L agua/día) puede aumentar ILA levemente. Reevaluar en 3-7 días.'
      },
      {
        range: 'ILA 8-24 cm o BVM 2-8 cm',
        classification: 'Normal',
        clinicalSignificance: 'Volumen de líquido amniótico adecuado para edad gestacional.',
        recommendation: 'Vigilancia de rutina según riesgo obstétrico. ILA máximo ~16 cm a 32-34 semanas, luego desciende gradualmente.'
      },
      {
        range: 'ILA ≥25 cm o BVM >8 cm',
        classification: 'Polihidramnios',
        clinicalSignificance: 'Exceso de líquido amniótico. Causas: diabetes materna mal controlada, anomalías fetales (atresia esofágica/duodenal, anencefalia, higroma quístico), hydrops fetal, infección (parvovirus B19, CMV), gemelar (transfusión feto-fetal). Riesgo de parto prematuro, prolapso cordón, desprendimiento placenta, hemorragia postparto.',
        recommendation: 'Eco anatómica detallada: descartar atresia GI, SNC, cardiopatías. Test tolerancia glucosa (diabetes). Screening infecciones TORCH. Si severo (ILA >35): considerar amniocentesis evacuadora. Vigilancia fetal aumentada. Profilaxis neumococo si RPM (riesgo corioamnionitis). En parto: parto controlado, evitar sobredistensión rápida útero, oxitocina profiláctica para HPP.'
      }
    ],
    clinicalPearls: [
      'ILA disminuye fisiológicamente con edad gestacional (máximo 32-34 sem, desciende después)',
      'Postérmino ≥41 sem: oligohidramnios en 10-15% (involución placentaria)',
      'Hidratación materna aguda (1-2 L agua) aumenta ILA transitoriamente ~30% (útil pre-versión externa)',
      'Oligohidramnios idiopático término: si PBF normal, puede manejo expectante hasta 39-40 sem',
      'BVM >8 cm solo: polihidramnios leve. BVM >12 cm: polihidramnios severo',
      'ILA puede sobreestimar oligohidramnios vs BVM: BVM preferido en algunos centros',
      'En gemelar monocorial: ILA <5 en un saco + ILA >8 en otro → sospechar transfusión feto-fetal',
      'Indometacina (tocolisis): puede causar oligohidramnios (cierre ducto arterioso fetal → ↓ diuresis)'
    ],
    limitations: [
      'Variabilidad interobservador significativa (~15-20% diferencia)',
      'No hay "gold standard" para medir volumen real (ILA es indirecto)',
      'Obesidad materna dificulta medición ecográfica',
      'BVM puede subestimar oligohidramnios vs ILA',
      'ILA solo: no predice resultado perinatal (debe usarse en contexto de PBF completo)',
      'Falsos positivos frecuentes: ILA bajo con feto sano → intervenciones innecesarias',
      'No distingue entre oligohidramnios por RPM vs insuficiencia placentaria (requiere evaluación clínica)'
    ],
    references: [
      {
        type: 'Paper',
        citation: 'Phelan JP, Ahn MO, Smith CV, et al. Amniotic fluid index measurements during pregnancy. J Reprod Med. 1987;32(8):601-604.',
        year: 1987
      },
      {
        type: 'ACOG',
        citation: 'ACOG Practice Bulletin No. 145: Antepartum Fetal Surveillance. Obstet Gynecol. 2014;124(1):182-192.',
        year: 2014
      },
      {
        type: 'MINSAL',
        citation: 'Guía Perinatal 2015. MINSAL Chile. Evaluación Ecográfica del Líquido Amniótico.',
        year: 2015
      },
      {
        type: 'Libro',
        citation: 'Williams Obstetrics, 26th Edition. Chapter 11: Amniotic Fluid.',
        year: 2022
      }
    ]
  },

  // ===== ESCALAS MATERNAS =====
  {
    id: 'clasificacion-robson',
    name: 'Clasificación de Robson (10 Grupos)',
    category: 'materna',
    description: 'Sistema de clasificación estandarizado de embarazadas para auditoría de tasas de cesárea.',
    indication: 'Auditoría institucional de cesáreas. Comparación entre centros. Identificar grupos con tasas altas de cesárea para intervenciones.',
    timingApplication: 'Clasificación al momento del parto. Análisis retrospectivo de cohortes.',
    parameters: [
      {
        name: 'Grupo 1',
        values: [
          { 
            score: 1, 
            description: 'Nulíparas, único, cefálica, ≥37 sem, trabajo parto espontáneo',
            criteria: 'Población de bajo riesgo. Tasa cesárea esperada <15-20%.'
          }
        ]
      },
      {
        name: 'Grupo 2',
        values: [
          { 
            score: 2, 
            description: 'Nulíparas, único, cefálica, ≥37 sem, inducidas o cesárea antes trabajo parto',
            criteria: 'Mayor riesgo que grupo 1 por inducción. Tasa cesárea 25-40% según Bishop.'
          }
        ]
      },
      {
        name: 'Grupo 3',
        values: [
          { 
            score: 3, 
            description: 'Multíparas sin cesárea previa, único, cefálica, ≥37 sem, trabajo parto espontáneo',
            criteria: 'Población de muy bajo riesgo. Tasa cesárea esperada <5%.'
          }
        ]
      },
      {
        name: 'Grupo 4',
        values: [
          { 
            score: 4, 
            description: 'Multíparas sin cesárea previa, único, cefálica, ≥37 sem, inducidas o cesárea antes trabajo parto',
            criteria: 'Bajo riesgo. Tasa cesárea esperada 10-20%.'
          }
        ]
      },
      {
        name: 'Grupo 5',
        values: [
          { 
            score: 5, 
            description: 'Todas las multíparas con al menos 1 cesárea previa, único, cefálica, ≥37 sem',
            criteria: 'Alto contribuidor a tasa global de cesárea. Tasa cesárea 50-90% según política local VBAC.'
          }
        ]
      },
      {
        name: 'Grupo 6',
        values: [
          { 
            score: 6, 
            description: 'Todas las nulíparas con feto único en podálica',
            criteria: 'Cesárea electiva recomendada en mayoría centros. Tasa cesárea >90%.'
          }
        ]
      },
      {
        name: 'Grupo 7',
        values: [
          { 
            score: 7, 
            description: 'Todas las multíparas con feto único en podálica, incluyendo con cesárea previa',
            criteria: 'Cesárea electiva habitual. Tasa cesárea >90%.'
          }
        ]
      },
      {
        name: 'Grupo 8',
        values: [
          { 
            score: 8, 
            description: 'Todos los embarazos múltiples, incluyendo con cesárea previa',
            criteria: 'Variable según presentación feto 1. Tasa cesárea 50-80%.'
          }
        ]
      },
      {
        name: 'Grupo 9',
        values: [
          { 
            score: 9, 
            description: 'Todas con feto en situación transversa u oblicua, incluyendo con cesárea previa',
            criteria: 'Cesárea indicada (salvo versión exitosa). Tasa cesárea ~100%.'
          }
        ]
      },
      {
        name: 'Grupo 10',
        values: [
          { 
            score: 10, 
            description: 'Todos los fetos únicos, cefálicos, <37 semanas, incluyendo con cesárea previa',
            criteria: 'Prematuros. Tasa cesárea variable 30-60% según edad gestacional.'
          }
        ]
      }
    ],
    totalScoreRange: { min: 1, max: 10 },
    interpretation: [
      {
        range: 'Grupos 1-4',
        classification: 'Población de Bajo Riesgo (núcleo)',
        clinicalSignificance: 'Representan 60-70% de las embarazadas. Principales contribuyentes a tasa cesárea (volumen). Grupos objetivo para reducir cesáreas innecesarias.',
        recommendation: 'Análisis detallado de indicaciones de cesárea en grupos 1-2 (nulíparas). Promover trabajo de parto espontáneo. Mejorar Bishop antes de inducción. Reducir cesáreas por "falta de progreso" con manejo activo TDP.'
      },
      {
        range: 'Grupo 5',
        classification: 'Cesárea Previa (mayor contribuidor)',
        clinicalSignificance: 'Representa 10-25% de embarazadas. Contribuye 20-40% de todas las cesáreas. Tasa cesárea 50-90% según política VBAC.',
        recommendation: 'Promover VBAC (parto vaginal después de cesárea) en candidatas apropiadas: 1 cesárea previa, incisión transversa baja, sin contraindicaciones. Consejería VBAC prenatal. Éxito VBAC 60-80% en seleccionadas.'
      },
      {
        range: 'Grupos 6-9',
        classification: 'Presentaciones Anormales y Múltiples',
        clinicalSignificance: 'Cesárea frecuentemente indicada. Contribuyen 10-15% de cesáreas totales. Poco margen para reducción.',
        recommendation: 'Versión cefálica externa en podálicas >36 sem (grupo 6-7). Considerar parto vaginal gemelar si feto 1 cefálico (grupo 8). Grupos 6-9: bajo potencial de reducción cesárea.'
      },
      {
        range: 'Grupo 10',
        classification: 'Prematuros',
        clinicalSignificance: 'Cesárea frecuente por indicaciones fetales/maternas. Contribución variable.',
        recommendation: 'Individualizar según edad gestacional y motivo prematurez. Promover parto vaginal en prematuros tardíos (34-36 sem) si presentación cefálica y condiciones favorables.'
      }
    ],
    clinicalPearls: [
      'OMS recomienda Clasificación de Robson como estándar global para monitorear cesáreas',
      'Permite comparación justa entre instituciones (ajusta por "case-mix")',
      'Meta OMS: Tasa cesárea global 10-15%. Realidad en Chile: 40-45%',
      'Grupos 1, 2a, 5 (nulíparas, inducidas, cesárea previa): principales objetivos para reducción',
      'Análisis por grupo permite identificar: ¿dónde está el problema? (no solo tasa global)',
      'Ejemplo: Tasa alta en grupo 1 → problema en manejo trabajo de parto nulíparas. Tasa alta en grupo 5 → baja tasa VBAC',
      'RTPC (Relative contribution of each group to Total Cesarean rate): herramienta de análisis',
      'Clasificación debe ser prospectiva (al ingreso parto) para auditoría en tiempo real'
    ],
    limitations: [
      'No considera indicaciones específicas de cesárea (solo clasifica población)',
      'Requiere registro prospectivo de datos (no siempre disponible en todos los centros)',
      'No ajusta por severidad de patología dentro de cada grupo',
      'Grupo 5 heterogéneo: mezcla VBAC exitoso con cesáreas repetidas electivas',
      'No clasifica cesáreas urgentes/emergentes vs electivas',
      'Útil para auditoría poblacional, NO para decisión clínica individual',
      'Tasas "esperadas" varían según población (urbano/rural, nivel centro, recursos)'
    ],
    references: [
      {
        type: 'Paper',
        citation: 'Robson MS. Classification of caesarean sections. Fetal Matern Med Rev. 2001;12(1):23-39.',
        year: 2001
      },
      {
        type: 'WHO',
        citation: 'WHO Statement on Caesarean Section Rates. World Health Organization. 2015.',
        year: 2015,
        url: 'https://www.who.int/publications/i/item/WHO-RHR-15.02'
      },
      {
        type: 'Paper',
        citation: 'Betran AP, Vindevoghel N, Souza JP, et al. A systematic review of the Robson classification for caesarean section: what works, doesn\'t work and how to improve it. PLoS One. 2014;9(6):e97769.',
        year: 2014,
        url: 'https://pubmed.ncbi.nlm.nih.gov/24892928/'
      },
      {
        type: 'MINSAL',
        citation: 'Norma General Técnica para la Reducción de Cesárea. MINSAL Chile. 2016.',
        year: 2016
      }
    ]
  }
];

// ===== HELPER FUNCTIONS =====
export function getScalesByCategory(categoryId: string): ClinicalScale[] {
  return CLINICAL_SCALES.filter(scale => scale.category === categoryId);
}

export function getScaleById(id: string): ClinicalScale | undefined {
  return CLINICAL_SCALES.find(scale => scale.id === id);
}

export function searchScales(query: string): ClinicalScale[] {
  const lowercaseQuery = query.toLowerCase();
  return CLINICAL_SCALES.filter(
    scale =>
      scale.name.toLowerCase().includes(lowercaseQuery) ||
      scale.description.toLowerCase().includes(lowercaseQuery) ||
      scale.indication.toLowerCase().includes(lowercaseQuery)
  );
}

export function getCategoryById(categoryId: string): ScaleCategory | undefined {
  return SCALE_CATEGORIES.find(cat => cat.id === categoryId);
}
