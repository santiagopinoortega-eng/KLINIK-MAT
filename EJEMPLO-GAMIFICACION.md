# 🎮 Sistema de Gamificación - Estructura de Casos Clínicos

## 📊 Estructura por Dificultad

### 🟢 **BAJA** (5 preguntas MCQ)
- **Solo MCQ** con 4 alternativas (A-D)
- Todas las opciones con justificación (correctas e incorrectas)
- **Sin preguntas escritas**
- Feedback adaptativo + Referencias bibliográficas

**Puntaje máximo:** 5 puntos (1 por pregunta)

---

### 🟡 **MEDIA** (6 preguntas: 5 MCQ + 1 Short)
- **5 MCQ** con 4 alternativas (A-D) y justificaciones
- **1 Short REFLEXIVA** (última pregunta)
  - **SIN** `criteriosEvaluacion`
  - Reflexión abierta: 2 puntos fijos si >20 caracteres
  - Con `guia` visible al enviar
- Feedback adaptativo + Referencias bibliográficas

**Puntaje máximo:** 7 puntos (5 MCQ + 2 Short)

---

### 🔴 **ALTA** (7 preguntas: 6 MCQ + 1 Short)
- **6 MCQ** con 4 alternativas (A-D) y justificaciones
- **1 Short CON CRITERIOS** (última pregunta)
  - **CON** `criteriosEvaluacion: string[]`
  - Evaluación automática: 0-2 puntos según keywords
  - Con `guia` visible al enviar
- Feedback adaptativo + Referencias bibliográficas

**Puntaje máximo:** 8 puntos (6 MCQ + 2 Short)

---

## ✅ Requisitos Obligatorios (Todas las dificultades)

1. **MCQ:**
   - Exactamente 4 alternativas (A, B, C, D)
   - Cada opción con `explicacion` (correcta o incorrecta)
   - Exactamente 1 opción con `esCorrecta: true`

2. **Short (si aplica):**
   - Campo `enunciado` obligatorio
   - Campo `guia` obligatorio (se muestra después de enviar)
   - `puntosMaximos: 2` (por defecto)
   - MEDIA: **sin** `criteriosEvaluacion` (reflexión)
   - ALTA: **con** `criteriosEvaluacion` (evaluación automática)

3. **Feedback Final:**
   - `feedbackDinamico` con 3 niveles:
     - `bajo` (25-49% correctas)
     - `medio` (50-74% correctas)
     - `alto` (75-100% correctas)
     - 0-24%: usa mensaje predeterminado del sistema

4. **Referencias:**
   - Array `referencias: string[]` con fuentes bibliográficas

---

## 🎯 Evaluación Automática Short (Solo ALTA)

**Algoritmo de keywords:**
- Normaliza acentos del texto del estudiante
- Busca palabras clave (≥4 letras) de cada criterio
- Calcula porcentaje de criterios cumplidos:
  - **≥70%** → 2 puntos ✅
  - **40-69%** → 1 punto ⚠️
  - **<40%** → 0 puntos 📝

**Ejemplo:**
```json5
{
  tipo: "short",
  enunciado: "Consejería clave en 4 líneas",
  puntosMaximos: 2,
  criteriosEvaluacion: [
    "Tratar pareja",
    "abstinencia 7 días",
    "condón",
    "test VIH"
  ],
  guia: "• Tratar pareja(s) hoy..."
}
```

---

## 📝 Ejemplo Completo: Caso MEDIA

```json5
{
  id: "its-cervicitis-media",
  modulo: "ITS",
  dificultad: "Media",
  titulo: "Flujo y dolor poscoital en APS",
  vigneta: "Mujer de 22 años consulta por flujo aumentado...",
  pasos: [
    // MCQ 1/5
    {
      id: "p1",
      tipo: "mcq",
      enunciado: "Conducta inicial más apropiada en APS:",
      opciones: [
        { 
          id: "a", 
          texto: "Esperar PCR/cultivo antes de tratar.", 
          explicacion: "Retrasa tratamiento y mantiene transmisión; no recomendado en APS." 
        },
        { 
          id: "b", 
          texto: "Ceftriaxona 500 mg IM + Azitromicina 1 g VO hoy.", 
          esCorrecta: true, 
          explicacion: "Cubre GC/CT empíricamente, corta transmisión." 
        },
        { 
          id: "c", 
          texto: "Solo Azitromicina 1 g VO.", 
          explicacion: "No cubre adecuadamente GC (resistencias)." 
        },
        { 
          id: "d", 
          texto: "Metronidazol 2 g VO.", 
          explicacion: "Útil en vaginosis, no en cervicitis GC/CT." 
        }
      ],
      feedbackDocente: "Evalúa el enfoque sindrómico. Error común: esperar PCR."
    },
    
    // MCQ 2/5
    {
      id: "p2",
      tipo: "mcq",
      enunciado: "¿Por qué tratar a las pareja(s) asintomáticas?",
      opciones: [
        { 
          id: "a", 
          texto: "Porque la pareja podría tener cáncer oculto.", 
          explicacion: "No tiene relación; no es indicación válida." 
        },
        { 
          id: "b", 
          texto: "Porque GC/CT cursan asintomáticas y perpetúan transmisión.", 
          esCorrecta: true, 
          explicacion: "Rompe cadena de transmisión, previene reinfección." 
        },
        { 
          id: "c", 
          texto: "Porque el antibiótico actúa como vacuna.", 
          explicacion: "Incorrecto: no generan inmunidad protectora." 
        },
        { 
          id: "d", 
          texto: "Porque MINSAL obliga en todos los casos.", 
          explicacion: "Base es epidemiológica: cortar transmisión." 
        }
      ],
      feedbackDocente: "Evalúa comprensión de salud pública."
    },
    
    // MCQ 3/5, 4/5, 5/5... (omitidas por brevedad)
    
    // SHORT REFLEXIVA (última pregunta en MEDIA)
    {
      id: "p6",
      tipo: "short",
      enunciado: "Reflexiona sobre los desafíos del enfoque sindrómico en zonas rurales con acceso limitado a laboratorio.",
      // NO incluir criteriosEvaluacion aquí
      guia: "Considera: tiempos de traslado, costo de derivación, adherencia al tratamiento empírico, educación a la comunidad.",
      feedbackDocente: "Evalúa pensamiento crítico sobre barreras de acceso."
    }
  ],
  
  feedbackDinamico: {
    bajo: "Revisa los conceptos de manejo sindrómico de ITS y tratamiento de pareja.",
    medio: "Vas por buen camino. Refuerza criterios de derivación y seguimiento.",
    alto: "¡Excelente! Dominas el enfoque integral de ITS en APS."
  },
  
  referencias: [
    "MINSAL — Norma General Técnica N°187 (2016): Cervicitis — manejo sindrómico.",
    "MINSAL — Norma General Técnica N°187 (2016): Tratamiento de pareja."
  ]
}
```

---

## 📝 Ejemplo Completo: Caso ALTA

```json5
{
  id: "its-epi-alta",
  modulo: "ITS",
  dificultad: "Alta",
  titulo: "Dolor pélvico y fiebre: EPI en APS",
  vigneta: "Mujer de 24 años consulta por 48 h de dolor pélvico...",
  pasos: [
    // MCQ 1/6, 2/6, 3/6, 4/6, 5/6, 6/6... (omitidas por brevedad)
    
    // SHORT CON CRITERIOS (última pregunta en ALTA)
    {
      id: "p7",
      tipo: "short",
      enunciado: "Consejería y seguimiento: redacta 4 indicaciones clave para la paciente.",
      puntosMaximos: 2,
      criteriosEvaluacion: [
        "Reposo",
        "AINEs",
        "Abstinencia",
        "tratamiento",
        "pareja",
        "VIH",
        "sífilis",
        "Control",
        "48",
        "72",
        "fiebre",
        "hospitalización"
      ],
      guia: "• Reposo relativo 48-72 h; AINEs para dolor.\n• Abstinencia sexual hasta completar 7 días post-tratamiento de ambos.\n• Tratamiento de pareja(s) en paralelo; ofrecer test de VIH y sífilis.\n• Control a 48-72 h: si no hay mejoría, reevaluar y considerar hospitalización.",
      feedbackDocente: "Evalúa capacidad de consejería integral con elementos verificables."
    }
  ],
  
  feedbackDinamico: {
    bajo: "Revisa los criterios de EPI y esquemas ambulatorios MINSAL.",
    medio: "Bien. Refuerza seguimiento y criterios de hospitalización.",
    alto: "¡Excelente! Dominas el manejo integral de EPI en APS."
  },
  
  referencias: [
    "MINSAL — Norma Gral. Téc. N°187 (2016): EPI — manejo ambulatorio.",
    "MINSAL — Norma Gral. Téc. N°187 (2016): Criterios de hospitalización."
  ]
}
```

---

**Niveles de Desempeño:**
- 🏆 **Excelente** (90-100%): 5.4-6 puntos
- ⭐ **Muy Bien** (70-89%): 4.2-5.3 puntos  
- ✓ **Bien** (50-69%): 3-4.1 puntos
- 📝 **Necesitas Revisar** (<50%): 0-2.9 puntos

## Flujo del Estudiante

### 1. Preguntas MCQ
- Selecciona opción → **1 punto automático** si es correcta
- Ve explicación inmediata
- No requiere autoevaluación

### 2. Preguntas Short (Desarrollo)
1. Escribe su respuesta (mínimo texto requerido)
2. Envía respuesta
3. Ve **criterios de evaluación** (lista simple)
4. **Autoevalúa** su respuesta:
   - ❌ No logrado (0 pts)
   - ⚠️ Parcial (1 pt)
   - ✅ Completo (2 pts)
5. Ve guía de respuesta esperada

### 3. Feedback Final Integrado
Al completar **todas las preguntas**, el estudiante ve:

```
┌─────────────────────────────────────────┐
│     🏆 Excelente                        │
│                                         │
│  Puntos Obtenidos: 5                    │
│  Puntos Totales: 6                      │
│  Porcentaje: 83%                        │
│                                         │
│  ████████████████░░░░ 83%               │
│                                         │
│  Buen desempeño. Refuerza algunos       │
│  detalles para alcanzar la excelencia.  │
└─────────────────────────────────────────┘

FEEDBACK DOCENTE:
───────────────────────────────────────────
Paso 1: Este ítem evalúa el enfoque 
        sindrómico. Error común: esperar PCR.

Paso 2: Evalúa comprensión de salud pública
        y manejo de contactos.

Paso 3: Evalúa capacidad de consejería 
        integral...
```

## Ventajas del Sistema

✅ **Simple para estudiantes**
- No tienen que marcar checklist complejos
- Autoevaluación rápida (3 botones)
- Ven criterios esperados sin presión

✅ **Integración total**
- MCQ + Short = un solo puntaje
- Feedback docente **considera todo el caso**
- No hay sistemas separados

✅ **Transparente**
- Estudiante sabe cuánto vale cada pregunta
- Ve su progreso en tiempo real
- Feedback adaptado a su desempeño

✅ **Educativo**
- Autoevaluación fomenta metacognición
- Criterios claros guían la reflexión
- Guía de respuesta refuerza aprendizaje

## Migración de Casos Existentes

### Caso Short Simple (sin cambios)
```json5
{
  id: "p4",
  tipo: "short",
  enunciado: "Consejería y seguimiento",
  guia: "• Reversibilidad: implante se retira cuando desee...",
  feedbackDocente: "Evalúa consejería integral."
}
// Por defecto vale 2 puntos, sin criterios visibles
```

### Caso Short con Criterios Explícitos
```json5
{
  id: "p4",
  tipo: "short",
  enunciado: "Consejería y seguimiento",
  puntosMaximos: 2,
  criteriosEvaluacion: [
    "Menciona reversibilidad",
    "Explica patrón de sangrado",
    "Lista signos de alarma",
    "Indica seguimiento a 1-3 meses"
  ],
  guia: "• Reversibilidad: implante se retira cuando desee...",
  feedbackDocente: "Evalúa consejería integral."
}
// Vale 2 puntos, estudiante ve criterios antes de autoevaluar
```

## Notas de Implementación

### Backend (Ya implementado)
- ✅ Tipos TypeScript actualizados
- ✅ `ShortPaso` con `puntosMaximos` y `criteriosEvaluacion`
- ✅ `Respuesta` con campo `puntos`
- ✅ `PasoRenderer` con autoevaluación
- ✅ `CasoDetalleClient` con resumen de puntos
- ✅ `CasoContext` maneja actualización de puntos

### Frontend
- ✅ Autoevaluación con 3 botones simples
- ✅ Indicador de puntos por pregunta
- ✅ Resumen final con gráficos
- ✅ Feedback adaptativo por nivel

### Pendiente
- [ ] Persistir puntos en base de datos (opcional)
- [ ] Exportar resultados para análisis docente
- [ ] Dashboard de progreso por estudiante
