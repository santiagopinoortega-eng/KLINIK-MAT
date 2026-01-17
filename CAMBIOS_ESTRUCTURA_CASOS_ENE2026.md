# 🔄 Cambios en Estructura de Casos Clínicos - Enero 2026

**Fecha:** 17 de Enero, 2026  
**Motivo:** Simplificación y corrección de mapeo entre JSON5 y código frontend

---

## 📋 RESUMEN DE CAMBIOS

### 1. Extensión de Archivos
- **ANTES:** `cases.json`
- **AHORA:** `cases.json5`
- **RAZÓN:** Soporte nativo para comentarios y sintaxis flexible

### 2. Campo de Referencias Bibliográficas
- **ANTES:** `referenciasBibliograficas: [...]`
- **AHORA:** `referencias: [...]`
- **RAZÓN:** Coincide con el campo que el código frontend espera

### 3. Respuesta Guía en Preguntas SHORT
- **ANTES:** `respuestaModelo: '...'`
- **AHORA:** `guia: '...'`
- **RAZÓN:** Coincide con el campo que PasoRenderer.tsx busca para mostrar la guía

### 4. Criterios de Evaluación en SHORT
**ANTES (estructura compleja):**
```json5
criteriosEvaluacion: [
  { criterio: 'Texto del criterio', puntos: 2, esencial: true },
  { criterio: 'Otro criterio', puntos: 1, esencial: false }
]
```

**AHORA (array simple):**
```json5
criteriosEvaluacion: [
  'palabra clave 1',
  'concepto importante',
  'término específico'
]
```

**RAZÓN:** El sistema de evaluación automática solo necesita palabras clave para buscar en la respuesta del estudiante.

### 5. Formato de Vignettes
**ANTES (template literals):**
```json5
vignette: `Paciente: K.L.M., 22 años...

Motivo: Atraso menstrual...`
```

**AHORA (strings con \n):**
```json5
vignette: "Paciente: K.L.M., 22 años...\n\nMotivo: Atraso menstrual..."
```

**RAZÓN:** Los template literals (backticks) causan error de parsing en JSON5.

---

## ✅ BENEFICIOS

1. **Compatibilidad Total:** Todos los campos coinciden con lo que el frontend espera
2. **Evaluación Automática:** Sistema SHORT funciona correctamente
3. **Referencias Visibles:** Las bibliografías se muestran al final de cada caso
4. **Guías Funcionales:** La respuesta guía aparece después de enviar preguntas SHORT
5. **Feedback Dinámico:** El feedback por porcentaje se muestra correctamente
6. **Simplicidad:** Menos campos anidados, estructura más clara

---

## 📂 ARCHIVOS ACTUALIZADOS

### Guías de Referencia
- ✅ `FORMATO_CORRECTO_CASOS.md` - Guía principal de formato
- ✅ `GUIA_CREACION_CASOS_2026.md` - Guía completa de creación
- ✅ `PLAN_CASOS_CLINICOS_2026.md` - Plan y ejemplos

### Scripts
- ✅ `scripts/seed-cases.ts` - Corregido: genera ID para MinsalNorm

### Casos Actualizados
- ✅ `prisma/cases/TEMA1-EMBARAZO-PRENATAL/01-control-normal/cases.json5`
  - Caso 1: Ingreso Prenatal (N1)
  - Caso 2: Vigilancia 2T (N2) 
  - Caso 3: Fisiología Parto (N3)

---

## 🎯 EJEMPLO COMPLETO ACTUALIZADO

```json5
[
  {
    // Metadatos
    id: 'tema1-01-ejemplo-n1',
    titulo: 'Control Prenatal Normal',
    area: 'Tema 1: Embarazo y Control Prenatal',
    modulo: '1.1 Control Prenatal Normal',
    dificultad: '1',
    
    // Objetivos (se muestran al inicio)
    objetivosAprendizaje: [
      'Identificar los componentes del ingreso prenatal',
      'Reconocer la suplementación básica'
    ],
    
    // Vignette (NO usar template literals)
    vignette: "Paciente: K.L.M., 22 años, primigesta.\n\nAcude por atraso menstrual de 3 semanas. Test de embarazo positivo.\n\nAl examen: PA 106/64 mmHg, FC 68 lpm.",
    
    // Preguntas
    pasos: [
      // Pregunta MCQ
      {
        enunciado: '¿Cuál es el objetivo del ingreso prenatal?',
        opciones: [
          { 
            texto: 'Establecer edad gestacional y evaluar riesgo', 
            esCorrecta: true, 
            explicacion: '✅ CORRECTO. El ingreso busca definir cronología e identificar factores de riesgo.' 
          },
          { 
            texto: 'Confirmar embarazo con ecografía', 
            esCorrecta: false, 
            explicacion: '❌ INCORRECTO. El diagnóstico es clínico/químico.' 
          }
        ]
      },
      // Pregunta SHORT (solo en niveles 2 y 3)
      {
        tipo: 'short',
        enunciado: 'Explique la importancia del ácido fólico en el embarazo temprano.',
        criteriosEvaluacion: [
          'ácido fólico',
          'defectos tubo neural',
          'prevención',
          'espina bífida',
          'anencefalia',
          'periconcepcionalmente'
        ],
        guia: 'El ácido fólico es esencial para prevenir defectos del tubo neural (DTN) como espina bífida y anencefalia. La suplementación debe iniciarse idealmente antes de la concepción y continuar durante el primer trimestre, ya que el cierre del tubo neural ocurre entre las semanas 3-4 de gestación.'
      }
    ],
    
    // Feedback dinámico (según puntaje final)
    feedbackDinamico: {
      bajo: 'Repasa los fundamentos del ingreso prenatal según MINSAL.',
      medio: 'Buen trabajo. Refuerza las recomendaciones de suplementación.',
      alto: '¡Excelente! Dominas el protocolo de ingreso en APS.'
    },
    
    // Referencias bibliográficas (se muestran al final)
    referencias: [
      'Guía Perinatal MINSAL 2015',
      'Schwarcz, R. Obstetricia. 7ª ed.',
      'Norma Técnica de Control Prenatal, MINSAL Chile'
    ]
  }
]
```

---

## 🚀 COMANDOS ACTUALIZADOS

### Seed de Casos
```bash
CONFIRM_SEED_TO_PROD=1 npm run seed:cases
```

### Limpiar Casos Antiguos
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/clean-old-cases.ts
```

### Listar Casos en BD
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/list-all-cases.ts
```

### Desarrollo
```bash
npm run dev
# Abrir: http://localhost:3000/casos
```

---

## ✅ VERIFICACIÓN POST-CAMBIO

**Checklist después de crear un caso:**

- [ ] Archivo con extensión `.json5`
- [ ] Campo `referencias` (no `referenciasBibliograficas`)
- [ ] Preguntas SHORT con campo `guia` (no `respuestaModelo`)
- [ ] `criteriosEvaluacion` como array simple de strings
- [ ] Vignette con `\n\n` para párrafos (no template literals)
- [ ] Seed ejecutado exitosamente sin errores
- [ ] Referencias visibles al final del caso en localhost
- [ ] Respuesta guía visible después de enviar SHORT
- [ ] Feedback dinámico aparece según puntaje final

---

## 📚 DOCUMENTACIÓN DE REFERENCIA

- **Formato completo:** `FORMATO_CORRECTO_CASOS.md`
- **Guía de creación:** `GUIA_CREACION_CASOS_2026.md`
- **Plan general:** `PLAN_CASOS_CLINICOS_2026.md`
- **Ejemplos reales:** `prisma/cases/TEMA1-EMBARAZO-PRENATAL/01-control-normal/cases.json5`

---

**Estado:** ✅ Implementado y verificado  
**Casos actualizados:** 3/480  
**Próximo paso:** Crear los 477 casos restantes usando la nueva estructura
