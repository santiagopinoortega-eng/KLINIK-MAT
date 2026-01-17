# 📚 Guía Completa para Creación de Casos Clínicos KLINIK-MAT

**Versión:** 2.1  
**Fecha:** Enero 17, 2026  
**Sistema:** 480 casos / 6 áreas / 24 subáreas

> 🔄 **ACTUALIZACIÓN IMPORTANTE - Enero 2026:**
> 
> **Cambios en la estructura de archivos:**
> - ✅ Archivos con extensión `.json5` (permite comentarios y sintaxis flexible)
> - ✅ Campo `referencias` reemplaza `referenciasBibliograficas`
> - ✅ Campo `guia` reemplaza `respuestaModelo` en preguntas SHORT
> - ✅ `criteriosEvaluacion` ahora es array simple de strings
> - ✅ Vignettes sin template literals (usar `"texto\n\npárrafo"`)
> 
> **Ver casos de ejemplo en:** `prisma/cases/TEMA1-EMBARAZO-PRENATAL/01-control-normal/cases.json5`

---

## ⚠️ ERRORES COMUNES A EVITAR

### 🚫 NUNCA Uses Estos Marcadores

**PROHIBIDO en archivos JSON5:**
```
❌ [cite_start]
❌ [cite: 52]
❌ [cite: 16, 52]
❌ Cualquier variante de [cite:...]
```

Estos marcadores provienen de herramientas de IA con referencias a fuentes y **ROMPEN** la sintaxis JSON5.

### ✅ Formato Correcto de Strings

```json5
// ❌ INCORRECTO (con marcadores):
objetivosAprendizaje: [
  [cite_start]"Identificar componentes [cite: 52]",
  [cite_start]"Reconocer importancia [cite: 16, 52]"
]

// ✅ CORRECTO (sin marcadores):
objetivosAprendizaje: [
  "Identificar componentes del ingreso prenatal según MINSAL",
  "Reconocer la importancia de la suplementación con ácido fólico"
]
```

### ✅ Formato Correcto de Referencias

```json5
// ❌ INCORRECTO:
referencias: [
  [cite_start]"Guía Perinatal MINSAL 2015 [cite: 52]",
  [cite_start]"Schwarcz [cite: 46]"
]

// ✅ CORRECTO:
referencias: [
  "Guía Perinatal MINSAL 2015",
  "Schwarcz, R. Obstetricia. 7ª ed. Buenos Aires: Ed. El Ateneo"
]
```

### 🔍 Validación del Archivo

Siempre valida tu archivo antes de confirmar:

```bash
# Debe mostrar todos tus casos sin errores
npm run validate:cases

# O manualmente con Node
node -e "const JSON5 = require('json5'); const fs = require('fs'); const cases = JSON5.parse(fs.readFileSync('prisma/cases/TEMA1-EMBARAZO-PRENATAL/01-control-normal/cases.json5', 'utf8')); console.log('✅ Válido:', cases.length, 'casos');"
```

### 📝 Reglas de Sintaxis JSON5

1. **Strings**: Usa comillas simples `'texto'` o dobles `"texto"`
2. **Arrays**: Cierres correctos con corchetes `]`
3. **Objetos**: Cierres correctos con llaves `}`
4. **Comentarios**: Usa `//` para comentarios de línea
5. **Comas finales**: Permitidas pero no requeridas
6. **Sin marcadores especiales**: Nada de `[cite_start]`, `[cite: XX]`, etc.

---

## 🎯 FILOSOFÍA Y OBJETIVOS

### Principios Fundamentales

1. **Aprendizaje Progresivo**
   - Los casos avanzan de lo simple a lo complejo
   - Cada nivel construye sobre el anterior
   - Refuerzo de conceptos clave

2. **Toma de Decisiones Clínicas**
   - Énfasis en el "por qué" no solo el "qué"
   - Justificación de cada decisión
   - Análisis de alternativas

3. **Integración de Materias**
   - Conexión entre ciencias básicas y clínicas
   - Fisiopatología → Diagnóstico → Tratamiento
   - Referencias cruzadas entre áreas

4. **Pensamiento Clínico Estructurado**
   - Razonamiento paso a paso
   - Análisis de múltiples variables
   - Consideración de diagnósticos diferenciales

---

## 📊 ESTRUCTURA DE DIFICULTADES

### BAJA (Nivel 1): 6 Preguntas MCQ

**Objetivo:** Reconocer patrones clínicos fundamentales

**Características:**
- Presentación típica de patologías comunes
- Signos y síntomas clásicos
- Diagnósticos directos
- Tratamientos estándar

**Ejemplo de preguntas:**
- Identificación de signos/síntomas
- Valores de laboratorio normales/anormales evidentes
- Primeros pasos en el manejo
- Factores de riesgo básicos

**Estructura:**
```
6 preguntas MCQ (4 opciones cada una)
→ Todas con explicación detallada (feedback inmediato)
→ Objetivos de aprendizaje (3-4 objetivos)
→ Feedback dinámico final (bajo/medio/alto según %)
```

---

### MEDIA (Nivel 2): 6 MCQ + 1 SHORT

**Objetivo:** Aplicar conocimiento y tomar decisiones basadas en evidencia

**Características:**
- Casos con datos que requieren interpretación
- Necesidad de aplicar criterios diagnósticos
- Decisiones terapéuticas justificadas
- Indicaciones de estudios complementarios

**Ejemplo de preguntas MCQ:**
- Interpretación de exámenes (no solo identificar anormal/normal)
- Aplicación de criterios diagnósticos
- Selección de tratamiento según contexto
- Identificación de complicaciones

**Pregunta SHORT:**
- Requiere explicación de criterios clave
- Justificación de decisión clínica
- Análisis de 2-3 factores relevantes

**Estructura:**
```
6 preguntas MCQ + 1 SHORT
→ SHORT con 3-4 criterios de evaluación
→ Al menos 2 criterios esenciales
→ Respuesta modelo de referencia
```

**Ejemplo SHORT (Nivel Medio):**
```json5
{
  tipo: 'short',
  enunciado: '¿Cuál es el criterio diagnóstico más importante para confirmar preeclampsia en esta paciente y por qué?',
  criteriosEvaluacion: [
    'presión arterial',
    '140/90',
    'dos tomas',
    'proteinuria',
    '300 mg',
    '20 semanas',
    'gestación'
  ],
  guia: 'Los criterios diagnósticos principales son: 1) PA ≥140/90 mmHg en dos ocasiones separadas por al menos 4 horas, Y 2) proteinuria significativa (≥300 mg/24h), después de las 20 semanas de gestación. Ambos criterios deben estar presentes para el diagnóstico.'
}
```

---

### ALTA (Nivel 3): 7 MCQ + 1 SHORT

**Objetivo:** Integrar materias y manejar casos complejos

**Características:**
- Casos con múltiples comorbilidades
- Presentaciones atípicas
- Complicaciones que requieren manejo avanzado
- Integración de múltiples áreas del conocimiento

**Ejemplo de preguntas MCQ:**
- Diagnóstico diferencial complejo
- Manejo de complicaciones
- Interpretación de estudios avanzados
- Decisiones en situaciones límite
- Interacciones farmacológicas
- Consideraciones éticas

**Pregunta SHORT:**
- Requiere integración de 3-4 factores
- Justificación compleja de decisiones
- Análisis de riesgo-beneficio
- Consideración de alternativas

**Estructura:**
```
7 preguntas MCQ + 1 SHORT
→ SHORT con 4-6 criterios de evaluación
→ Al menos 3 criterios esenciales
→ Respuesta modelo completa
```

**Ejemplo SHORT (Nivel Alto):**
```json
{
  "tipo": "short",
  "enunciado": "Justifica tu decisión de interrumpir el embarazo ahora en lugar de intentar manejo expectante. Menciona al menos 3 factores clave que influyen en tu decisión y cómo equilibras el riesgo materno versus el beneficio fetal.",
  "criteriosEvaluacion": [
    {
      "criterio": "Identifica criterios de severidad materna (PA ≥160/110, síntomas neurológicos, alteración hepática/renal)",
      "puntos": 3,
      "esencial": true
    },
    {
      "criterio": "Evalúa compromiso fetal (RCIU, oligoamnios, Doppler alterado)",
      "puntos": 2,
      "esencial": true
    },
    {
      "criterio": "Considera edad gestacional y madurez pulmonar fetal",
  criteriosEvaluacion: [
    'preeclampsia severa',
    'compromiso órgano blanco',
    'RCIU',
    'oligoamnios',
    'doppler anormal',
    'edad gestacional',
    '34 semanas',
    'balance riesgo-beneficio',
    'interrupción'
  ],
  guia: 'La decisión de interrumpir se fundamenta en: 1) Presencia de criterios de preeclampsia severa con compromiso de órgano blanco (PA persistentemente >160/110 a pesar de tratamiento, cefalea intensa, epigastralgia, transaminasas elevadas), que pone en riesgo vital a la madre; 2) Compromiso fetal demostrado por RCIU <p3, oligoamnios severo (ILA 3cm) y Doppler umbilical con flujo diastólico reverso, indicando redistribución hemodinámica fetal crítica; 3) Edad gestacional de 34+2 semanas, donde el riesgo de prematuridad con corticoides completos es menor que el riesgo de continuar embarazo. El manejo expectante estaría indicado solo si hubiera estabilidad materna y bienestar fetal adecuado, lo cual no existe en este caso. El balance riesgo-beneficio claramente favorece la interrupción.'
}
```

---

## 📝 PROCESO DE CREACIÓN PASO A PASO

### Paso 0: Sistema de Feedback y Objetivos (IMPORTANTE)

#### 📚 Objetivos de Aprendizaje - Pedagogía Moderna

**¿Por qué se muestran AL INICIO del caso?**

Siguiendo las mejores prácticas de plataformas educativas modernas (Coursera, Khan Academy, UpToDate), los objetivos se presentan **ANTES de comenzar** porque:

✅ **Aprendizaje Dirigido:** El estudiante sabe qué conceptos debe dominar
✅ **Enfoque Atencional:** Dirige la atención a los puntos clave durante el caso
✅ **Metacognición:** Permite al estudiante autoevaluar su comprensión
✅ **Motivación:** Crea expectativas claras de logro

**Estructura de buenos objetivos:**

```json5
objetivosAprendizaje: [
  'Identificar los componentes del ingreso prenatal según MINSAL',
  'Reconocer la suplementación inicial básica',
  'Comprender la importancia de la detección de factores de riesgo'
]
```

**Características de objetivos efectivos:**

1. **Verbos de acción medibles** (taxonomía de Bloom):
   - 🔵 Nivel básico: Identificar, Reconocer, Enumerar, Describir
   - 🟢 Nivel medio: Aplicar, Interpretar, Analizar, Clasificar
   - 🔴 Nivel alto: Evaluar, Justificar, Integrar, Diseñar

2. **Específicos y alcanzables:**
   - ✅ "Identificar los criterios diagnósticos de preeclampsia"
   - ❌ "Entender la preeclampsia" (muy vago)

3. **Alineados con dificultad:**
   - BAJA: 3 objetivos básicos (identificar, reconocer)
   - MEDIA: 3-4 objetivos aplicados (aplicar, interpretar)
   - ALTA: 4 objetivos complejos (evaluar, integrar)

4. **Relevantes clínicamente:**
   - Conectados con práctica real
   - Útiles para EUNACOM/rotaciones
   - Basados en guías actuales

**Ejemplo por nivel de dificultad:**

**BAJA:**
```json5
objetivosAprendizaje: [
  'Identificar los signos clínicos de trabajo de parto',
  'Reconocer las indicaciones de hospitalización',
  'Describir el manejo inicial en APS'
]
```

**MEDIA:**
```json5
objetivosAprendizaje: [
  'Aplicar los criterios de Bishop para evaluar madurez cervical',
  'Interpretar la monitorización fetal intraparto',
  'Clasificar el riesgo según la curva de Friedman',
  'Decidir el momento de derivación a nivel secundario'
]
```

**ALTA:**
```json5
objetivosAprendizaje: [
  'Evaluar el balance riesgo-beneficio de inducción vs cesárea',
  'Integrar datos maternos y fetales para tomar decisiones complejas',
  'Justificar el manejo de distocia con comorbilidad materna',
  'Diseñar un plan de parto individualizado en situación de riesgo'
]
```

---

#### 🔄 Sistema de Feedback (2 niveles)

1. **Feedback Inmediato** (`explicacion` en cada opción) ✅ OBLIGATORIO
   - Se muestra al seleccionar cada opción
   - Explica por qué es correcta/incorrecta
   - Razonamiento clínico educativo

2. **Feedback Dinámico Final** (`feedbackDinamico` del caso) ✅ OBLIGATORIO
   - Mensaje personalizado según porcentaje obtenido
   - Estructura: `{ bajo: '...', medio: '...', alto: '...' }`
   - Se muestra solo en pantalla final

---

#### 📊 Flujo Completo del Estudiante

```
┌─────────────────────────────────────┐
│ 1️⃣ INICIO - Objetivos              │
├─────────────────────────────────────┤
│ 📚 Objetivos de Aprendizaje:        │
│ • Objetivo 1                        │
│ • Objetivo 2                        │
│ • Objetivo 3                        │
│                                     │
│ 📖 Vignette (escenario clínico)     │
│ [Botón: Comenzar]                   │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ 2️⃣ DURANTE - Preguntas             │
├─────────────────────────────────────┤
│ Pregunta 1 → Responde               │
│ ✅/❌ Explicación inmediata          │
│ [Botón: Siguiente]                  │
│                                     │
│ Pregunta 2 → Responde               │
│ ✅/❌ Explicación inmediata          │
│ [Botón: Siguiente]                  │
│ ...                                 │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ 3️⃣ FINAL - Resultados              │
├─────────────────────────────────────┤
│ 🏆 Puntaje: 85% - Excelente         │
│                                     │
│ 💬 Feedback personalizado:          │
│ "¡Excelente! Dominas X..."          │
│                                     │
│ 📚 Objetivos del caso (repaso):     │
│ ✓ Objetivo 1 - Logrado              │
│ ✓ Objetivo 2 - Logrado              │
│ ✓ Objetivo 3 - Logrado              │
│                                     │
│ [Reintentar] [Otros casos]          │
└─────────────────────────────────────┘
```

**Nota:** Los objetivos se muestran **dos veces**:
- **Al inicio:** Para enfocar el aprendizaje
- **Al final:** Para autoevaluación y cierre del ciclo

**Plantilla completa con objetivos:**
```json5
{
  // ============================================================================
  // METADATOS
  // ============================================================================
  id: 'tema1-01-caso-001',
  titulo: 'Control Prenatal Normal',
  area: 'Tema 1: Embarazo y Control Prenatal',
  modulo: '1.1 Control Prenatal Normal',
  dificultad: '1',
  
  // ============================================================================
  // OBJETIVOS DE APRENDIZAJE (se muestran AL INICIO)
  // ============================================================================
  objetivosAprendizaje: [
    'Identificar los componentes del ingreso prenatal según MINSAL',
    'Reconocer la suplementación inicial básica (ácido fólico)',
    'Comprender la importancia de la detección de factores de riesgo'
  ],
  
  // ============================================================================
  // ESCENARIO CLÍNICO
  // ============================================================================
  vignette: `M.J.P., 24 años, primigesta, sin antecedentes mórbidos personales.

MOTIVO DE CONSULTA: Acude para confirmar embarazo y comenzar controles.

ANAMNESIS: Relata FUR operacional confiable hace 8 semanas. Refiere náuseas matutinas leves y tensión mamaria. No refiere sangrado ni dolor abdominal.

EXAMEN FÍSICO:
• PA: 110/70 mmHg, FC: 72 lpm, T°: 36.6°C
• Peso: 62 kg, Talla: 1.60m (IMC: 24.2 kg/m²)
• Examen obstétrico: Útero compatible con amenorrea

EXÁMENES: Test de embarazo en orina (+)`,
  
  // ============================================================================
  // PREGUNTAS
  // ============================================================================
  pasos: [
    {
      enunciado: 'Según la Guía Perinatal MINSAL, ¿cuál es el objetivo principal del primer control prenatal?',
      opciones: [
        {
          texto: 'Diagnosticar la edad gestacional y evaluar riesgo biopsicosocial',
          esCorrecta: true,
          explicacion: '✅ CORRECTO. El ingreso busca establecer la cronología del embarazo, identificar factores de riesgo y planificar el seguimiento integral según guía MINSAL 2015.'
        },
        {
          texto: 'Realizar la primera ecografía de screening',
          esCorrecta: false,
          explicacion: '❌ INCORRECTO. Si bien se solicita ecografía, el control de ingreso tiene objetivos más amplios que solo el examen ecográfico.'
        },
        {
          texto: 'Indicar reposo preventivo',
          esCorrecta: false,
          explicacion: '❌ INCORRECTO. El embarazo es proceso fisiológico; el reposo solo se indica ante patología específica.'
        },
        {
          texto: 'Derivar inmediatamente al nivel secundario',
          esCorrecta: false,
          explicacion: '❌ INCORRECTO. La derivación solo si hay factores de riesgo alto; esta paciente es bajo riesgo.'
        }
      ]
    }
    // ... más preguntas (total 6 para dificultad 1)
  ],
  
  // ============================================================================
  // FEEDBACK DINÁMICO (se muestra AL FINAL)
  // ============================================================================
  feedbackDinamico: {
    bajo: 'Repasa los fundamentos del control prenatal en la Guía Perinatal MINSAL 2015. Enfócate en: objetivos del ingreso, suplementación básica (ácido fólico), y screening de laboratorio inicial.',
    medio: 'Buen avance en el protocolo de ingreso prenatal. Refuerza los detalles específicos: dosis de suplementación, timing de screening de diabetes gestacional, y las 3 causales de la ley IVE.',
    alto: '¡Excelente dominio del protocolo de ingreso prenatal! Conoces bien los objetivos, la batería de exámenes, la suplementación y el marco legal. Estás muy bien preparado para la APS.'
  },
  
  // ============================================================================
  // METADATA ADICIONAL (OPCIONAL)
  // ============================================================================
  competenciasEvaluadas: ['Gestación normal', 'Marco legal (IVE)', 'Inmunización'],
  referencias: ['Guía Perinatal MINSAL 2015', 'Manual de Obstetricia PUC']
}
```

---

### Paso 1: Seleccionar Área y Subárea

```typescript
// Consultar lib/constants/clinical-cases.ts
const area = CLINICAL_AREAS.EMBARAZO_PRENATAL;
const subarea = area.subareas.CONTROL_NORMAL;
```

### Paso 2: Determinar Dificultad

**Criterios de decisión:**

- **BAJA:** ¿Es una presentación típica de patología común?
- **MEDIA:** ¿Requiere aplicar criterios o interpretar datos?
- **ALTA:** ¿Presenta comorbilidades o complicaciones?

### Paso 3: Construir el Escenario Clínico

**Elementos esenciales:**

1. **Datos demográficos:**
   - Edad, sexo
   - Antecedentes relevantes (mórbidos, quirúrgicos, familiares)
   - Antecedentes obstétricos si aplica (G-P-A)

2. **Motivo de consulta:**
   - Síntoma principal
   - Tiempo de evolución
   - Características del síntoma

3. **Historia clínica:**
   - Anamnesis próxima detallada
   - Síntomas asociados
   - Factores agravantes/atenuantes

4. **Examen físico:**
   - Signos vitales completos
   - Examen general
   - Examen segmentario dirigido
   - Hallazgos positivos y negativos relevantes

5. **Exámenes complementarios:**
   - Laboratorio (con valores de referencia)
   - Imágenes (describir hallazgos)
   - Otros estudios según caso

### Paso 4: Diseñar las Preguntas MCQ

**Estructura de pregunta MCQ ideal:**

```json
{
  "id": "nanoid()",
  "order": 1,
  "tipo": "mcq",
  "enunciado": "Pregunta clara y específica",
  "opciones": [
    {
      "id": "nanoid()",
      "texto": "Opción correcta",
      "esCorrecta": true,
      "explicacion": "Explicación detallada de POR QUÉ es correcta, con referencias a evidencia, guías clínicas o fisiopatología",
      "order": 1
    },
    {
      "id": "nanoid()",
      "texto": "Distractor plausible 1",
      "esCorrecta": false,
      "explicacion": "Explicación de por qué es incorrecta y en qué situación podría considerarse",
      "order": 2
    }
    // ... 3-4 opciones más
  ]
}
```

**Tipos de preguntas MCQ recomendadas:**

1. **Diagnóstico:** ¿Cuál es el diagnóstico más probable?
2. **Estudio complementario:** ¿Qué examen solicitarías primero?
3. **Tratamiento:** ¿Cuál es el manejo inicial apropiado?
4. **Interpretación:** ¿Cómo interpretas este hallazgo?
5. **Complicación:** ¿Cuál es la complicación más probable?
6. **Pronóstico:** ¿Qué factor indica peor pronóstico?
7. **Prevención:** ¿Qué medida preventiva es más efectiva?

### Paso 5: Diseñar la Pregunta SHORT (Niveles 2 y 3)

**Elementos de una buena pregunta SHORT:**

1. **Enunciado claro** que especifique qué se espera
2. **Criterios de evaluación** específicos y medibles
3. **Puntos asignados** a cada criterio
4. **Identificar criterios esenciales** vs complementarios
5. **Respuesta modelo** completa y bien estructurada

**Ejemplo de criterios de evaluación:**

```json
{
  "criteriosEvaluacion": [
    {
      "criterio": "Criterio específico y medible",
      "puntos": 3,
      "esencial": true,  // Debe estar presente para considerar respuesta correcta
      "keywords": ["palabra", "clave"]  // Opcional: para evaluación automática
    }
  ]
}
```

---

## 🔍 CHECKLIST DE CALIDAD

### Antes de finalizar un caso, verifica:

#### ✅ Estructura General
- [ ] ID único y descriptivo
- [ ] Título claro y específico
- [ ] Área y módulo correctos
- [ ] Dificultad apropiada al contenido
- [ ] Viñeta clínica completa y realista
- [ ] Objetivos de aprendizaje definidos (3-4 objetivos específicos)
- [ ] Feedback dinámico con 3 niveles (bajo/medio/alto)

#### ✅ Escenario Clínico
- [ ] Datos demográficos completos
- [ ] Antecedentes relevantes incluidos
- [ ] Motivo de consulta claro
- [ ] Examen físico con signos vitales
- [ ] Exámenes complementarios con valores de referencia
- [ ] Información suficiente para responder preguntas
- [ ] Sin información redundante o irrelevante

#### ✅ Preguntas MCQ
- [ ] Número correcto según dificultad (6 o 7)
- [ ] Enunciados claros y sin ambigüedad
- [ ] 4-5 opciones por pregunta
- [ ] Una sola opción correcta claramente definida
- [ ] Distractores plausibles y bien pensados
- [ ] Explicación detallada en CADA opción
- [ ] Explicaciones educativas, no solo "correcto/incorrecto"
- [ ] Referencias a guías, evidencia o fisiopatología

#### ✅ Pregunta SHORT (si aplica)
- [ ] Enunciado que especifica claramente qué se espera
- [ ] 3-4 criterios para nivel medio / 4-6 para nivel alto
- [ ] Al menos 2-3 criterios marcados como esenciales
- [ ] Puntos asignados apropiadamente
- [ ] Respuesta modelo completa y bien redactada
- [ ] Pregunta fomenta razonamiento, no memorización

#### ✅ Integración y Pedagogía
- [ ] Caso integra múltiples áreas del conocimiento
- [ ] Fomenta toma de decisiones
- [ ] Promueve pensamiento clínico
- [ ] Nivel apropiado para estudiantes objetivo
- [ ] Realismo clínico (no situaciones artificiales)

---

## 🎓 MEJORES PRÁCTICAS

### DO (Hacer)

✅ **Usa casos reales o realistas**
- Basados en experiencia clínica real
- Presentaciones típicas o importantes
- Datos coherentes y lógicos

✅ **Sé específico con los datos**
- Valores de laboratorio con unidades y rangos
- Signos vitales completos
- Descripciones precisas de hallazgos

✅ **Explica el "por qué"**
- Cada respuesta debe educar
- Conecta con fisiopatología
- Referencia a guías o evidencia

✅ **Diseña buenos distractores**
- Opciones plausibles
- Errores comunes de estudiantes
- Diagnósticos diferenciales válidos

✅ **Fomenta el razonamiento**
- Preguntas que requieren análisis
- Integración de información
- Aplicación de criterios

### DON'T (No hacer)

❌ **Casos irrealistas o artificiosos**
- Presentaciones que nunca verías en clínica
- Datos que no tienen sentido juntos
- Situaciones forzadas para incluir tema

❌ **Preguntas de memorización pura**
- "¿Cuál es la dosis de...?"  (a menos que sea crítica)
- Listas de clasificaciones sin contexto
- Datos sin relevancia clínica

❌ **Distractores obvios**
- Opciones claramente incorrectas
- Respuestas absurdas
- Diagnósticos sin relación al caso

❌ **Ambigüedad**
- Preguntas con múltiples interpretaciones
- Términos vagos o poco específicos
- Información contradictoria

❌ **Información innecesaria**
- Datos que no aportan al caso
- Detalles irrelevantes que confunden
- Sobre-descripción sin propósito

---

## 📚 RECURSOS Y REFERENCIAS

### Fuentes de Información Recomendadas

1. **Guías Clínicas:**
   - Guías Clínicas MINSAL (Chile)
   - Guías de Práctica Clínica GES
   - NICE Guidelines
   - ACOG Practice Bulletins

2. **Libros Gold Standard:**
   - Williams Obstetrics
   - Novak's Gynecology
   - Avery's Neonatology
   - [Agregar libros específicos de tu universidad]

3. **Programas Universitarios:**
   - Syllabus de tu universidad
   - Material de clases y seminarios
   - Casos clínicos presentados en rotaciones
4. **cuadernos notebook lm:**   

### Validación de Contenido

Antes de finalizar, valida contra:
- ✅ Guías clínicas actualizadas
- ✅ Consensos de sociedades científicas
- ✅ Literatura revisada por pares
- ✅ Protocolos locales si aplica

---

## 🛠️ HERRAMIENTAS DE APOYO

### Script de Validación

```bash
# Validar estructura de un caso
npm run validate:case prisma/cases/OBSTETRICIA/01-embarazo-prenatal/01-control-normal/cpn-001.json5

# Validar todos los casos de una subárea
npm run validate:subarea OBSTETRICIA/01-embarazo-prenatal/01-control-normal

# Validar todos los casos
npm run validate:all
```

### Funciones Útiles

```typescript
import { validateCaseStructure } from '@/lib/constants/clinical-cases';

const { valid, errors } = validateCaseStructure(caseData);
if (!valid) {
  console.error('Errores encontrados:', errors);
}
```

---

## 📊 SEGUIMIENTO DE PROGRESO

### Por Subárea

Registra tu progreso en cada subárea:

```
Subárea: Control Prenatal Normal (20 casos)
├── Baja (7 casos):    [✓✓✓✓✓✓□] 6/7 completados
├── Media (8 casos):   [✓✓✓□□□□□] 3/8 completados
└── Alta (5 casos):    [□□□□□] 0/5 completados
Total: 9/20 (45%)
```

### Por Área

```
Área: Embarazo y Control Prenatal (80 casos)
├── Control Normal:        9/20  (45%)
├── Patología Embarazo:    0/20  (0%)
├── Diagnóstico Prenatal:  0/20  (0%)
└── Complicaciones:        0/20  (0%)
Total: 9/80 (11.25%)
```

---

## 🎯 PRÓXIMOS PASOS

1. Revisar esta guía completamente
2. Estudiar casos de ejemplo existentes
3. Crear primer caso de nivel BAJA
4. Validar con script automático
5. Revisar con par (si disponible)
6. Iterar y mejorar
7. Continuar con casos de nivel MEDIA y ALTA

---

## 📞 SOPORTE

Si tienes dudas o necesitas ayuda:
- Revisa casos de ejemplo existentes
- Consulta las constantes en `lib/constants/clinical-cases.ts`
- Usa el script de validación frecuentemente
- Mantén consistencia con casos ya aprobados

---

**¡Éxito en la creación de casos clínicos de calidad!** 🚀
