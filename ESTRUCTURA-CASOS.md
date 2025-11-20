# ✅ Estructura de Casos Clínicos - Verificación Completa

## 📊 Resumen de Estructura por Dificultad

### 🟢 **BAJA** (5 preguntas)
```
✓ 5 MCQ (opción múltiple)
✓ 0 Short (sin preguntas escritas)
✓ Puntaje máximo: 5 puntos
```

**Requisitos:**
- [x] 5 preguntas MCQ
- [x] Cada MCQ con 4 opciones (A, B, C, D)
- [x] Todas las opciones con `explicacion` (correctas e incorrectas)
- [x] Exactamente 1 opción con `esCorrecta: true` por pregunta
- [x] Sin preguntas Short
- [x] `feedbackDinamico` (bajo, medio, alto)
- [x] `referencias: string[]`

---

### 🟡 **MEDIA** (6 preguntas)
```
✓ 5 MCQ (opción múltiple)
✓ 1 Short REFLEXIVA (última pregunta)
✓ Puntaje máximo: 7 puntos (5 MCQ + 2 Short)
```

**Requisitos:**
- [x] 5 preguntas MCQ con 4 opciones cada una
- [x] Todas las opciones MCQ con `explicacion`
- [x] 1 pregunta Short (última del caso)
- [x] Short **SIN** `criteriosEvaluacion` (reflexión abierta)
- [x] Short CON `guia` (visible después de enviar)
- [x] Short da 2 puntos fijos si >20 caracteres
- [x] `feedbackDinamico` (bajo, medio, alto)
- [x] `referencias: string[]`

---

### 🔴 **ALTA** (7 preguntas)
```
✓ 6 MCQ (opción múltiple)
✓ 1 Short CON CRITERIOS (última pregunta)
✓ Puntaje máximo: 8 puntos (6 MCQ + 2 Short)
```

**Requisitos:**
- [x] 6 preguntas MCQ con 4 opciones cada una
- [x] Todas las opciones MCQ con `explicacion`
- [x] 1 pregunta Short (última del caso)
- [x] Short **CON** `criteriosEvaluacion: string[]`
- [x] Short CON `guia` (visible después de enviar)
- [x] Short con evaluación automática: 0-2 puntos según keywords
- [x] `feedbackDinamico` (bajo, medio, alto)
- [x] `referencias: string[]`

---

## 🔍 Validación Automática

### Script de Validación
```bash
node scripts/validate-case-structure.mjs
```

**Verifica:**
1. ✅ Cantidad correcta de MCQ según dificultad
2. ✅ Cantidad correcta de Short según dificultad
3. ✅ Cada MCQ tiene exactamente 4 opciones
4. ✅ Cada opción tiene `explicacion`
5. ✅ Exactamente 1 respuesta correcta por MCQ
6. ✅ Short en MEDIA sin `criteriosEvaluacion` (reflexiva)
7. ✅ Short en ALTA con `criteriosEvaluacion` (evaluación automática)
8. ✅ Cada Short tiene `guia`
9. ✅ `feedbackDinamico` completo (bajo, medio, alto)
10. ✅ `referencias` bibliográficas presentes

---

## 📝 Plantillas de Ejemplo

### Caso BAJA
```json5
{
  id: "ejemplo-baja",
  modulo: "Anticoncepción",
  dificultad: "Baja",
  titulo: "Título del caso",
  vigneta: "Descripción del caso...",
  pasos: [
    // MCQ 1/5
    {
      id: "p1",
      tipo: "mcq",
      enunciado: "Pregunta...",
      opciones: [
        { id: "a", texto: "Opción A", explicacion: "Justificación..." },
        { id: "b", texto: "Opción B", esCorrecta: true, explicacion: "Justificación..." },
        { id: "c", texto: "Opción C", explicacion: "Justificación..." },
        { id: "d", texto: "Opción D", explicacion: "Justificación..." }
      ],
      feedbackDocente: "Feedback opcional..."
    },
    // ... MCQ 2/5, 3/5, 4/5, 5/5
  ],
  feedbackDinamico: {
    bajo: "Revisa los conceptos básicos...",
    medio: "Vas por buen camino...",
    alto: "¡Excelente dominio del tema!"
  },
  referencias: [
    "Fuente 1...",
    "Fuente 2..."
  ]
}
```

### Caso MEDIA
```json5
{
  id: "ejemplo-media",
  modulo: "ITS",
  dificultad: "Media",
  titulo: "Título del caso",
  vigneta: "Descripción del caso...",
  pasos: [
    // MCQ 1/5, 2/5, 3/5, 4/5, 5/5...
    
    // SHORT REFLEXIVA 6/6
    {
      id: "p6",
      tipo: "short",
      enunciado: "Reflexiona sobre...",
      // NO incluir criteriosEvaluacion
      guia: "Considera: punto 1, punto 2...",
      feedbackDocente: "Evalúa pensamiento crítico..."
    }
  ],
  feedbackDinamico: { bajo: "...", medio: "...", alto: "..." },
  referencias: ["..."]
}
```

### Caso ALTA
```json5
{
  id: "ejemplo-alta",
  modulo: "ITS",
  dificultad: "Alta",
  titulo: "Título del caso",
  vigneta: "Descripción del caso...",
  pasos: [
    // MCQ 1/6, 2/6, 3/6, 4/6, 5/6, 6/6...
    
    // SHORT CON CRITERIOS 7/7
    {
      id: "p7",
      tipo: "short",
      enunciado: "Consejería clave...",
      puntosMaximos: 2,
      criteriosEvaluacion: [
        "Reposo",
        "AINEs",
        "Abstinencia",
        "pareja",
        "VIH",
        "Control",
        "fiebre"
      ],
      guia: "• Punto 1\n• Punto 2...",
      feedbackDocente: "Evalúa consejería integral..."
    }
  ],
  feedbackDinamico: { bajo: "...", medio: "...", alto: "..." },
  referencias: ["..."]
}
```

---

## ✅ Compatibilidad del Código

### Archivos Verificados

#### ✅ `lib/types.ts`
- Soporta `McqPaso` y `ShortPaso`
- Campo opcional `criteriosEvaluacion?: string[]`
- Campo opcional `guia?: string`
- Campo opcional `puntosMaximos?: number`
- Type guards: `isMcq()` y `isShort()`

#### ✅ `app/components/PasoRenderer.tsx`
- Renderiza MCQ con 4 opciones
- Muestra explicaciones después de responder
- Evalúa Short automáticamente si tiene `criteriosEvaluacion`
- Muestra guía después de enviar Short
- Asigna 2 puntos fijos si Short sin criterios

#### ✅ `app/components/CasoDetalleClient.tsx`
- Calcula puntaje total: MCQ (1 pt) + Short (0-2 pts)
- Muestra feedback adaptativo según porcentaje
- Integra todos los feedbackDocente

#### ✅ `scripts/validate-case-structure.mjs`
- Lee archivos `.json5` correctamente
- Valida estructura según dificultad
- Verifica MCQ (4 opciones, explicaciones, 1 correcta)
- Verifica Short según tipo (reflexiva vs criterios)
- Valida feedbackDinamico y referencias

---

## 🎯 Resumen de Gamificación

### Evaluación Automática Short (Solo ALTA)

**Algoritmo:**
1. Normaliza acentos del texto del estudiante
2. Busca palabras clave (≥4 letras) de cada `criteriosEvaluacion`
3. Calcula porcentaje de criterios cumplidos
4. Asigna puntos:
   - **≥70%** → 2 puntos ✅ Excelente
   - **40-69%** → 1 punto ⚠️ Parcial
   - **<40%** → 0 puntos 📝 Incompleta

### Feedback Final Adaptativo

**Niveles según porcentaje:**
- **0-30%** → `feedbackDinamico.bajo`
- **31-60%** → `feedbackDinamico.medio`
- **61-100%** → `feedbackDinamico.alto`

---

## ✅ TODO ESTÁ LISTO

El sistema puede leer y procesar correctamente todos los casos clínicos según tu estructura definida:

- ✅ BAJA: 5 MCQ (sin Short)
- ✅ MEDIA: 5 MCQ + 1 Short reflexiva
- ✅ ALTA: 6 MCQ + 1 Short con criterios
- ✅ Todas las MCQ con 4 alternativas justificadas
- ✅ Evaluación automática para Short con criterios
- ✅ Feedback adaptativo por rendimiento
- ✅ Referencias bibliográficas

**Solo necesitas actualizar tus casos en `cases.json5` según estas reglas.**
