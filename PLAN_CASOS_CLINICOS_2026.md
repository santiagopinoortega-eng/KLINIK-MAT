# 🏥 Plan de Implementación: 480 Casos Clínicos KLINIK-MAT

**Fecha:** 12 de enero de 2026  
**Estado:** 🚀 En construcción activa  
**Meta:** 480 casos clínicos distribuidos en 6 áreas principales  
**Filosofía:** Aprendizaje progresivo, toma de decisiones clínicas e integración de materias

---

## 📋 RESUMEN EJECUTIVO

### Estado Actual
- ✅ **Schema Prisma:** Configurado y listo
- ✅ **Sistema de seed:** Funcionando con JSON5
- ✅ **Estructura de carpetas:** Definida
- ✅ **Caso modelo:** `hpp-atonia-v2.json5` como referencia
- ⏳ **Casos existentes:** 1 caso completo (HPP)
- 🎯 **Objetivo:** 480 casos nuevos

### 🎯 Estructura de Dificultad (Optimizada para Aprendizaje)
```
BAJA (1):   6 preguntas MCQ
            → Enfoque: Conocimiento básico, identificación de signos/síntomas clave
            → Objetivo: Reconocer patrones clínicos fundamentales

MEDIA (2):  6 MCQ + 1 SHORT con criterios de evaluación
            → Enfoque: Aplicación de conocimiento, interpretación de datos clínicos
            → Objetivo: Toma de decisiones basadas en evidencia, criterios diagnósticos clave
            → SHORT: Preguntas de razonamiento (ej: ¿Por qué eligió este tratamiento?)

ALTA (3):   7 MCQ + 1 SHORT con criterios de evaluación
            → Enfoque: Integración de materias, manejo de casos complejos
            → Objetivo: Pensamiento clínico avanzado, manejo de complicaciones
            → SHORT: Análisis profundo, justificación de decisiones complejas
```

### 📊 Distribución de Casos

**Total: 480 casos**
- **Por área:** 80 casos (6 áreas × 80)
- **Por subárea:** 20 casos (4 subáreas × 20)
- **Distribución por dificultad en cada subárea:**
  - Baja: ~7 casos (35%)
  - Media: ~8 casos (40%)
  - Alta: ~5 casos (25%)

---

## 🎓 FILOSOFÍA DE APRENDIZAJE

### Principios Pedagógicos

1. **Progresión Gradual de Complejidad**
   - Casos de dificultad BAJA: Establecer bases, reconocer patrones
   - Casos de dificultad MEDIA: Aplicar conocimiento, tomar decisiones
   - Casos de dificultad ALTA: Integrar, analizar y resolver situaciones complejas

2. **Toma de Decisiones Clínicas**
   - Cada caso presenta situaciones reales donde el estudiante debe elegir
   - Feedback inmediato con justificación clínica
   - Énfasis en el "por qué" no solo el "qué"

3. **Integración de Materias**
   - Casos que combinan fisiopatología, farmacología, diagnóstico y tratamiento
   - Conexión entre conocimiento básico y aplicación clínica
   - Referencias cruzadas entre subáreas relacionadas

4. **Pensamiento Clínico**
   - Preguntas SHORT que requieren justificación
   - Criterios de evaluación basados en razonamiento
   - Análisis de múltiples variables (laboratorio, clínica, imagen)

### Estructura de Preguntas SHORT

**Nivel MEDIO (6 MCQ + 1 SHORT):**
```json
{
  "tipo": "short",
  "enunciado": "¿Cuál es el criterio diagnóstico más importante que utilizarías para confirmar preeclampsia en esta paciente?",
  "criteriosEvaluacion": [
    "presión arterial",
    "140/90",
    "dos tomas",
    "proteinuria",
    "300 mg",
    "20 semanas",
    "gestación",
    "ambos criterios"
  ],
  "guia": "Los criterios clave son: PA ≥140/90 mmHg en dos ocasiones separadas por al menos 4 horas, más proteinuria significativa (≥300 mg/24h), después de las 20 semanas de gestación. AMBOS criterios (PA + proteinuria) son necesarios para el diagnóstico."
}
```

**Nivel ALTO (7 MCQ + 1 SHORT):**
```json
{
  "tipo": "short",
  "enunciado": "Justifica tu decisión de interrumpir el embarazo ahora en lugar de intentar manejo expectante. Menciona al menos 3 factores que influyen en tu decisión.",
  "criteriosEvaluacion": [
    "preeclampsia severa",
    "criterios severidad",
    "PA 160/110",
    "síntomas neurológicos",
    "compromiso fetal",
    "RCIU",
    "oligoamnios",
    "doppler alterado",
    "edad gestacional",
    "34 semanas",
    "balance riesgo-beneficio",
    "interrupción"
  ],
  "guia": "La decisión se basa en: 1) Presencia de criterios de preeclampsia severa con riesgo vital materno (PA no controlable, signos neurológicos), 2) Compromiso fetal demostrado (RCIU <p3, oligoamnios, Doppler con flujo diastólico ausente), 3) Edad gestacional >34 semanas donde el riesgo de prematuridad es menor que el riesgo de continuar embarazo. El balance riesgo-beneficio favorece la interrupción. El manejo expectante estaría contraindicado por el compromiso materno-fetal severo."
}
```

---

## 🗂️ ESTRUCTURA DE ÁREAS Y SUBÁREAS

### TEMA 1: Embarazo y Control Prenatal (80 casos)

**Ubicación:** `prisma/cases/OBSTETRICIA/01-embarazo-prenatal/`

#### 1.1 Control Prenatal Normal (20 casos)
```
prisma/cases/OBSTETRICIA/01-embarazo-prenatal/01-control-normal/
├── cpn-primera-consulta-001.json5
├── cpn-calculo-eg-002.json5
├── cpn-presion-arterial-003.json5
├── cpn-ganancia-peso-004.json5
├── cpn-cambios-fisiologicos-005.json5
...
└── cpn-examenes-rutina-020.json5
```

**Distribución por dificultad:**
- Baja: 7 casos (35%) - Reconocimiento de valores normales, cálculos básicos
- Media: 8 casos (40%) - Interpretación de resultados, solicitud apropiada de exámenes
- Alta: 5 casos (25%) - Casos con hallazgos limítrofes, decisiones de seguimiento

**Temas clave:**
- Cálculo de edad gestacional (FUM, ecografía)
- Presión arterial y valores normales
- Ganancia de peso según IMC
- Cambios fisiológicos normales del embarazo
- Solicitud de exámenes de rutina
- Calendario de controles

**Integración de materias:** Obstetricia básica + Fisiología del embarazo + Laboratorio clínico

#### 1.2 Patología del Embarazo (20 casos)
```
prisma/cases/OBSTETRICIA/01-embarazo-prenatal/02-patologia-embarazo/
├── preeclampsia-leve-001.json5
├── preeclampsia-grave-002.json5
├── diabetes-gestacional-001.json5
├── itu-embarazo-001.json5
├── vaginosis-bacteriana-002.json5
...
└── anemia-embarazo-020.json5
```

**Distribución por dificultad:**
- Baja: 7 casos - Diagnóstico de patologías comunes con presentación típica
- Media: 8 casos - Manejo inicial, criterios diagnósticos, indicaciones de derivación
- Alta: 5 casos - Complicaciones, manejo de patología severa, decisiones complejas

**Temas clave:**
- Preeclampsia (leve, grave, síndrome HELLP)
- Diabetes gestacional (screening, manejo)
- Infecciones urinarias en embarazo
- Infecciones vaginales (vaginosis, candidiasis)
- Anemia ferropénica
- Hipotiroidismo gestacional

**Integración de materias:** Obstetricia + Medicina interna + Farmacología + Laboratorio

#### 1.3 Diagnóstico Prenatal (20 casos)
```
prisma/cases/OBSTETRICIA/01-embarazo-prenatal/03-diagnostico-prenatal/
├── ecografia-11-14-semanas-001.json5
├── screening-primer-trimestre-002.json5
├── medidas-fetales-003.json5
├── anomalia-cardiaca-004.json5
├── translucencia-nucal-005.json5
...
└── amniocentesis-indicaciones-025.json5
```

**Temas clave:**
- Ecografía 11-14 semanas (translucencia nucal)
- Screening de aneuploidías
- Medidas fetales (DBP, LF, CA, LCN)
- Anomalías estructurales fetales
- Marcadores ecográficos de segundo trimestre
- Indicaciones de amniocentesis

#### 1.4 Complicaciones Materno-Fetales (25 casos)
```
prisma/cases/OBSTETRICIA/01-embarazo-prenatal/04-complicaciones/
├── rciu-001.json5
├── polihidramnios-002.json5
├── oligoamnios-003.json5
├── placenta-previa-004.json5
├── abrupcio-placentae-005.json5
...
└── muerte-fetal-025.json5
```

**Temas clave:**
- RCIU (simétrico, asimétrico)
- Alteraciones del líquido amniótico
- Placenta previa (tipos, manejo)
- Desprendimiento prematuro de placenta
- Rotura prematura de membranas
- Muerte fetal intrauterina

---

### TEMA 2: Parto y Atención Intraparto (100 casos)

**Ubicación:** `prisma/cases/OBSTETRICIA/02-parto-intraparto/`

#### 2.1 Parto Normal y Mecánica (25 casos)
```
prisma/cases/OBSTETRICIA/02-parto-intraparto/01-parto-normal/
├── trabajo-parto-fases-001.json5
├── dilatacion-borramiento-002.json5
├── conduccion-trabajo-parto-003.json5
├── curva-friedman-004.json5
├── presentacion-cefalica-005.json5
...
└── alumbramiento-normal-025.json5
```

**Temas clave:**
- Fases del trabajo de parto
- Dilatación y borramiento cervical
- Conducción con oxitocina
- Curva de Friedman
- Mecanismo del parto (variedades de posición)
- Alumbramiento y revisión placentaria

#### 2.2 Monitoreo Fetal Intraparto (25 casos)
```
prisma/cases/OBSTETRICIA/02-parto-intraparto/02-monitoreo-fetal/
├── ctg-normal-001.json5
├── ctg-taquicardia-002.json5
├── ctg-bradicardia-003.json5
├── deceleraciones-variables-004.json5
├── deceleraciones-tardias-005.json5
...
└── ph-fetal-025.json5
```

**Temas clave:**
- Interpretación de CTG (cardiotocografía)
- Frecuencia cardíaca fetal basal
- Variabilidad (presente, ausente, sinusoidal)
- Deceleraciones (tempranas, tardías, variables)
- Sufrimiento fetal agudo
- pH de cuero cabelludo fetal

#### 2.3 Parto Instrumental (25 casos)
```
prisma/cases/OBSTETRICIA/02-parto-intraparto/03-parto-instrumental/
├── forceps-indicaciones-001.json5
├── forceps-aplicacion-002.json5
├── vacuum-indicaciones-003.json5
├── vacuum-complicaciones-004.json5
├── cesarea-indicaciones-005.json5
...
└── cesarea-urgencia-025.json5
```

**Temas clave:**
- Indicaciones de fórceps
- Técnica de aplicación de fórceps
- Indicaciones de vacuum
- Complicaciones de parto instrumental
- Indicaciones de cesárea
- Cesárea de urgencia vs emergencia

#### 2.4 Urgencias Obstétricas Intraparto (25 casos)
```
prisma/cases/OBSTETRICIA/02-parto-intraparto/04-urgencias/
├── prolapso-cordon-001.json5
├── embolia-amniotica-002.json5
├── distocia-hombro-003.json5
├── ruptura-uterina-004.json5
├── inversion-uterina-005.json5
...
└── shock-hipovolemico-025.json5
```

**Temas clave:**
- Prolapso de cordón umbilical
- Embolia de líquido amniótico
- Distocia de hombros (maniobras)
- Rotura uterina
- Inversión uterina
- Shock hipovolémico

---

### TEMA 3: Puerperio y Lactancia (100 casos)

**Ubicación:** `prisma/cases/OBSTETRICIA/03-puerperio-lactancia/`

#### 3.1 Puerperio Normal (25 casos)
```
prisma/cases/OBSTETRICIA/03-puerperio-lactancia/01-puerperio-normal/
├── involucion-uterina-001.json5
├── loquios-normal-002.json5
├── recuperacion-postparto-003.json5
├── puerperio-inmediato-004.json5
├── alta-maternidad-005.json5
...
└── anticoncepticon-postparto-025.json5
```

**Temas clave:**
- Involución uterina (altura uterina)
- Loquios (tipos, evolución normal)
- Recuperación física postparto
- Signos de alarma en puerperio
- Alta de maternidad
- Anticoncepción postparto

#### 3.2 Complicaciones del Puerperio (25 casos)
```
prisma/cases/OBSTETRICIA/03-puerperio-lactancia/02-complicaciones/
├── endometritis-001.json5
├── hemorragia-postparto-tardia-002.json5
├── tvp-postparto-003.json5
├── depresion-postparto-004.json5
├── psicosis-postparto-005.json5
...
└── mastitis-infecciosa-025.json5
```

**Temas clave:**
- Endometritis puerperal
- Hemorragia postparto tardía
- Trombosis venosa profunda
- Depresión postparto (Edinburgh)
- Psicosis puerperal
- Infección de herida operatoria

#### 3.3 Lactancia Materna (25 casos)
```
prisma/cases/OBSTETRICIA/03-puerperio-lactancia/03-lactancia/
├── fisiologia-lactancia-001.json5
├── tecnica-agarre-002.json5
├── mastitis-no-infecciosa-003.json5
├── grietas-pezon-004.json5
├── baja-produccion-leche-005.json5
...
└── destete-025.json5
```

**Temas clave:**
- Fisiología de la lactancia
- Técnica de amamantamiento
- Mastitis (infecciosa vs no infecciosa)
- Grietas del pezón
- Hipogalactia
- Contraindicaciones de lactancia

#### 3.4 Cuidados del RN (25 casos)
```
prisma/cases/OBSTETRICIA/03-puerperio-lactancia/04-cuidados-rn/
├── cordon-umbilical-001.json5
├── bano-recien-nacido-002.json5
├── signos-alarma-rn-003.json5
├── vinculo-madre-hijo-004.json5
├── screening-neonatal-005.json5
...
└── vacunacion-neonatal-025.json5
```

**Temas clave:**
- Cuidado del cordón umbilical
- Higiene del recién nacido
- Signos de alarma en RN
- Vínculo temprano madre-hijo
- Screening neonatal
- Vacunas al nacer

---

### TEMA 4: Ginecología (100 casos)

**Ubicación:** `prisma/cases/GINECOLOGIA/`

#### 4.1 Trastornos Menstruales (25 casos)
```
prisma/cases/GINECOLOGIA/01-trastornos-menstruales/
├── amenorrea-primaria-001.json5
├── amenorrea-secundaria-002.json5
├── menorragia-001.json5
├── dismenorrea-001.json5
├── sdp-001.json5
...
└── sindrome-ovario-poliquistico-025.json5
```

**Temas clave:**
- Amenorrea (primaria, secundaria)
- Menorragia y metrorragia
- Dismenorrea (primaria, secundaria)
- Síndrome disfórico premenstrual
- Síndrome de ovario poliquístico
- Sangrado uterino anormal

#### 4.2 Infecciones Genitales (25 casos)
```
prisma/cases/GINECOLOGIA/02-infecciones/
├── vaginitis-candida-001.json5
├── vaginosis-bacteriana-002.json5
├── eip-001.json5
├── ulcera-genital-001.json5
├── hpv-001.json5
...
└── cervicitis-025.json5
```

**Temas clave:**
- Vaginitis por Candida
- Vaginosis bacteriana
- Enfermedad inflamatoria pélvica
- Úlceras genitales (herpes, sífilis)
- HPV y lesiones precancerosas
- Cervicitis

#### 4.3 Patología de Mamas (25 casos)
```
prisma/cases/GINECOLOGIA/03-patologia-mamas/
├── mastopatia-fibroquistica-001.json5
├── fibroadenoma-002.json5
├── mastalgias-003.json5
├── galactorrea-004.json5
├── masa-mamaria-005.json5
...
└── screening-cancer-mama-025.json5
```

**Temas clave:**
- Mastopatía fibroquística
- Fibroadenoma
- Mastalgias (cíclicas, no cíclicas)
- Galactorrea
- Evaluación de masa mamaria
- Screening de cáncer de mama

#### 4.4 Patología Ovárica/Endometrial (25 casos)
```
prisma/cases/GINECOLOGIA/04-ovarica-endometrial/
├── sop-diagnostico-001.json5
├── endometriosis-001.json5
├── hiperplasia-endometrial-002.json5
├── cancer-endometrio-early-003.json5
├── quiste-ovarico-004.json5
...
└── torsion-anexial-025.json5
```

**Temas clave:**
- SOP (criterios de Rotterdam)
- Endometriosis (diagnóstico, manejo)
- Hiperplasia endometrial
- Cáncer de endometrio temprano
- Quistes ováricos (funcionales, patológicos)
- Torsión anexial

---

### TEMA 5: Salud Sexual y Anticoncepción (100 casos)

**Ubicación:** `prisma/cases/SSR/` (Salud Sexual y Reproductiva)

#### 5.1 Métodos Anticonceptivos (25 casos)
```
prisma/cases/SSR/01-anticonceptivos/
├── pildora-combinada-001.json5
├── pildora-progestina-002.json5
├── parche-anticonceptivo-003.json5
├── diu-cobre-004.json5
├── diu-levonorgestrel-005.json5
...
└── esterilizacion-quirurgica-025.json5
```

**Temas clave:**
- Píldora anticonceptiva combinada
- Píldora solo progestina
- Parche transdérmico
- DIU de cobre
- DIU hormonal (Mirena)
- Implante subdérmico
- Inyectable mensual/trimestral
- Esterilización quirúrgica

#### 5.2 Métodos Barrera y Naturales (25 casos)
```
prisma/cases/SSR/02-barrera-naturales/
├── preservativo-masculino-001.json5
├── preservativo-femenino-002.json5
├── diafragma-003.json5
├── metodo-ogino-004.json5
├── coito-interrumpido-005.json5
...
└── anticoncepcion-emergencia-025.json5
```

**Temas clave:**
- Preservativo masculino
- Preservativo femenino
- Diafragma
- Método de Ogino-Knaus
- Coito interrumpido
- Método de amenorrea de lactancia (MELA)
- Anticoncepción de emergencia

#### 5.3 Infecciones de Transmisión Sexual (25 casos)
```
prisma/cases/SSR/03-its/
├── gonorrea-001.json5
├── sifilis-primaria-002.json5
├── sifilis-secundaria-003.json5
├── vih-001.json5
├── herpes-genital-004.json5
...
└── hepatitis-b-025.json5
```

**Temas clave:**
- Gonorrea
- Sífilis (primaria, secundaria, latente)
- VIH/SIDA
- Herpes genital
- Clamidia
- Hepatitis B
- Linfogranuloma venéreo
- Condilomas acuminados

#### 5.4 Planificación Familiar (25 casos)
```
prisma/cases/SSR/04-planificacion-familiar/
├── consejeria-anticonceptiva-001.json5
├── fertilidad-002.json5
├── infertilidad-masculina-003.json5
├── infertilidad-femenina-004.json5
├── reproduccion-asistida-005.json5
...
└── adopcion-025.json5
```

**Temas clave:**
- Consejería en anticoncepción
- Fertilidad (cálculo, ventana fértil)
- Infertilidad masculina (espermograma)
- Infertilidad femenina (anovulación, etc.)
- Técnicas de reproducción asistida
- Inducción de ovulación

---

### TEMA 6: Neonatología / Recién Nacido (100 casos)

**Ubicación:** `prisma/cases/NEONATOLOGIA/`

#### 6.1 Atención Inmediata del RN (25 casos)
```
prisma/cases/NEONATOLOGIA/01-atencion-inmediata/
├── apgar-001.json5
├── evaluacion-fisica-rn-002.json5
├── reanimacion-neonatal-003.json5
├── reflejos-primitivos-004.json5
├── antropometria-rn-005.json5
...
└── termorregulacion-025.json5
```

**Temas clave:**
- Score de Apgar
- Evaluación física inicial
- Reanimación neonatal (ABC)
- Reflejos primitivos
- Antropometría (peso, talla, PC)
- Termorregulación

#### 6.2 Recién Nacido Prematuro (25 casos)
```
prisma/cases/NEONATOLOGIA/02-prematuro/
├── edad-gestacional-ballard-001.json5
├── sdr-surfactante-002.json5
├── nec-003.json5
├── rop-004.json5
├── bpd-005.json5
...
└── seguimiento-prematuro-025.json5
```

**Temas clave:**
- Evaluación de edad gestacional (Ballard)
- Síndrome de dificultad respiratoria (SDR)
- Enterocolitis necrotizante (NEC)
- Retinopatía del prematuro (ROP)
- Displasia broncopulmonar (BPD)
- Hemorragia intraventricular

#### 6.3 Patología Neonatal (25 casos)
```
prisma/cases/NEONATOLOGIA/03-patologia/
├── ictericia-neonatal-001.json5
├── hipoglucemia-neonatal-002.json5
├── sepsis-neonatal-003.json5
├── anomalias-congenitas-004.json5
├── lesiones-parto-005.json5
...
└── asfixia-perinatal-025.json5
```

**Temas clave:**
- Ictericia neonatal (fisiológica, patológica)
- Hipoglucemia neonatal
- Sepsis neonatal (temprana, tardía)
- Anomalías congénitas comunes
- Lesiones traumáticas del parto
- Asfixia perinatal

#### 6.4 Cuidados Neonatales (25 casos)
```
prisma/cases/NEONATOLOGIA/04-cuidados/
├── control-temperatura-001.json5
├── alimentacion-rn-002.json5
├── cuidado-cordon-003.json5
├── screening-metabolico-004.json5
├── vacunas-rn-005.json5
...
└── alta-neonatal-025.json5
```

**Temas clave:**
- Control térmico
- Alimentación del RN (lactancia vs fórmula)
- Cuidado del cordón umbilical
- Screening metabólico
- Vacunas al nacer (BCG, Hepatitis B)
- Criterios de alta neonatal

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### 1. Schema Prisma - Campos para Áreas y Subáreas

**Estado actual en `schema.prisma`:**
```prisma
model Case {
  id         String   @id
  version    Int      @default(1)
  title      String
  area       String   // "Embarazo y control prenatal"
  difficulty Int      // 1=Baja, 2=Media, 3=Alta
  dificultad String?  // "Alta", "Media", "Baja"
  modulo     String?  // "Control Prenatal Normal"
  summary    String?
  // ... resto de campos
}
```

**✅ NO necesitamos modificar el schema**, ya tiene:
- `area`: Área principal (ej: "Embarazo y Control Prenatal")
- `modulo`: Subárea (ej: "Control Prenatal Normal")
- `difficulty`: Nivel numérico (1, 2, 3)
- `dificultad`: Texto legible ("Baja", "Media", "Alta")

### 2. Valores Estándar para los Campos

**Crear archivo de constantes:**
```typescript
// lib/constants/areas-clinicas.ts
export const AREAS_CLINICAS = {
  EMBARAZO_PRENATAL: {
    nombre: "Embarazo y Control Prenatal",
    subareas: {
      CONTROL_NORMAL: "Control Prenatal Normal",
      PATOLOGIA: "Patología del Embarazo",
      DIAGNOSTICO_PRENATAL: "Diagnóstico Prenatal",
      COMPLICACIONES: "Complicaciones Materno-Fetales"
    }
  },
  PARTO_INTRAPARTO: {
    nombre: "Parto y Atención Intraparto",
    subareas: {
      PARTO_NORMAL: "Parto Normal y Mecánica",
      MONITOREO_FETAL: "Monitoreo Fetal Intraparto",
      PARTO_INSTRUMENTAL: "Parto Instrumental",
      URGENCIAS: "Urgencias Obstétricas Intraparto"
    }
  },
  PUERPERIO_LACTANCIA: {
    nombre: "Puerperio y Lactancia",
    subareas: {
      PUERPERIO_NORMAL: "Puerperio Normal",
      COMPLICACIONES: "Complicaciones del Puerperio",
      LACTANCIA: "Lactancia Materna",
      CUIDADOS_RN: "Cuidados del RN"
    }
  },
  GINECOLOGIA: {
    nombre: "Ginecología",
    subareas: {
      TRASTORNOS_MENSTRUALES: "Trastornos Menstruales",
      INFECCIONES: "Infecciones Genitales",
      PATOLOGIA_MAMAS: "Patología de Mamas",
      PATOLOGIA_OVARICA: "Patología Ovárica/Endometrial"
    }
  },
  SALUD_SEXUAL: {
    nombre: "Salud Sexual y Anticoncepción",
    subareas: {
      ANTICONCEPTIVOS: "Métodos Anticonceptivos",
      BARRERA_NATURALES: "Métodos Barrera y Naturales",
      ITS: "Infecciones de Transmisión Sexual",
      PLANIFICACION_FAMILIAR: "Planificación Familiar"
    }
  },
  NEONATOLOGIA: {
    nombre: "Neonatología / Recién Nacido",
    subareas: {
      ATENCION_INMEDIATA: "Atención Inmediata del RN",
      PREMATURO: "Recién Nacido Prematuro",
      PATOLOGIA_NEONATAL: "Patología Neonatal",
      CUIDADOS: "Cuidados Neonatales"
    }
  }
} as const;
```

### 3. Plantilla de Caso JSON5

**Archivo:** `prisma/cases/PLANTILLA-CASO.json5`

```json5
{
  // ===== METADATOS =====
  id: "area-subarea-tema-001",  // ÚNICO: usar formato consistente
  version: 1,
  
  // Clasificación (usar constantes de AREAS_CLINICAS)
  area: "Embarazo y Control Prenatal",      // Área principal
  modulo: "Control Prenatal Normal",         // Subárea
  difficulty: 2,                             // 1=Baja, 2=Media, 3=Alta
  dificultad: "Media",                       // Texto legible
  
  titulo: "Título descriptivo del caso clínico",
  
  // Resumen ejecutivo (opcional, para búsquedas)
  summary: "Breve descripción de 1-2 líneas del caso",
  
  // Objetivos de aprendizaje (3-4 objetivos SMART)
  objetivosAprendizaje: [
    "Objetivo 1: Verbo + resultado medible",
    "Objetivo 2: Verbo + resultado medible",
    "Objetivo 3: Verbo + resultado medible"
  ],
  
  // ===== VIGNETA CLÍNICA =====
  vigneta: "Historia clínica completa del paciente. Debe ser realista, contextualizada a Chile, con datos suficientes para responder las preguntas pero sin exceso de información irrelevante.",
  
  // ===== PREGUNTAS (5 para BAJA, 5+1 SHORT para MEDIA, 6+1 SHORT para ALTA) =====
  pasos: [
    // MCQ ejemplo
    {
      id: "p1",
      tipo: "mcq",
      enunciado: "Pregunta clara y específica sobre el caso clínico",
      opciones: [
        {
          id: "a",
          texto: "Opción A - distractor plausible",
          esCorrecta: false,
          explicacion: "Explicación detallada de por qué es incorrecta"
        },
        {
          id: "b",
          texto: "Opción B - respuesta correcta",
          esCorrecta: true,
          explicacion: "Explicación detallada de por qué es la correcta, con fundamento teórico"
        },
        {
          id: "c",
          texto: "Opción C - distractor plausible",
          esCorrecta: false,
          explicacion: "Explicación detallada de por qué es incorrecta"
        },
        {
          id: "d",
          texto: "Opción D - distractor plausible",
          esCorrecta: false,
          explicacion: "Explicación detallada de por qué es incorrecta"
        }
      ],
      feedbackDocente: "Comentario pedagógico adicional para reforzar el aprendizaje"
    },
    
    // Más MCQ...
    
    // SHORT ejemplo (solo para MEDIA y ALTA)
    {
      id: "p6",
      tipo: "short",
      enunciado: "Pregunta abierta que requiere redacción del estudiante",
      guia: "Guía de respuesta ideal (se muestra después de enviar)",
      
      // Solo para ALTA: criterios de evaluación automática
      criteriosEvaluacion: [
        "palabra_clave_1",
        "concepto_importante_2",
        "termino_tecnico_3"
      ],
      puntosMaximos: 2
    }
  ],
  
  // ===== FEEDBACK DINÁMICO =====
  feedbackDinamico: {
    bajo: "Mensaje motivador para 25-49% de respuestas correctas",
    medio: "Mensaje alentador para 31-70% de respuestas correctas",
    alto: "Mensaje de felicitación para 71-100% de respuestas correctas"
  },
  
  // ===== REFERENCIAS =====
  referencias: [
    "MINSAL Chile — Norma técnica relevante",
    "OMS — Guía clínica",
    "Libro/Paper académico"
  ]
}
```

### 4. Estructura de Carpetas Definitiva

```
prisma/cases/
├── PLANTILLA-CASO.json5                     # 👈 Plantilla para copiar
├── OBSTETRICIA/
│   ├── 01-embarazo-prenatal/
│   │   ├── 01-control-normal/               # 25 casos
│   │   ├── 02-patologia-embarazo/           # 25 casos
│   │   ├── 03-diagnostico-prenatal/         # 25 casos
│   │   └── 04-complicaciones/               # 25 casos
│   ├── 02-parto-intraparto/
│   │   ├── 01-parto-normal/                 # 25 casos
│   │   ├── 02-monitoreo-fetal/              # 25 casos
│   │   ├── 03-parto-instrumental/           # 25 casos
│   │   └── 04-urgencias/                    # 25 casos
│   └── 03-puerperio-lactancia/
│       ├── 01-puerperio-normal/             # 25 casos
│       ├── 02-complicaciones/               # 25 casos
│       ├── 03-lactancia/                    # 25 casos
│       └── 04-cuidados-rn/                  # 25 casos
├── GINECOLOGIA/
│   ├── 01-trastornos-menstruales/           # 25 casos
│   ├── 02-infecciones/                      # 25 casos
│   ├── 03-patologia-mamas/                  # 25 casos
│   └── 04-ovarica-endometrial/              # 25 casos
├── SSR/
│   ├── 01-anticonceptivos/                  # 25 casos
│   ├── 02-barrera-naturales/                # 25 casos
│   ├── 03-its/                              # 25 casos
│   └── 04-planificacion-familiar/           # 25 casos
└── NEONATOLOGIA/
    ├── 01-atencion-inmediata/               # 25 casos
    ├── 02-prematuro/                        # 25 casos
    ├── 03-patologia/                        # 25 casos
    └── 04-cuidados/                         # 25 casos
```

### 5. Cómo Agregar Casos al Proyecto

#### Opción A: Archivo Individual
```bash
# 1. Crear archivo JSON5 en la carpeta correcta
touch prisma/cases/OBSTETRICIA/01-embarazo-prenatal/01-control-normal/cpn-primera-consulta-001.json5

# 2. Copiar plantilla y rellenar

# 3. Cargar a la base de datos
npm run seed:cases -- --file prisma/cases/OBSTETRICIA/01-embarazo-prenatal/01-control-normal/cpn-primera-consulta-001.json5
```

#### Opción B: Carga Masiva por Carpeta
```bash
# Cargar todos los casos de una subcarpeta
npm run seed:cases -- --folder prisma/cases/OBSTETRICIA/01-embarazo-prenatal/01-control-normal/
```

#### Opción C: Carga Total
```bash
# Cargar TODOS los casos del proyecto
npm run seed:cases
```

### 6. Script de Validación

**Ya existe:** `scripts/validate-case-structure.mjs`

```bash
# Validar un caso específico
node scripts/validate-case-structure.mjs --file cpn-primera-consulta-001.json5

# Validar todos los casos
node scripts/validate-case-structure.mjs --all
```

**Verifica:**
- ✅ Estructura JSON5 válida
- ✅ Campos obligatorios presentes
- ✅ Cantidad correcta de preguntas según dificultad
- ✅ Cada MCQ tiene exactamente 4 opciones
- ✅ Cada opción tiene `explicacion`
- ✅ Exactamente 1 respuesta correcta por MCQ
- ✅ SHORT con `criteriosEvaluacion` en MEDIA
- ✅ SHORT con `criteriosEvaluacion` en ALTA

---

## 🧪 CÓMO PROBAR LOS CASOS

### 1. Pruebas Locales (Desarrollo)

#### A. Seed en Base de Datos Local
```bash
# 1. Asegurarte de tener DB local corriendo
npm run db:dev

# 2. Cargar el caso
npm run seed:cases -- --file prisma/cases/OBSTETRICIA/...

# 3. Ver en Prisma Studio
npm run prisma:studio
```

#### B. Probar en la Interfaz Web
```bash
# 1. Iniciar servidor de desarrollo
npm run dev

# 2. Navegar a la página de casos
# http://localhost:3000/areas/embarazo-y-control-prenatal

# 3. Resolver el caso y verificar:
# - ✅ Viñeta se muestra correctamente
# - ✅ Preguntas aparecen en orden
# - ✅ Opciones se presentan correctamente
# - ✅ Explicaciones aparecen al enviar
# - ✅ Puntaje se calcula bien
# - ✅ Feedback dinámico funciona
```

### 2. Pruebas Unitarias

```bash
# Ejecutar tests de casos clínicos
npm run test -- cases
```

**Archivo de test:** `__tests__/cases/case-structure.test.ts`

### 3. Pruebas de Integración

```bash
# Test completo de flujo de caso clínico
npm run test:integration -- case-flow
```

**Verifica:**
- ✅ Carga del caso desde API
- ✅ Renderizado en frontend
- ✅ Envío de respuestas
- ✅ Cálculo de puntaje
- ✅ Guardado de resultados

### 4. Validación de Calidad Académica

**Checklist manual para cada caso:**

#### Vigneta
- [ ] Contextualizada a realidad chilena
- [ ] Datos clínicos suficientes
- [ ] Sin información irrelevante
- [ ] Realista y verosímil
- [ ] Lenguaje técnico apropiado

#### Preguntas MCQ
- [ ] Enunciado claro y sin ambigüedad
- [ ] Lead-in (tipo de pregunta) apropiado
- [ ] 4 opciones homogéneas en longitud
- [ ] Distractores plausibles
- [ ] Una sola respuesta correcta indiscutible
- [ ] Sin negaciones dobles
- [ ] Sin pistas técnicas

#### Explicaciones
- [ ] Justificación clara de la correcta
- [ ] Explicación de por qué incorrectas
- [ ] Fundamento teórico sólido
- [ ] Referencias cuando necesario

#### Preguntas SHORT (MEDIA/ALTA)
- [ ] Enunciado que estimula reflexión
- [ ] Guía de respuesta completa
- [ ] Criterios objetivos (solo ALTA)
- [ ] Pertinencia al caso
- [ ] preguntas que integren materias basicas (farmacologia, fisiopatologia, fisiologia, temas legales)

### 5. Revisión por Pares

**Proceso recomendado:**

1. **Autor** crea el caso
2. **Revisor 1** (matron especialista) valida contenido clínico
3. **Revisor 2** (educador matron) valida pedagogía
4. **Estudiante beta** prueba el caso
5. **Aprobación final** e ingreso a producción

---

## 📊 SEGUIMIENTO DE PROGRESO

### Dashboard de Casos

**Crear archivo:** `PROGRESO_CASOS.md`

```markdown
# Progreso de Casos Clínicos KLINIK-MAT

Última actualización: 2026-01-12

## Resumen General
- 🎯 Meta total: 600 casos
- ✅ Completados: 1 caso
- 🚧 En progreso: 0 casos
- ⏳ Pendientes: 599 casos
- 📈 Progreso: 0.17%

## Por Área

### Embarazo y Control Prenatal (0/100)
- Control Prenatal Normal: 0/25
- Patología del Embarazo: 0/25
- Diagnóstico Prenatal: 0/25
- Complicaciones: 0/25

### Parto y Atención Intraparto (0/100)
- Parto Normal: 0/25
- Monitoreo Fetal: 0/25
- Parto Instrumental: 0/25
- Urgencias: 0/25

### Puerperio y Lactancia (0/100)
- Puerperio Normal: 0/25
- Complicaciones: 0/25
- Lactancia: 0/25
- Cuidados RN: 0/25

### Ginecología (0/100)
- Trastornos Menstruales: 0/25
- Infecciones: 0/25
- Patología de Mamas: 0/25
- Patología Ovárica: 0/25

### Salud Sexual (0/100)
- Anticonceptivos: 0/25
- Barrera y Naturales: 0/25
- ITS: 0/25
- Planificación Familiar: 0/25

### Neonatología (0/100)
- Atención Inmediata: 0/25
- Prematuro: 0/25
- Patología: 0/25
- Cuidados: 0/25
```

### Script de Conteo Automático

```bash
# Contar casos por área
node scripts/count-cases.js

# Output ejemplo:
# OBSTETRICIA: 1 casos
# GINECOLOGIA: 0 casos
# SSR: 0 casos
# NEONATOLOGIA: 0 casos
# TOTAL: 1/600 casos (0.17%)
```

---

## 🚀 PLAN DE ACCIÓN INMEDIATO

### Fase 1: Setup Inicial (HOY)
- [x] Revisar estructura actual ✅
- [ ] Crear archivo de constantes `lib/constants/areas-clinicas.ts`
- [ ] Crear plantilla `prisma/cases/PLANTILLA-CASO.json5`
- [ ] Crear estructura de carpetas
- [ ] Actualizar seed para usar carpetas nuevas

### Fase 2: Primeros 25 Casos (Semana 1)
- [ ] Control Prenatal Normal (25 casos)
  - [ ] 10 casos dificultad BAJA
  - [ ] 10 casos dificultad MEDIA
  - [ ] 5 casos dificultad ALTA

### Fase 3: Escalamiento (Semanas 2-8)
- [ ] Completar Embarazo (100 casos)
- [ ] Completar Parto (100 casos)
- [ ] Completar Puerperio (100 casos)
- [ ] Completar Ginecología (100 casos)
- [ ] Completar Salud Sexual (100 casos)
- [ ] Completar Neonatología (100 casos)

---

## 📚 RECURSOS Y REFERENCIAS

### Guías MINSAL Chile
- Norma Técnica para la Supervisión de Niños y Niñas de 0 a 9 años
- Guía Perinatal MINSAL 2015
- Normas de Regulación de la Fertilidad

### Referencias Internacionales
- OMS - Recomendaciones sobre cuidados prenatales
- ACOG - Practice Bulletins
- NICE Guidelines - Antenatal care

### Libros de Referencia
- Williams Obstetricia (última edición)
- Cunningham - Obstetricia
- Beckmann - Obstetrics and Gynecology

---

## ✅ RESUMEN TÉCNICO

### Schema Prisma
✅ **Listo** - No requiere cambios

### Campos Clave
- `area`: Área principal
- `modulo`: Subárea
- `difficulty`: 1, 2, 3
- `dificultad`: "Baja", "Media", "Alta"

### Formato de Casos
- **Archivo:** JSON5
- **Ubicación:** `prisma/cases/[AREA]/[SUBAREA]/`
- **Naming:** `[tema]-[subtema]-[numero].json5`

### Carga de Datos
```bash
npm run seed:cases                    # Todos
npm run seed:cases -- --file X.json5  # Uno solo
npm run seed:cases -- --folder DIR    # Por carpeta
```

### Validación
```bash
node scripts/validate-case-structure.mjs
```

### Pruebas
```bash
npm run test -- cases                 # Unit tests
npm run test:integration -- case-flow  # Integration
npm run dev                           # Manual testing
```

---

## 🎯 SIGUIENTE PASO

**Acción inmediata:**
1. Crear estructura de carpetas
2. Copiar plantilla
3. Comenzar con primer caso de "Control Prenatal Normal"

¿Quieres que proceda con la creación de la estructura de carpetas y la plantilla?
