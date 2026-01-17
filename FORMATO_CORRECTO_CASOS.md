# 📝 FORMATO CORRECTO PARA CASOS CLÍNICOS

**Última actualización:** Enero 17, 2026  
**Versión:** 2.0 - Estructura Simplificada

> ⚠️ **CAMBIOS IMPORTANTES:**
> - Extensión de archivos: `.json5` (no `.json`)
> - Campo `referencias` (no `referenciasBibliograficas`)
> - Campo `guia` en SHORT (no `respuestaModelo`)
> - `criteriosEvaluacion` como array simple de strings
> - Vignettes sin template literals (usar `\n\n` para párrafos)

---

## 🎯 LENGUAJE: JSON5 (NO JSON puro)

Los archivos de casos usan **JSON5** que permite sintaxis más flexible que JSON estándar.

---

## 🎓 SISTEMA DE FEEDBACK Y EVALUACIÓN SIMPLIFICADO

### 📋 OBJETIVOS DE APRENDIZAJE

Cada caso clínico debe especificar sus objetivos educativos que se mostrarán al estudiante:

```json5
objetivosAprendizaje: [
  'Identificar los componentes del ingreso prenatal según MINSAL',
  'Reconocer la suplementación inicial básica',
  'Comprender la importancia de la detección de factores de riesgo'
]
```

**Se muestran:**
- Al inicio del caso (antes de comenzar las preguntas)
- En la pantalla de resultados finales
- Ayudan al estudiante a enfocarse en los conceptos clave

---

### 1️⃣ Feedback Inmediato (POR OPCIÓN)

Cada opción MCQ tiene su propia explicación que se muestra inmediatamente:

```json5
opciones: [
  {
    texto: 'Respuesta correcta',
    esCorrecta: true,
    explicacion: '✅ ESTA es la explicación inmediata que ve el estudiante al seleccionar'
  },
  {
    texto: 'Distractor',
    esCorrecta: false,
    explicacion: '❌ Por qué esta opción es incorrecta (feedback inmediato)'
  }
]
```

### ✅ Evaluación Final con Puntaje

Al terminar todas las preguntas, el sistema:

1. **Calcula el puntaje total:**
   - MCQ: 1 punto cada una
   - SHORT: `puntosMaximos` (default 2 puntos)

2. **Muestra porcentaje:** `(puntosObtenidos / puntosMaximos) × 100`

3. **Categoriza el resultado** (Sistema de 4 niveles - Enero 2026):
   - **75-100%**: 🏆 Excelente - Dominas el contenido
   - **50-74%**: ✓ Bien - Buen trabajo, refuerza detalles
   - **25-49%**: ⚠️ Mejorable - Vas por buen camino, sigue practicando
   - **0-24%**: 📝 Necesitas Revisar - Repasa los fundamentos antes de continuar

4. **Muestra feedback motivacional adaptativo** según nivel

5. **Guarda en la BD** para historial del estudiante

---

## ✅ SINTAXIS JSON5 CORRECTA

### Ventajas de JSON5:
- ✅ **Comentarios permitidos** (`//` y `/* */`)
- ✅ **Keys sin comillas** (más legible)
- ✅ **Trailing commas** (evita errores al agregar líneas)
- ✅ **Strings multilínea** con `\`
- ✅ **Más flexible y legible**

---

## 📄 PLANTILLA COMPLETA JSON5

```json5
// Archivo: prisma/cases/TEMA#-NOMBRE-AREA/##-nombre-modulo/cases.json
// NOTA: El archivo DEBE ser un ARRAY de casos, incluso si es un solo caso

[
  {
    // ============================================================================
    // 📋 METADATOS DEL CASO
    // ============================================================================
    
    id: 'tema1-01-ingreso-prenatal-001',  // Sin comillas en keys (JSON5)
    titulo: 'Ingreso a Control Prenatal en APS',
    area: 'Tema 1: Embarazo y Control Prenatal',
    modulo: '1.1 Control Prenatal Normal',
    dificultad: '1',  // IMPORTANTE: String, no número ('1', '2', o '3')
    
    // ============================================================================
    // 📖 ESCENARIO CLÍNICO - STRING SIMPLE
    // ============================================================================
    
    vignette: `Paciente: M.J.P., 24 años, primigesta, sin antecedentes mórbidos personales. Usuaria de CESFAM urbano.

Motivo de Consulta: Acude para "confirmar embarazo" y comenzar controles.

Anamnesis: Relata FUR operacional confiable hace 8 semanas. Refiere náuseas matutinas leves y tensión mamaria. No refiere sangrado ni dolor abdominal. Sin hábitos tabáquicos ni alcohol.

Examen Físico:
- PA: 110/70 mmHg, FC: 72 lpm, T°: 36.6°C
- Peso: 62 kg, Talla: 1.60m (IMC: 24.2 kg/m²)
- Examen obstétrico: Útero compatible con amenorrea, sin signos de alarma

Exámenes:
- Test de embarazo en orina (+)
- Pendiente: Batería de exámenes de ingreso según norma

Contexto: Vive con su pareja, red de apoyo presente, nivel educacional completo.`,

    // ============================================================================
    // 🎯 PREGUNTAS (campo "pasos" para el seed)
    // ============================================================================
    
    pasos: [
      {
        enunciado: 'Según la Guía Perinatal MINSAL, ¿cuál es el objetivo principal del primer control prenatal (ingreso)?',
        
        // OPCIONES CON FEEDBACK INMEDIATO ✨
        // La "explicacion" se muestra INMEDIATAMENTE al seleccionar
        opciones: [
          {
            texto: 'Diagnosticar la edad gestacional y evaluar riesgo biopsicosocial',
            esCorrecta: true,
            explicacion: '✅ CORRECTO. El ingreso busca establecer la cronología del embarazo, identificar factores de riesgo y planificar el seguimiento integral según guía MINSAL 2015.',
          },
          {
            texto: 'Realizar la primera ecografía de screening de 11-14 semanas',
            esCorrecta: false,
            explicacion: '❌ INCORRECTO. Si bien se solicita ecografía, el control de ingreso tiene objetivos más amplios que solo el examen ecográfico.',
          },
          {
            texto: 'Indicar reposo preventivo a toda embarazada',
            esCorrecta: false,
            explicacion: '❌ INCORRECTO. El embarazo es proceso fisiológico; el reposo solo se indica ante patología específica.',
          },
          {
            texto: 'Derivar inmediatamente al nivel secundario (ARO)',
            esCorrecta: false,
            explicacion: '❌ INCORRECTO. La derivación a ARO solo si hay factores de riesgo alto; esta paciente es bajo riesgo.',
          },
        ],
      },
      // ... más preguntas MCQ (total 6 para dificultad 1)
    ],
    
    // ============================================================================
    // 🎬 FEEDBACK DINÁMICO FINAL (OBLIGATORIO)
    // ============================================================================
    
    feedbackDinamico: {
      bajo: 'Repasa los fundamentos del control prenatal. Revisa la Guía MINSAL 2015 y enfócate en los objetivos del ingreso y la batería de exámenes inicial.',
      medio: 'Buen trabajo. Refuerza los detalles específicos: dosis de suplementación, timing de screening, y causales legales IVE.',
      alto: '¡Excelente! Dominas el protocolo de ingreso prenatal. Conoces bien los objetivos, exámenes, suplementación y marco legal.'
    },
    
    // ============================================================================
    // 📚 METADATA EDUCATIVA (OPCIONAL)
    // ============================================================================
    
    objetivosAprendizaje: [
      'Identificar los componentes del ingreso prenatal según MINSAL',
      'Reconocer la suplementación inicial básica',
      'Comprender la importancia de la detección de factores de riesgo',
    ],
    
    competenciasEvaluadas: [
      'Gestación normal',
      'Marco legal (IVE)',
      'Inmunización en el embarazo',
    ],
    
    referencias: [
      'Guía Perinatal MINSAL 2015',
      'Manual de Obstetricia y Ginecología PUC',
    ],
    
    // NOTA DOCENTE (campo para orientación del evaluador)
    // Este campo NO se muestra al estudiante, es para el docente
    notasDocente: 'Enfocarse en la importancia de la empatía en el primer control y la correcta datación por FUR.',
  },
  // Más casos aquí si hubiera...
]
```

---

## 📊 FLUJO COMPLETO AL ESTUDIANTE

### 📋 **AL INICIO** - Objetivos de aprendizaje

Antes de comenzar, el estudiante ve:
- 📚 **Objetivos del caso** - Qué conceptos se evaluarán
- 🎯 **Competencias específicas** - Área de conocimiento
- 📖 **Vignette del caso** - Escenario clínico completo

**Ejemplo:**
```
📚 Objetivos de Aprendizaje:
• Identificar los componentes del ingreso prenatal según MINSAL
• Reconocer la suplementación inicial básica  
• Comprender la importancia de la detección de factores de riesgo
```

---

### 1️⃣ **FEEDBACK INMEDIATO** (al responder cada pregunta)

Cuando el estudiante selecciona una opción:
- ✅ Se muestra la `explicacion` de la opción seleccionada
- ✅ Indica si es correcta o incorrecta
- ✅ Explica el razonamiento clínico

**Ejemplo:**
```
Seleccionaste: "Derivar inmediatamente a ARO"

❌ INCORRECTO. La derivación a ARO solo se realiza si hay 
factores de riesgo alto. Esta paciente presenta perfil de bajo riesgo.
```

### 2️⃣ **EVALUACIÓN FINAL** (al terminar todas las preguntas)

El sistema calcula automáticamente:

**Puntaje:**
```
MCQ correctas:  4/6 = 4 puntos
SHORT:          1.5/2 = 1.5 puntos
───────────────────────────────
TOTAL:          5.5/8 = 69%
```

**Categorización (Sistema de 4 Niveles):**
- 🏆 **75-100%**: Excelente - Dominas el contenido
- ✓ **50-74%**: Bien - Buen trabajo, refuerza detalles
- ⚠️ **25-49%**: Mejorable - Vas por buen camino
- 📝 **0-24%**: Necesitas Revisar - Repasa los fundamentos

**Mensaje motivacional (según feedbackDinamico):**

El sistema usa el campo `feedbackDinamico` del caso:
- **75-100%** → muestra `feedbackDinamico.alto`
- **50-74%** → muestra `feedbackDinamico.medio`  
- **25-49%** → muestra `feedbackDinamico.bajo`
- **0-24%** → mensaje genérico

**Ejemplo (69% = medio):**
```
✓ ¡Bien hecho!

Obtuviste 5.5 de 8 puntos (69%)

Buen trabajo. Refuerza los detalles específicos: dosis de 
suplementación, timing de screening, y causales legales IVE.

💪 Sigue practicando para alcanzar la excelencia.
```

**Guarda en historial:**
- ✅ Resultado guardado en tu perfil
- ✅ Visible en estadísticas por área
- ✅ Cuenta para progreso general

---

## 🎯 MEJORES PRÁCTICAS PARA FEEDBACK

### ✅ Explicaciones de Opciones (FEEDBACK INMEDIATO)

**HACER:**
- ✅ Ser específico sobre POR QUÉ es correcta/incorrecta
- ✅ Referenciar guías clínicas o evidencia
- ✅ Conectar con fisiopatología
- ✅ Mencionar cuándo SÍ estaría indicada (si aplica)
- ✅ Usar emojis para claridad visual (✅ ❌)

**Ejemplo BUENO:**
```json5
explicacion: '❌ INCORRECTO. La dosis de 4 mg de ácido fólico está indicada 
solo en mujeres con antecedente de hijo previo con defecto del tubo neural. 
Para población general de bajo riesgo, la dosis recomendada es 1 mg/día o 
0.4-0.8 mg/día según disponibilidad en CESFAM (Guía Perinatal MINSAL 2015).'
```

**Ejemplo MALO:**
```json5
explicacion: 'Incorrecto. La dosis es muy alta.'  // ❌ Muy vago, no educativo
```

### ✅ Feedback Dinámico Final (OBLIGATORIO)

El campo `feedbackDinamico` es **OBLIGATORIO** y personaliza el mensaje según desempeño.

**Estructura:**
```json5
feedbackDinamico: {
  bajo: 'Mensaje para 25-49% - Guía específica para mejorar',
  medio: 'Mensaje para 50-74% - Reforzar detalles',
  alto: 'Mensaje para 75-100% - Felicitación y validación'
}
```

**HACER:**
- ✅ Ser específico sobre QUÉ repasar (bajo/medio)
- ✅ Mencionar recursos concretos (guías, capítulos)
- ✅ Ser alentador pero realista
- ✅ Reconocer logros (alto)

**Ejemplo BUENO:**
```json5
feedbackDinamico: {
  bajo: 'Repasa los fundamentos del control prenatal en la Guía Perinatal MINSAL 2015. Enfócate en: objetivos del ingreso, suplementación básica (ácido fólico), y screening de laboratorio inicial.',
  medio: 'Buen avance. Refuerza los detalles específicos: dosis de suplementación, timing de screening de diabetes gestacional, y las 3 causales de la ley IVE 21.030.',
  alto: '¡Excelente dominio del protocolo de ingreso prenatal! Conoces bien los objetivos, la batería de exámenes, la suplementación y el marco legal.'
}
```

---

## 📦 CAMPOS DEL SCHEMA (REFERENCIA)

```prisma
model Case {
  feedbackDinamico Json?  @map("feedback_dinamico")  // Objeto {bajo, medio, alto}
  objetivos        String[] @default([])              // Array de objetivos
}

model Question {
  guia            String? @db.Text  // Para preguntas SHORT
}

model Option {
  explicacion     String? @db.Text  // Feedback INMEDIATO al seleccionar opción
}
```

**Nota:** El campo `notasDocente` solo existe en el JSON5 (no en BD), es para referencia interna del creador.

---

## 🚀 RESUMEN EJECUTIVO - SISTEMA SIMPLIFICADO

**2 NIVELES DE FEEDBACK:**

1. **INMEDIATO** (campo `explicacion` en cada opción) ✅ OBLIGATORIO
   - Se muestra al seleccionar cada opción
   - Explica por qué es correcta/incorrecta
   - Razonamiento clínico educativo
   - Es el feedback MÁS IMPORTANTE para el aprendizaje

2. **FINAL** (campo `feedbackDinamico` del caso) ✅ OBLIGATORIO
   - Puntaje total y porcentaje
   - Categorización en 4 niveles:
     * 75-100%: Excelente → muestra `feedbackDinamico.alto`
     * 50-74%: Bien → muestra `feedbackDinamico.medio`
     * 25-49%: Mejorable → muestra `feedbackDinamico.bajo`
     * 0-24%: Necesitas Revisar → mensaje genérico
   - Mensaje motivacional personalizado según desempeño
   - Objetivos de aprendizaje (repaso)
   - Guardado en historial

**OBJETIVOS DE APRENDIZAJE:** ✅ RECOMENDADO
- Campo `objetivosAprendizaje` (array de strings)
- Se muestran al inicio y al final
- Ayudan al estudiante a enfocarse

**CAMPO `notasDocente`:** ℹ️ OPCIONAL
- Solo en archivo JSON5 (no en BD)
- Para referencia interna del creador
- NO se muestra al estudiante

---

¡El sistema ya está optimizado para dar feedback inmediato y evaluar correctamente! 🎉


### ❌ ERROR 1: Archivo como objeto único
```json5
// ❌ INCORRECTO
{
  id: 'caso-001',
  titulo: '...',
}
```

```json5
// ✅ CORRECTO
[
  {
    id: 'caso-001',
    titulo: '...',
  }
]
```

### ❌ ERROR 2: Dificultad como número
```json5
// ❌ INCORRECTO
dificultad: 1,
```

```json5
// ✅ CORRECTO
dificultad: '1',  // String, no número
```

### ❌ ERROR 3: Vignette como objeto
```json5
// ❌ INCORRECTO
vignette: {
  paciente: 'M.J.P., 24 años',
  motivoConsulta: '...',
}
```

```json5
// ✅ CORRECTO
vignette: `Paciente: M.J.P., 24 años

Motivo: ...`,
```

### ❌ ERROR 4: Campo "questions" en vez de "pasos"
```json5
// ❌ INCORRECTO
questions: [ ... ]
```

```json5
// ✅ CORRECTO
pasos: [ ... ]
```

### ❌ ERROR 5: Campo "options" en vez de "opciones"
```json5
// ❌ INCORRECTO
opciones: [
  { text: '...', isCorrect: true }
]
```

```json5
// ✅ CORRECTO
opciones: [
  { texto: '...', esCorrecta: true }
]
```

---

## 🔄 PROCESO CORRECTO

### 1. Crear archivo en la ubicación correcta
```
prisma/cases/TEMA1-EMBARAZO-PRENATAL/01-control-normal/cases.json
```

### 2. Usar sintaxis JSON5
- Sin comillas en keys
- Comentarios permitidos
- Trailing commas permitidas

### 3. Estructura de archivo
```json5
[
  {
    // Metadatos
    id: 'tema#-##-descripcion-###',
    titulo: '...',
    area: 'Tema #: ...',
    modulo: '#.# ...',
    dificultad: '1',  // String: '1', '2', o '3'
    
    // Escenario
    vignette: `...`,  // String multilínea
    
    // Preguntas
    pasos: [
      {
        enunciado: '...',
        opciones: [
          {
            texto: '...',
            esCorrecta: true/false,
            explicacion: '...',
          }
        ]
      }
    ],
    
    // Metadata (opcional)
    objetivosAprendizaje: [...],
    competenciasEvaluadas: [...],
    referencias: [...],
    notasDocente: '...',
  }
]
```



---

## 📊 CAMPOS REQUERIDOS VS OPCIONALES

### ✅ REQUERIDOS (el seed falla sin estos):
- `id` (string, único)
- `titulo` (string)
- `dificultad` (string: '1', '2', o '3')
- `vignette` (string)
- `pasos` (array de objetos con `enunciado` y `opciones`)
- `feedbackDinamico` (objeto con `bajo`, `medio`, `alto`)

### 🔵 RECOMENDADOS (mejoran la calidad educativa):
- `objetivosAprendizaje` (array de strings) - Se muestran al estudiante
- `area` (string)
- `modulo` (string)
- `competenciasEvaluadas` (array de strings)
- `referencias` (array de strings)



## 🎨 FORMATO DEL VIGNETTE

El vignette debe ser un **string normal** (NO usar template literals):

```json5
// ✅ CORRECTO - String con \n para saltos de línea
vignette: "Paciente: K.L.M., 22 años, primigesta.\n\nMotivo: Atraso menstrual de 3 semanas.\n\nAl examen: PA 106/64 mmHg, FC 68 lpm.",

// ❌ INCORRECTO - Template literals causan error en JSON5
vignette: `Paciente: K.L.M., 22 años...`
```

**Estructura recomendada:**
- Datos demográficos
- Motivo de consulta
- Anamnesis relevante
- Examen físico con signos vitales
- Exámenes complementarios (si aplica)

**NO usar:**
- Markdown con `**bold**` (no se renderiza)
- HTML tags
- Template literals `` ` ``

**Usar:**
- Saltos de línea simples
- Guiones para listas
- Formato texto plano legible

---

## 🚀 CHECKLIST ANTES DE HACER SEED

Antes de ejecutar `npm run seed:cases`, verifica:

- [ ] El archivo está en un array `[{...}]`
- [ ] `dificultad` es string ('1', '2', o '3')
- [ ] `vignette` es string, no objeto
- [ ] Campo `pasos` (no `questions`)
- [ ] Campo `opciones` (no `options`)
- [ ] Campo `esCorrecta` (no `isCorrect`)
- [ ] Campo `texto` (no `text`)
- [ ] Todas las opciones tienen `explicacion`
- [ ] Campo `feedbackDinamico` con `bajo`, `medio`, `alto`
- [ ] Sintaxis JSON5 válida (usa comentarios si quieres)

---

## � ESTRUCTURA DE PREGUNTAS SHORT

### ✅ Formato Correcto

```json5
{
  tipo: 'short',
  enunciado: 'Pregunta que requiere desarrollo',
  criteriosEvaluacion: [
    // Array SIMPLE de strings con palabras clave esperadas
    'palabra clave 1',
    'concepto importante',
    'término específico',
    'relación causal'
  ],
  guia: 'Respuesta modelo completa que se muestra al estudiante después de enviar su respuesta. Debe ser clara, concisa y educativa.'
}
```

### ❌ Formato Incorrecto (Antiguo)

```json5
{
  tipo: 'short',
  enunciado: '...',
  criteriosEvaluacion: [
    // ❌ NO usar objetos complejos
    { criterio: '...', puntos: 2, esencial: true }
  ],
  respuestaModelo: '...'  // ❌ Campo antiguo, usar 'guia'
}
```

### 📊 Cómo Funciona la Evaluación Automática

El sistema evalúa la respuesta del estudiante buscando las palabras clave en `criteriosEvaluacion`:

- **≥70% de criterios cumplidos** → 2 puntos ✅
- **40-69% de criterios cumplidos** → 1 punto ⚠️
- **<40% de criterios cumplidos** → 0 puntos ❌

**Después de enviar**, se muestra:
1. El puntaje obtenido
2. Los criterios evaluados
3. La respuesta guía completa (campo `guia`)

---

## 📦 RESUMEN EJECUTIVO

**FORMATO:** JSON5 (extensión `.json5`)  
**ESTRUCTURA:** Array de casos `[{...}]`  
**ENCODING:** UTF-8  
**CAMPOS CLAVE:**
- `dificultad: '1'` (string)
- `vignette: "..."` (string con `\n\n` para párrafos)
- `pasos: [...]` (array de preguntas)
- `opciones: [...]` (dentro de cada paso MCQ)
- `esCorrecta: true/false` (booleano)
- `explicacion: '...'` (obligatorio en cada opción)
- `criteriosEvaluacion: [...]` (array simple de strings en SHORT)
- `guia: '...'` (respuesta modelo en SHORT)
- `feedbackDinamico: { bajo, medio, alto }` (obligatorio a nivel caso)
- `referencias: [...]` (array de strings, se muestra al final)

**COMANDO SEED:** `CONFIRM_SEED_TO_PROD=1 npm run seed:cases`  
**VERIFICAR:** `npm run dev` → http://localhost:3000

---

¡Usa esta guía como referencia cada vez que crees un caso nuevo! 🎯
