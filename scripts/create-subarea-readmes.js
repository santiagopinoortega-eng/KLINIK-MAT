#!/usr/bin/env node

/**
 * 📁 Script para crear README.md en cada subárea
 * 
 * Crea archivos README.md con información detallada de:
 * - Temas a cubrir
 * - Distribución por dificultad
 * - Integración de materias
 * - Nomenclatura de IDs
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// 📊 DEFINICIÓN DE SUBÁREAS
// ============================================================================

const SUBAREAS = [
  // OBSTETRICIA - Embarazo y Control Prenatal
  {
    path: 'OBSTETRICIA/01-embarazo-prenatal/01-control-normal',
    emoji: '🤰',
    name: 'Control Prenatal Normal',
    code: '1.1',
    prefix: 'emb-cpn',
    temasBaja: [
      'Primera consulta prenatal y anamnesis',
      'Cálculo de edad gestacional (FUM, ecografía)',
      'Control de presión arterial y valores normales',
      'Ganancia de peso según IMC pregestacional',
      'Cambios fisiológicos normales del embarazo',
      'Solicitud de exámenes de rutina',
      'Calendario de controles prenatales',
    ],
    temasMedia: [
      'Interpretación de laboratorios básicos',
      'Ecografía morfológica de segundo trimestre',
      'Screening de aneuploidías',
      'Screening de diabetes gestacional',
      'Casos con hallazgos limítrofes',
      'Indicaciones de derivación a especialista',
      'Manejo de síntomas menores del embarazo',
      'Suplementación y nutrición',
    ],
    temasAlta: [
      'Embarazo con comorbilidades múltiples',
      'Casos con presentación atípica',
      'Manejo de situaciones complejas',
      'Integración multidisciplinaria',
      'Toma de decisiones en límites de normalidad',
    ],
    integracion: ['Obstetricia básica', 'Fisiología del embarazo', 'Laboratorio clínico', 'Nutrición'],
  },
  {
    path: 'OBSTETRICIA/01-embarazo-prenatal/02-patologia-embarazo',
    emoji: '⚠️',
    name: 'Patología del Embarazo',
    code: '1.2',
    prefix: 'emb-pat',
    temasBaja: [
      'Preeclampsia leve: criterios diagnósticos',
      'Preeclampsia grave: identificación',
      'Diabetes gestacional: screening y diagnóstico',
      'Infección urinaria en embarazo',
      'Vaginosis bacteriana y candidiasis',
      'Anemia ferropénica en embarazo',
      'Hipotiroidismo gestacional',
    ],
    temasMedia: [
      'Síndrome HELLP: diagnóstico y manejo inicial',
      'Diabetes gestacional con requerimiento de insulina',
      'Manejo de infecciones complicadas',
      'Preeclampsia: indicaciones de hospitalización',
      'Anemia severa: estudio y tratamiento',
      'Hiperémesis gravídica',
      'Amenaza de parto prematuro',
      'Colestasia intrahepática del embarazo',
    ],
    temasAlta: [
      'Preeclampsia severa con múltiples complicaciones',
      'Diabetes pregestacional descompensada',
      'Patología médica compleja durante embarazo',
      'Manejo multidisciplinario de patología grave',
      'Decisión de interrupción vs manejo expectante',
    ],
    integracion: ['Obstetricia', 'Medicina interna', 'Farmacología', 'Laboratorio', 'Cuidados intensivos'],
  },
  {
    path: 'OBSTETRICIA/01-embarazo-prenatal/03-diagnostico-prenatal',
    emoji: '🔬',
    name: 'Diagnóstico Prenatal',
    code: '1.3',
    prefix: 'emb-dpn',
    temasBaja: [
      'Ecografía 11-14 semanas: medición TN',
      'Screening de primer trimestre',
      'Medidas fetales básicas (DBP, LF, CA)',
      'Ecografía morfológica: evaluación normal',
      'Movimientos fetales: interpretación',
      'Líquido amniótico: evaluación ILA',
      'Placenta: localización y grados',
    ],
    temasMedia: [
      'Translucencia nucal aumentada: manejo',
      'Screening positivo: consejería',
      'Marcadores de segundo trimestre',
      'Anomalías fetales menores',
      'Doppler obstétrico: indicaciones',
      'RCIU: sospecha diagnóstica',
      'Alteraciones del líquido amniótico',
      'Estudio invasivo: indicaciones',
    ],
    temasAlta: [
      'Anomalías fetales mayores: manejo integral',
      'Screening de alto riesgo: decisiones',
      'RCIU severo: estudio completo',
      'Aneuploidías: consejería y manejo',
      'Casos complejos con múltiples hallazgos',
    ],
    integracion: ['Obstetricia', 'Imagenología', 'Genética', 'Neonatología', 'Medicina fetal'],
  },
  {
    path: 'OBSTETRICIA/01-embarazo-prenatal/04-complicaciones',
    emoji: '🚨',
    name: 'Complicaciones Materno-Fetales',
    code: '1.4',
    prefix: 'emb-com',
    temasBaja: [
      'RCIU: definición y clasificación',
      'Polihidramnios: causas frecuentes',
      'Oligoamnios: identificación',
      'Placenta previa: tipos y manejo básico',
      'Rotura prematura de membranas',
      'Metrorragia primer trimestre',
      'Amenaza de aborto',
    ],
    temasMedia: [
      'RCIU: estudio Doppler y manejo',
      'Polihidramnios severo: estudio etiológico',
      'Placenta previa: conducta según edad gestacional',
      'DPPNI: sospecha y manejo inicial',
      'RPM pretérmino: manejo expectante vs activo',
      'Corioamnionitis: diagnóstico y tratamiento',
      'Isoinmunización Rh',
      'Embarazo gemelar: complicaciones',
    ],
    temasAlta: [
      'RCIU con Doppler severamente alterado',
      'Desprendimiento placentario complicado',
      'RPM pretérmino temprano: decisiones',
      'Muerte fetal: estudio y manejo',
      'Complicaciones múltiples simultáneas',
    ],
    integracion: ['Obstetricia', 'Medicina materno-fetal', 'Imagenología', 'Neonatología', 'Urgencias'],
  },

  // OBSTETRICIA - Parto y Atención Intraparto
  {
    path: 'OBSTETRICIA/02-parto-intraparto/01-parto-normal',
    emoji: '👶',
    name: 'Parto Normal y Mecánica',
    code: '2.1',
    prefix: 'par-pnm',
    temasBaja: [
      'Fases del trabajo de parto',
      'Dilatación y borramiento cervical',
      'Presentación cefálica: variedades',
      'Curva de Friedman: interpretación básica',
      'Conducción con oxitocina: indicaciones',
      'Analgesia del parto',
      'Alumbramiento normal',
    ],
    temasMedia: [
      'Trabajo de parto prolongado: manejo',
      'Inducción del parto: indicaciones y métodos',
      'Maduración cervical',
      'Distocias: identificación',
      'Partograma: interpretación avanzada',
      'Alumbramiento: complicaciones',
      'Desgarros perineales: clasificación',
      'Episiotomía: indicaciones',
    ],
    temasAlta: [
      'Distocias complejas: resolución',
      'Trabajo de parto complicado',
      'Decisión de vía de parto en casos límite',
      'Manejo de segundo período prolongado',
      'Complicaciones múltiples del parto',
    ],
    integracion: ['Obstetricia', 'Anatomía pélvica', 'Fisiología del parto', 'Anestesiología'],
  },
  {
    path: 'OBSTETRICIA/02-parto-intraparto/02-monitoreo-fetal',
    emoji: '📊',
    name: 'Monitoreo Fetal Intraparto',
    code: '2.2',
    prefix: 'par-mfi',
    temasBaja: [
      'CTG normal: características',
      'Frecuencia cardíaca fetal basal',
      'Variabilidad: interpretación',
      'Aceleraciones: significado',
      'Deceleraciones tempranas',
      'Monitoreo intermitente vs continuo',
      'Registro de contracciones',
    ],
    temasMedia: [
      'Taquicardia fetal: causas y manejo',
      'Bradicardia fetal: evaluación',
      'Deceleraciones variables: interpretación',
      'Deceleraciones tardías: significado',
      'Variabilidad disminuida',
      'Patrón sinusoidal',
      'pH de cuero cabelludo fetal',
      'Test de estimulación fetal',
    ],
    temasAlta: [
      'Sufrimiento fetal agudo: manejo urgente',
      'Patrones complejos de CTG',
      'Decisión de interrupción por CTG',
      'Casos con monitoreo límite',
      'Interpretación en contextos complejos',
    ],
    integracion: ['Obstetricia', 'Fisiología fetal', 'Interpretación de monitoreo', 'Urgencias'],
  },
  {
    path: 'OBSTETRICIA/02-parto-intraparto/03-parto-instrumental',
    emoji: '🔧',
    name: 'Parto Instrumental',
    code: '2.3',
    prefix: 'par-pin',
    temasBaja: [
      'Fórceps: indicaciones básicas',
      'Vacuum: principios de aplicación',
      'Cesárea: indicaciones principales',
      'Requisitos para parto instrumental',
      'Contraindicaciones de instrumental',
      'Complicaciones maternas del instrumental',
      'Complicaciones fetales del instrumental',
    ],
    temasMedia: [
      'Fórceps vs vacuum: selección',
      'Parto instrumental fallido: manejo',
      'Cesárea de urgencia vs emergencia',
      'Aplicación de fórceps: técnica',
      'Complicaciones del vacuum',
      'Cesárea en trabajo de parto avanzado',
      'Anestesia para parto instrumental',
      'Complicaciones operatorias de cesárea',
    ],
    temasAlta: [
      'Instrumental en situaciones complejas',
      'Decisión rápida de vía de parto',
      'Cesárea con dificultades técnicas',
      'Complicaciones intraoperatorias graves',
      'Manejo de emergencias obstétricas',
    ],
    integracion: ['Obstetricia', 'Técnica quirúrgica', 'Anestesiología', 'Neonatología'],
  },
  {
    path: 'OBSTETRICIA/02-parto-intraparto/04-urgencias',
    emoji: '🚑',
    name: 'Urgencias Obstétricas Intraparto',
    code: '2.4',
    prefix: 'par-urg',
    temasBaja: [
      'Prolapso de cordón: identificación',
      'Distocia de hombros: reconocimiento',
      'Hemorragia intraparto',
      'Rotura uterina: sospecha',
      'Embolia de líquido amniótico',
      'Inversión uterina',
      'Desprendimiento placentario intraparto',
    ],
    temasMedia: [
      'Prolapso de cordón: manejo inmediato',
      'Distocia de hombros: maniobras',
      'Hemorragia masiva: reanimación',
      'Rotura uterina: manejo quirúrgico',
      'Embolia amniótica: soporte vital',
      'Shock hipovolémico: tratamiento',
      'Coagulopatía del parto',
      'Taponamiento uterino',
    ],
    temasAlta: [
      'Emergencias obstétricas múltiples',
      'Manejo de shock refractario',
      'Decisiones en situaciones extremas',
      'Complicaciones catastróficas',
      'Código rojo obstétrico',
    ],
    integracion: ['Obstetricia', 'Medicina de urgencias', 'Anestesiología', 'Cirugía', 'Hematología'],
  },

  // OBSTETRICIA - Puerperio y Lactancia
  {
    path: 'OBSTETRICIA/03-puerperio-lactancia/01-puerperio-normal',
    emoji: '🤱',
    name: 'Puerperio Normal',
    code: '3.1',
    prefix: 'pue-pno',
    temasBaja: [
      'Involución uterina normal',
      'Loquios: evolución normal',
      'Signos vitales en puerperio',
      'Recuperación postparto',
      'Cuidados perineales',
      'Alta de maternidad: criterios',
      'Signos de alarma en puerperio',
    ],
    temasMedia: [
      'Subinvolución uterina: manejo',
      'Loquios anormales: evaluación',
      'Dolor perineal: manejo',
      'Estreñimiento postparto',
      'Hemorroides postparto',
      'Anticoncepción postparto',
      'Retorno de la menstruación',
      'Actividad sexual postparto',
    ],
    temasAlta: [
      'Puerperio en pacientes complejas',
      'Manejo de comorbilidades',
      'Adaptación maternal difícil',
      'Casos con múltiples factores de riesgo',
      'Seguimiento integral postparto',
    ],
    integracion: ['Obstetricia', 'Fisiología puerperal', 'Atención primaria', 'Salud mental'],
  },
  {
    path: 'OBSTETRICIA/03-puerperio-lactancia/02-complicaciones',
    emoji: '⚠️',
    name: 'Complicaciones del Puerperio',
    code: '3.2',
    prefix: 'pue-cmp',
    temasBaja: [
      'Endometritis: diagnóstico',
      'Hemorragia postparto tardía',
      'Infección de herida operatoria',
      'Tromboflebitis superficial',
      'Depresión postparto: screening',
      'Mastitis: reconocimiento',
      'Fiebre puerperal: causas',
    ],
    temasMedia: [
      'Endometritis: tratamiento',
      'Hemorragia postparto tardía: manejo',
      'TVP postparto: diagnóstico y tratamiento',
      'Depresión postparto: manejo inicial',
      'Psicosis puerperal: identificación',
      'Absceso mamario',
      'Dehiscencia de sutura',
      'Hematoma de herida operatoria',
    ],
    temasAlta: [
      'Sepsis puerperal',
      'TVP con embolismo pulmonar',
      'Psicosis puerperal severa',
      'Complicaciones múltiples',
      'Paciente crítica puerperal',
    ],
    integracion: ['Obstetricia', 'Medicina interna', 'Psiquiatría', 'Hematología', 'Infectología'],
  },
  {
    path: 'OBSTETRICIA/03-puerperio-lactancia/03-lactancia',
    emoji: '🍼',
    name: 'Lactancia Materna',
    code: '3.3',
    prefix: 'pue-lac',
    temasBaja: [
      'Fisiología de la lactancia',
      'Técnica de amamantamiento',
      'Posiciones para amamantar',
      'Signos de buen agarre',
      'Producción de leche: factores',
      'Calostro y leche madura',
      'Frecuencia de mamadas',
    ],
    temasMedia: [
      'Grietas del pezón: prevención y manejo',
      'Ingurgitación mamaria',
      'Mastitis no infecciosa',
      'Mastitis infecciosa: tratamiento',
      'Hipogalactia: evaluación y manejo',
      'Relactación',
      'Lactancia en situaciones especiales',
      'Extracción y almacenamiento de leche',
    ],
    temasAlta: [
      'Lactancia en RN con patología',
      'Contraindicaciones de lactancia',
      'Galactogogos: indicaciones',
      'Lactancia en madre con patología',
      'Casos complejos de lactancia',
    ],
    integracion: ['Obstetricia', 'Pediatría', 'Nutrición', 'Educación en salud', 'Farmacología'],
  },
  {
    path: 'OBSTETRICIA/03-puerperio-lactancia/04-cuidados-rn',
    emoji: '👼',
    name: 'Cuidados del Recién Nacido',
    code: '3.4',
    prefix: 'pue-crn',
    temasBaja: [
      'Cuidado del cordón umbilical',
      'Baño del recién nacido',
      'Temperatura del RN',
      'Signos de alarma en RN',
      'Patrón de sueño del RN',
      'Deposiciones normales',
      'Screening neonatal',
    ],
    temasMedia: [
      'Ictericia fisiológica vs patológica',
      'Onfalitis: prevención y manejo',
      'Cambios cutáneos del RN',
      'Regurgitación vs vómito',
      'Cólicos del lactante',
      'Desarrollo de vínculo',
      'Vacunación neonatal',
      'Control de salud del RN',
    ],
    temasAlta: [
      'RN con factores de riesgo',
      'Signos sutiles de patología',
      'Evaluación integral del RN',
      'Indicaciones de hospitalización',
      'Seguimiento de RN de riesgo',
    ],
    integracion: ['Neonatología', 'Pediatría', 'Enfermería', 'Salud pública', 'Educación familiar'],
  },

  // GINECOLOGÍA
  {
    path: 'GINECOLOGIA/01-trastornos-menstruales',
    emoji: '🩸',
    name: 'Trastornos Menstruales',
    code: '4.1',
    prefix: 'gin-trm',
    temasBaja: [
      'Amenorrea primaria: definición',
      'Amenorrea secundaria: causas',
      'Menorragia: cuantificación',
      'Dismenorrea primaria',
      'Síndrome premenstrual',
      'Ciclo menstrual normal',
      'Metrorragia: clasificación',
    ],
    temasMedia: [
      'Amenorrea: estudio diagnóstico',
      'Menorragia: manejo médico',
      'Dismenorrea secundaria: estudio',
      'SOP: criterios diagnósticos',
      'Hemorragia uterina disfuncional',
      'Oligomenorrea: evaluación',
      'Sangrado uterino anormal: PALM-COEIN',
      'Manejo hormonal de trastornos menstruales',
    ],
    temasAlta: [
      'Amenorrea con causa compleja',
      'Menorragia refractaria: opciones quirúrgicas',
      'SOP con manifestaciones severas',
      'Hemorragia aguda: manejo urgente',
      'Casos con múltiples alteraciones',
    ],
    integracion: ['Ginecología', 'Endocrinología', 'Imagenología', 'Laboratorio', 'Hematología'],
  },
  {
    path: 'GINECOLOGIA/02-infecciones',
    emoji: '🦠',
    name: 'Infecciones Genitales',
    code: '4.2',
    prefix: 'gin-inf',
    temasBaja: [
      'Vaginitis por Candida',
      'Vaginosis bacteriana',
      'Tricomoniasis',
      'Vulvovaginitis: síntomas',
      'Cervicitis: identificación',
      'Flujo vaginal normal vs patológico',
      'Pruebas diagnósticas básicas',
    ],
    temasMedia: [
      'Enfermedad inflamatoria pélvica',
      'Bartholinitis: manejo',
      'Úlceras genitales: diagnóstico diferencial',
      'HPV: screening y manejo',
      'Herpes genital',
      'Condilomas acuminados',
      'Cervicitis por Chlamydia/Gonorrea',
      'Absceso tubo-ovárico',
    ],
    temasAlta: [
      'EIP complicada',
      'Infecciones múltiples simultáneas',
      'Infecciones en pacientes inmunodeprimidas',
      'Complicaciones de infecciones genitales',
      'Manejo de infecciones resistentes',
    ],
    integracion: ['Ginecología', 'Infectología', 'Microbiología', 'Salud pública', 'Dermatología'],
  },
  {
    path: 'GINECOLOGIA/03-patologia-mamas',
    emoji: '🎀',
    name: 'Patología de Mamas',
    code: '4.3',
    prefix: 'gin-mam',
    temasBaja: [
      'Mastalgia cíclica',
      'Fibroadenoma: características',
      'Mastopatía fibroquística',
      'Autoexamen mamario',
      'Secreción del pezón: evaluación',
      'Quiste mamario simple',
      'Screening de cáncer mamario',
    ],
    temasMedia: [
      'Nódulo mamario: estudio',
      'Mastalgia no cíclica: manejo',
      'Fibroadenoma: seguimiento vs cirugía',
      'Papiloma intraductal',
      'Secreción patológica: estudio',
      'Mamografía: interpretación BI-RADS',
      'Ecografía mamaria: indicaciones',
      'Biopsia mamaria: indicaciones',
    ],
    temasAlta: [
      'Nódulo sospechoso: manejo integral',
      'BI-RADS 4-5: conducta',
      'Cáncer mamario temprano',
      'Casos complejos de patología mamaria',
      'Manejo multidisciplinario',
    ],
    integracion: ['Ginecología', 'Oncología', 'Imagenología', 'Cirugía', 'Anatomía patológica'],
  },
  {
    path: 'GINECOLOGIA/04-patologia-ovarica',
    emoji: '🫀',
    name: 'Patología Ovárica/Endometrial',
    code: '4.4',
    prefix: 'gin-ova',
    temasBaja: [
      'Síndrome de ovario poliquístico',
      'Quiste ovárico funcional',
      'Endometriosis: síntomas',
      'Dolor pélvico crónico',
      'Hiperplasia endometrial: tipos',
      'Mioma uterino',
      'Pólipos endometriales',
    ],
    temasMedia: [
      'SOP: manejo integral',
      'Quiste ovárico complejo: evaluación',
      'Endometriosis: tratamiento médico',
      'Endometriosis: tratamiento quirúrgico',
      'Hiperplasia endometrial: manejo',
      'Miomas sintomáticos: opciones terapéuticas',
      'Masa anexial: estudio',
      'Histeroscopia: indicaciones',
    ],
    temasAlta: [
      'Endometriosis severa',
      'Masa anexial compleja',
      'Sospecha de cáncer ovárico',
      'Cáncer endometrial temprano',
      'Casos complejos con múltiples patologías',
    ],
    integracion: ['Ginecología', 'Oncología', 'Endocrinología', 'Cirugía', 'Imagenología'],
  },

  // SALUD SEXUAL Y ANTICONCEPCIÓN
  {
    path: 'GINECOLOGIA/05-anticonceptivos',
    emoji: '💊',
    name: 'Métodos Anticonceptivos',
    code: '5.1',
    prefix: 'sex-act',
    temasBaja: [
      'Píldora anticonceptiva combinada',
      'DIU de cobre: mecanismo',
      'DIU con levonorgestrel',
      'Implante subdérmico',
      'Inyectable mensual y trimestral',
      'Parche anticonceptivo',
      'Anillo vaginal',
    ],
    temasMedia: [
      'Anticoncepción: consejería y selección',
      'Contraindicaciones de ACO',
      'Efectos secundarios: manejo',
      'Cambio de método anticonceptivo',
      'Anticoncepción de emergencia',
      'Inserción de DIU',
      'Inserción de implante',
      'Falla anticonceptiva',
    ],
    temasAlta: [
      'Anticoncepción en pacientes con comorbilidades',
      'Trombosis asociada a ACO',
      'Complicaciones de DIU',
      'Casos complejos de anticoncepción',
      'Anticoncepción en adolescentes',
    ],
    integracion: ['Ginecología', 'Farmacología', 'Endocrinología', 'Salud pública', 'Educación'],
  },
  {
    path: 'GINECOLOGIA/06-metodos-barrera',
    emoji: '🛡️',
    name: 'Métodos Barrera y Naturales',
    code: '5.2',
    prefix: 'sex-bar',
    temasBaja: [
      'Preservativo masculino: uso correcto',
      'Preservativo femenino',
      'Diafragma: indicaciones',
      'Espermicidas',
      'Método de Ogino-Knaus',
      'Método de la temperatura basal',
      'Método del moco cervical (Billings)',
    ],
    temasMedia: [
      'Métodos naturales: efectividad',
      'Lactancia amenorrea (MELA)',
      'Coito interrumpido: consejería',
      'Combinación de métodos',
      'Educación sexual integral',
      'Prevención de ITS',
      'Falla de métodos de barrera',
      'Selección de método según pareja',
    ],
    temasAlta: [
      'Planificación natural en casos especiales',
      'Consejería en adolescentes',
      'Casos complejos de planificación',
      'Doble protección',
      'Situaciones culturales específicas',
    ],
    integracion: ['Ginecología', 'Educación sexual', 'Salud pública', 'Antropología', 'Ética'],
  },
  {
    path: 'GINECOLOGIA/07-its',
    emoji: '🔬',
    name: 'Infecciones de Transmisión Sexual',
    code: '5.3',
    prefix: 'sex-its',
    temasBaja: [
      'Gonorrea: manifestaciones',
      'Sífilis primaria',
      'VIH: consejería pre-test',
      'Herpes genital primario',
      'Hepatitis B: transmisión sexual',
      'Condilomas: reconocimiento',
      'Prevención de ITS',
    ],
    temasMedia: [
      'Gonorrea: tratamiento',
      'Sífilis: estadios y tratamiento',
      'VIH: post-exposición',
      'Herpes recurrente: manejo',
      'Hepatitis B: vacunación',
      'HPV: vacunación y screening',
      'Notificación de parejas',
      'Screening de ITS',
    ],
    temasAlta: [
      'VIH con coinfecciones',
      'Sífilis neurolues',
      'ITS múltiples',
      'ITS en embarazo',
      'Resistencia a tratamientos',
    ],
    integracion: ['Ginecología', 'Infectología', 'Dermatología', 'Salud pública', 'Microbiología'],
  },
  {
    path: 'GINECOLOGIA/08-planificacion',
    emoji: '👨‍👩‍👧‍👦',
    name: 'Planificación Familiar',
    code: '5.4',
    prefix: 'sex-pla',
    temasBaja: [
      'Fertilidad: conceptos básicos',
      'Período fértil',
      'Consejería reproductiva',
      'Infertilidad: definición',
      'Esterilización voluntaria',
      'Vasectomía',
      'Ligadura tubaria',
    ],
    temasMedia: [
      'Estudio básico de infertilidad',
      'Infertilidad masculina',
      'Infertilidad femenina',
      'Inducción de ovulación',
      'Técnicas de reproducción asistida',
      'Inseminación intrauterina',
      'Fertilización in vitro: conceptos',
      'Preservación de fertilidad',
    ],
    temasAlta: [
      'Infertilidad de causa compleja',
      'Falla de tratamientos de fertilidad',
      'Aspectos éticos de reproducción asistida',
      'Donación de gametos',
      'Casos especiales de fertilidad',
    ],
    integracion: ['Ginecología', 'Medicina reproductiva', 'Andrología', 'Psicología', 'Ética', 'Derecho'],
  },

  // NEONATOLOGÍA
  {
    path: 'NEONATOLOGIA/01-atencion-inmediata',
    emoji: '👶',
    name: 'Atención Inmediata del RN',
    code: '6.1',
    prefix: 'neo-ain',
    temasBaja: [
      'Apgar: evaluación',
      'Examen físico del RN normal',
      'Antropometría neonatal',
      'Reflejos primitivos',
      'Adaptación cardiopulmonar',
      'Termorregulación del RN',
      'Profilaxis ocular y vitamina K',
    ],
    temasMedia: [
      'Reanimación neonatal: pasos iniciales',
      'Apgar bajo: manejo',
      'Examen físico: hallazgos anormales',
      'Clasificación del RN (peso/EG)',
      'RN de término grande',
      'RN pequeño para edad gestacional',
      'Malformaciones congénitas evidentes',
      'Screening metabólico',
    ],
    temasAlta: [
      'Reanimación neonatal avanzada',
      'RN deprimido severo',
      'Malformaciones complejas',
      'Decisiones en sala de partos',
      'Estabilización pre-traslado',
    ],
    integracion: ['Neonatología', 'Pediatría', 'Reanimación', 'Genética', 'Enfermería neonatal'],
  },
  {
    path: 'NEONATOLOGIA/02-prematuro',
    emoji: '🍼',
    name: 'Recién Nacido Prematuro',
    code: '6.2',
    prefix: 'neo-pre',
    temasBaja: [
      'Definición de prematurez',
      'Clasificación de prematuros',
      'Síndrome de dificultad respiratoria',
      'Edad gestacional: evaluación',
      'Termorregulación en prematuro',
      'Alimentación del prematuro',
      'Apneas del prematuro',
    ],
    temasMedia: [
      'SDR: manejo con CPAP',
      'Enterocolitis necrotizante',
      'Retinopatía del prematuro: screening',
      'Hemorragia intraventricular',
      'Displasia broncopulmonar',
      'Ductus arterioso persistente',
      'Nutrición parenteral en prematuro',
      'Seguimiento de prematuro extremo',
    ],
    temasAlta: [
      'Prematuro extremo: manejo integral',
      'Complicaciones múltiples',
      'Ventilación mecánica neonatal',
      'Prematuro con patología compleja',
      'Decisiones de soporte vital',
    ],
    integracion: ['Neonatología', 'Medicina intensiva neonatal', 'Nutrición', 'Oftalmología', 'Neurología'],
  },
  {
    path: 'NEONATOLOGIA/03-patologia',
    emoji: '🏥',
    name: 'Patología Neonatal',
    code: '6.3',
    prefix: 'neo-pat',
    temasBaja: [
      'Ictericia fisiológica',
      'Hipoglucemia neonatal',
      'Policitemia neonatal',
      'Onfalitis',
      'Conjuntivitis neonatal',
      'Exantemas del RN',
      'Traumatismo obstétrico',
    ],
    temasMedia: [
      'Ictericia patológica: estudio',
      'Hiperbilirrubinemia severa: fototerapia',
      'Hipoglucemia persistente',
      'Sepsis neonatal temprana',
      'Sepsis neonatal tardía',
      'Cardiopatías congénitas: sospecha',
      'Convulsiones neonatales',
      'Hijo de madre diabética',
    ],
    temasAlta: [
      'Encefalopatía hipóxico-isquémica',
      'Sepsis neonatal grave',
      'Cardiopatía cianosante crítica',
      'Errores innatos del metabolismo',
      'Patologías múltiples',
    ],
    integracion: ['Neonatología', 'Pediatría', 'Infectología', 'Cardiología', 'Genética', 'Neurología'],
  },
  {
    path: 'NEONATOLOGIA/04-cuidados',
    emoji: '🧸',
    name: 'Cuidados Neonatales',
    code: '6.4',
    prefix: 'neo-cui',
    temasBaja: [
      'Control de temperatura',
      'Alimentación del RN sano',
      'Lactancia materna exclusiva',
      'Higiene del RN',
      'Cuidado del cordón',
      'Patrón de eliminación normal',
      'Sueño del RN',
    ],
    temasMedia: [
      'RN con bajo peso: alimentación',
      'Fórmulas lácteas: indicaciones',
      'Suplementación con vitaminas',
      'Screening auditivo',
      'Displasia de cadera: screening',
      'Vacunación neonatal',
      'Signos de alerta para padres',
      'Control de salud del RN',
    ],
    temasAlta: [
      'RN de alto riesgo: seguimiento',
      'Cuidados especiales en casa',
      'Nutrición enteral en casa',
      'Oxigenoterapia domiciliaria',
      'Programa de seguimiento',
    ],
    integracion: ['Neonatología', 'Pediatría', 'Enfermería', 'Nutrición', 'Salud pública', 'Kinesiología'],
  },
];

// ============================================================================
// 📝 FUNCIÓN PARA GENERAR README
// ============================================================================

function generateReadme(subarea) {
  const { emoji, name, code, prefix, path: subareaPath, temasBaja, temasMedia, temasAlta, integracion } = subarea;

  const content = `# ${emoji} ${name} (20 casos)

**Código:** ${code}  
**Dificultad:** 7 Baja + 8 Media + 5 Alta

## 📋 Temas a Cubrir

### Casos BAJA (001-007):
${temasBaja.map(t => `- ${t}`).join('\n')}

### Casos MEDIA (008-015):
${temasMedia.map(t => `- ${t}`).join('\n')}

### Casos ALTA (016-020):
${temasAlta.map(t => `- ${t}`).join('\n')}

## 🎯 Integración de Materias
${integracion.map(i => `- ${i}`).join('\n')}

## 📝 Nomenclatura de IDs
\`\`\`
${prefix}-[tema]-[numero]

Ejemplos:
${prefix}-${temasBaja[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 20)}-001
${prefix}-${temasBaja[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 20)}-002
\`\`\`

## 📊 Progreso
\`\`\`
Total:    20 casos
Baja:     0/7   (0%)
Media:    0/8   (0%)
Alta:     0/5   (0%)
\`\`\`

---
**Estado:** 🔴 Pendiente | **Última actualización:** ${new Date().toLocaleDateString('es-CL')}
`;

  return content;
}

// ============================================================================
// 🚀 CREAR ARCHIVOS
// ============================================================================

function createReadmes() {
  const basePath = path.join(__dirname, '..', 'prisma', 'cases');
  let created = 0;
  let errors = 0;

  console.log('\n📁 Creando README.md en subáreas...\n');

  SUBAREAS.forEach(subarea => {
    const fullPath = path.join(basePath, subarea.path, 'README.md');
    const dirPath = path.dirname(fullPath);

    try {
      // Crear directorio si no existe
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Generar y escribir README
      const content = generateReadme(subarea);
      fs.writeFileSync(fullPath, content, 'utf8');

      console.log(`✅ ${subarea.emoji} ${subarea.name}`);
      created++;
    } catch (error) {
      console.error(`❌ Error en ${subarea.name}: ${error.message}`);
      errors++;
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Resumen:`);
  console.log(`   ✅ Creados: ${created}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log('='.repeat(60) + '\n');
}

// Ejecutar
createReadmes();
