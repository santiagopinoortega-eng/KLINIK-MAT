# 📋 ESTRUCTURA DEL CASO CLÍNICO - KLINIK-MAT

## METADATA DEL CASO

**ID del caso:**
- Formato: tema#-##-[tema-especifico]-###
- Ejemplo: tema1-01-primera-consulta-001
- tema# puede ser: tema1, tema2, tema3, tema4, tema5, tema6
- ## es el número de subárea: 01, 02, 03, 04
- ### es el número de caso: 001 hasta 050

**Título:**
- Un título descriptivo que resuma el caso clínico

**Área:**
- Especificar: tema1, tema2, tema3, tema4, tema5 o tema6

**Módulo:**
- El nombre de la subárea (ej: 01-control-normal, 02-patologia-embarazo)

**Dificultad:**
- 1 = BAJA: 6 preguntas MCQ
- 2 = MEDIA: 6 preguntas MCQ + 1 pregunta SHORT
- 3 = ALTA: 7 preguntas MCQ + 1 pregunta SHORT

---

## VIÑETA CLÍNICA

**Paciente:**
- Describir edad, sexo, paridad (si aplica), antecedentes relevantes

**Motivo de consulta:**
- Razón principal por la que acude

**Anamnesis:**
- Historia clínica detallada
- Inicio de síntomas, evolución
- Factores asociados
- Antecedentes mórbidos relevantes
- Antecedentes quirúrgicos si aplica
- Antecedentes obstétricos si corresponde

**Examen físico:**
- Signos vitales (PA, FC, FR, temperatura)
- Hallazgos del examen físico segmentario relevantes para el caso
- Describir solo lo pertinente al caso

**Exámenes:**
- Listar resultados de laboratorio con valores y unidades
- Incluir estudios de imagen con descripción de hallazgos
- Solo incluir exámenes relevantes para el caso

**Contexto:**
- Información adicional relevante
- Contexto socioeconómico si es pertinente
- Embarazo planificado o no planificado (si aplica)
- Adherencia a tratamientos previos
- Cualquier otro dato que contextualice el caso

---

## PREGUNTAS

### PREGUNTAS MCQ (Multiple Choice Question)

**Cantidad según dificultad:**
- BAJA: 6 preguntas MCQ
- MEDIA: 6 preguntas MCQ
- ALTA: 7 preguntas MCQ

**Para cada pregunta MCQ incluir:**

1. **Tipo:** mcq

2. **Enunciado:**
   - Una pregunta clara y específica relacionada con el caso
   - Debe evaluar comprensión, aplicación o análisis según nivel

3. **Opciones:** (4 opciones, una correcta y tres incorrectas)
   
   **Opción correcta:**
   - Texto de la opción
   - Marcar como correcta: true
   - Explicación detallada de POR QUÉ es correcta
   - Fundamentar con evidencia científica
   - Referenciar guías clínicas (MINSAL cuando aplique)
   - Explicar fisiopatología si corresponde
   
   **Opciones incorrectas:** (3 opciones)
   - Texto de cada opción
   - Marcar como correcta: false
   - Para cada una explicar POR QUÉ es incorrecta
   - Qué error conceptual representa
   - Cuándo podría considerarse (si aplica)
   - Feedback educativo para que el estudiante aprenda

---

### PREGUNTA SHORT (Solo para MEDIA y ALTA)

**Incluir si dificultad es 2 o 3:**

1. **Tipo:** short

2. **Enunciado:**
   - Pregunta abierta que requiere análisis clínico
   - Debe evaluar justificación de decisiones
   - Puede pedir aplicación de criterios diagnósticos
   - Debe evaluar pensamiento clínico, no solo memoria

3. **Criterios de evaluación:**

   **Para nivel MEDIA:** 3-4 criterios (al menos 2 esenciales)
   **Para nivel ALTA:** 4-5 criterios (al menos 3 esenciales)
   
   Para cada criterio especificar:
   - Descripción del criterio: qué debe mencionar el estudiante
   - Puntaje: cuántos puntos vale (1-3)
   - Esencial: true o false (si es indispensable para aprobar)
   
   Ejemplo de criterios:
   - Criterio 1: "Punto clave esencial que DEBE mencionar" - 3 puntos - esencial: true
   - Criterio 2: "Otro punto esencial" - 2 puntos - esencial: true
   - Criterio 3: "Punto complementario importante" - 2 puntos - esencial: false
   - Criterio 4: "Punto adicional de calidad" - 1 punto - esencial: false

4. **Respuesta modelo:**
   - Escribir la respuesta completa ideal
   - Debe incluir todos los criterios esenciales
   - Debe incluir criterios complementarios
   - Con fundamentación científica
   - Referencias cuando aplique
   - Es la respuesta que se espera de un estudiante avanzado

---

## INFORMACIÓN EDUCATIVA

**Objetivos de aprendizaje:**
- Listar 3-4 objetivos específicos que el caso permite evaluar
- Deben ser medibles y específicos
- Relacionados con competencias clínicas concretas

**Competencias evaluadas:**
- Listar 3-5 competencias clínicas
- Ejemplos: Anamnesis y examen físico, Interpretación de exámenes, Toma de decisiones clínicas, Manejo de complicaciones, Aplicación de criterios diagnósticos

**Referencias bibliográficas:**
- Incluir al menos 2-3 referencias
- Priorizar: Guía Perinatal MINSAL Chile 2015
- Williams Obstetrics (última edición)
- Normas técnicas o guías clínicas aplicables
- Referencias bibliográficas académicas relevantes

**Notas para el docente:**
- Información adicional útil para quien corregirá
- Puntos clave a enfatizar en retroalimentación
- Errores conceptuales comunes en estudiantes
- Conexiones con otros temas del curso
- Sugerencias para discusión en clase

---

## RESUMEN DE CANTIDADES

**NIVEL BAJA (dificultad: 1):**
- 6 preguntas MCQ (4 opciones cada una)
- 0 preguntas SHORT
- Viñeta: 100-150 palabras

**NIVEL MEDIA (dificultad: 2):**
- 6 preguntas MCQ (4 opciones cada una)
- 1 pregunta SHORT (3-4 criterios, mínimo 2 esenciales)
- Viñeta: 150-200 palabras

**NIVEL ALTA (dificultad: 3):**
- 7 preguntas MCQ (4-5 opciones cada una)
- 1 pregunta SHORT (4-5 criterios, mínimo 3 esenciales)
- Viñeta: 200-250 palabras

---

## IMPORTANTE

- Todas las opciones MCQ deben tener explicación educativa
- Las explicaciones deben enseñar, no solo decir "correcto" o "incorrecto"
- Usar datos clínicos realistas
- Fundamentar con evidencia científica
- Referenciar guías MINSAL cuando aplique
- Lenguaje claro y profesional
- Evitar datos inventados o poco realistas
