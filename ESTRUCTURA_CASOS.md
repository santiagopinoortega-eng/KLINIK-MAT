# 📋 Guía de Estructura de Casos Clínicos - KLINIK-MAT

## 🎯 Requisitos por Dificultad

| Dificultad | Cantidad de Preguntas | Opciones por Pregunta |
|------------|----------------------|----------------------|
| **Baja**   | 5 preguntas MCQ      | 4 opciones (A-D)     |
| **Media**  | 6 preguntas MCQ      | 4 opciones (A-D)     |
| **Alta**   | 7 preguntas MCQ      | 4 opciones (A-D)     |

## 📝 Estructura Completa de un Caso

```json5
{
  id: "id-unico-del-caso",
  modulo: "Anticoncepción | ITS | Consejería | Climaterio",
  dificultad: "Baja | Media | Alta",
  titulo: "Título descriptivo del caso clínico",
  vigneta: "Descripción detallada del paciente y situación clínica...",
  
  pasos: [
    // ===== PREGUNTAS MCQ (según dificultad) =====
    {
      id: "p1",
      tipo: "mcq",
      enunciado: "¿Pregunta clínica específica?",
      opciones: [
        {
          id: "a",
          texto: "Opción A",
          esCorrecta: false, // o true
          explicacion: "Justificación clara y educativa de por qué esta opción es correcta/incorrecta"
        },
        {
          id: "b",
          texto: "Opción B",
          esCorrecta: true,
          explicacion: "Justificación completa con fundamento clínico"
        },
        {
          id: "c",
          texto: "Opción C",
          esCorrecta: false,
          explicacion: "Justificación educativa"
        },
        {
          id: "d",
          texto: "Opción D",
          esCorrecta: false,
          explicacion: "Justificación educativa"
        }
      ],
      feedbackDocente: "Contexto pedagógico: qué competencia evalúa esta pregunta y errores frecuentes"
    },
    
    // ... repetir para todas las preguntas según dificultad
    
    // ===== PASO FINAL: PUNTOS CLAVE =====
    {
      id: "p_final",
      tipo: "short",
      enunciado: "Puntos Clave del Caso",
      guia: "• Concepto clave 1\n• Concepto clave 2\n• Concepto clave 3\n• Concepto clave 4",
      feedbackDocente: "Reflexión final sobre el aprendizaje esperado del caso completo"
    }
  ],
  
  // ===== FEEDBACK ADAPTATIVO (OBLIGATORIO) =====
  feedbackDinamico: {
    bajo: "Mensaje motivacional para 0-30% de aciertos. Identificar conceptos básicos a reforzar.",
    medio: "Mensaje de reconocimiento para 31-60%. Señalar áreas específicas de mejora.",
    alto: "Felicitación para 61-100%. Desafío avanzado o profundización."
  },
  
  // ===== FUENTES BIBLIOGRÁFICAS (OBLIGATORIO) =====
  referencias: [
    "MINSAL — Norma específica (año)",
    "OMS — Guía o documento relevante",
    "CDC o fuente internacional según corresponda"
  ]
}
```

## ✅ Checklist de Validación

Antes de guardar tu caso en `cases.json5`, verifica:

- [ ] **Cantidad de preguntas correcta** (5 baja, 6 media, 7 alta)
- [ ] **Cada pregunta tiene 4 opciones** (A, B, C, D)
- [ ] **Cada opción tiene `explicacion`** con justificación educativa
- [ ] **Solo UNA opción marcada como `esCorrecta: true`** por pregunta
- [ ] **feedbackDinamico completo** (bajo, medio, alto)
- [ ] **referencias bibliográficas** incluidas
- [ ] **feedbackDocente** en cada pregunta explicando qué se evalúa

## 🔄 Flujo de Trabajo Recomendado

1. **Diseña la viñeta clínica** (situación real y relevante)
2. **Define las preguntas** según objetivos de aprendizaje
3. **Crea 4 opciones** por pregunta (1 correcta + 3 distractores plausibles)
4. **Escribe justificaciones** educativas para TODAS las opciones
5. **Agrega feedback adaptativo** personalizado al caso
6. **Incluye fuentes bibliográficas** actualizadas
7. **Valida con el script**: `node scripts/validate-case-structure.mjs`

## 🎨 Tips para Crear Buenas Justificaciones

### ✅ Buena justificación
```json5
{
  texto: "Iniciar PEP VIH hoy mismo (dentro de las 72 h)",
  esCorrecta: true,
  explicacion: "Correcto. La PEP debe iniciarse lo antes posible (<72 h). Incluye toma de exámenes basales (VIH, VHB, sífilis, GC/CT) y control programado."
}
```

### ❌ Justificación insuficiente
```json5
{
  texto: "Iniciar PEP",
  esCorrecta: true,
  explicacion: "Es la correcta."
}
```

## 📊 Feedback Adaptativo - Ejemplos

### Caso de Anticoncepción
```json5
feedbackDinamico: {
  bajo: "Has identificado algunos conceptos básicos sobre métodos anticonceptivos. Te recomendamos revisar los Criterios MEC de la OMS y las contraindicaciones según historia clínica. ¡Sigue estudiando!",
  
  medio: "¡Buen trabajo! Comprendes los métodos anticonceptivos principales y sus indicaciones. Para mejorar, profundiza en las interacciones farmacológicas y casos especiales (lactancia, comorbilidades).",
  
  alto: "¡Excelente! Has demostrado dominio en consejería anticonceptiva y aplicación de criterios MEC. Estás preparado/a para asesorar de forma autónoma en APS. Considera profundizar en casos de alta complejidad."
}
```

### Caso de ITS
```json5
feedbackDinamico: {
  bajo: "Has reconocido algunos signos de ITS. Refuerza el enfoque sindrómico, tratamiento empírico y manejo de contactos según Norma MINSAL 187. Revisa las guías CDC 2021.",
  
  medio: "Buen desempeño en identificación y manejo inicial de ITS. Para mejorar, profundiza en diagnóstico diferencial, tamizaje extragenital y seguimiento post-tratamiento.",
  
  alto: "¡Excelente razonamiento clínico! Dominas el enfoque sindrómico, tratamiento y prevención de ITS. Estás preparado/a para manejo integral en APS. Profundiza en casos de coinfección y poblaciones vulnerables."
}
```

## 🚀 Comando de Validación

Después de editar `cases.json5`:

```bash
node scripts/validate-case-structure.mjs
```

Si todos los casos pasan la validación, verás: **🎉 ¡Todos los casos cumplen con la estructura requerida!**

## 📁 Ubicación de Archivos

- **Casos clínicos**: `/workspaces/KLINIK-MAT/prisma/cases.json`
- **Script de validación**: `/workspaces/KLINIK-MAT/scripts/validate-case-structure.mjs`
- **Template de ejemplo**: `/workspaces/KLINIK-MAT/scripts/case-template.json`

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0.0
