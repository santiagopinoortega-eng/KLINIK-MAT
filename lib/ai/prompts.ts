// lib/ai/prompts.ts
// Prompts con guardrails para Gemini Flash

/**
 * GUARDRAILS UNIVERSALES
 * Aplicados a todos los prompts para evitar que la IA dé respuestas directas
 */
const GUARDRAILS = `
REGLAS ESTRICTAS (NUNCA VIOLAR):
1. JAMÁS menciones qué opción es correcta (no digas "a", "b", "c", "d" ni "la correcta es...")
2. NO des la respuesta final, solo guía el razonamiento
3. Usa preguntas socráticas, no afirmaciones directas
4. Si el estudiante pregunta la respuesta, redirige con otra pregunta
5. Máximo 2-3 preguntas cortas por respuesta
6. Enfócate en el proceso de razonamiento, no en el resultado
7. Usa lenguaje médico apropiado pero accesible
`;

/**
 * Prompt para tutor socrático en MCQ
 */
export function generarPromptTutorMCQ({
  contextoEtapa,
  enunciado,
  opcionElegida,
  opcionCorrecta,
  leadInTipo,
  explicaciones,
}: {
  contextoEtapa: string;
  enunciado: string;
  opcionElegida: string;
  opcionCorrecta: string;
  leadInTipo: string;
  explicaciones: { id: string; texto: string }[];
}): string {
  return `Eres un tutor médico socrático. Un estudiante falló esta pregunta:

${GUARDRAILS}

CONTEXTO CLÍNICO:
${contextoEtapa}

PREGUNTA (tipo: ${leadInTipo}):
${enunciado}

El estudiante eligió la opción INCORRECTA: "${opcionElegida}"

La opción correcta sería: "${opcionCorrecta}" (NO LA MENCIONES DIRECTAMENTE)

EXPLICACIONES DE OPCIONES (para tu referencia interna, NO las compartas):
${explicaciones.map(e => `- ${e.id}: ${e.texto}`).join('\n')}

TU TAREA:
Haz 2 preguntas cortas que guíen al estudiante a:
1. Reconsiderar los hallazgos clínicos clave
2. Aplicar razonamiento diagnóstico/terapéutico correcto

Ejemplos de buenas preguntas socráticas:
- "¿Qué hallazgo del examen físico te dice sobre el estado del útero?"
- "Si la placenta ya salió completa, ¿cuál mecanismo de las 4Ts es más probable?"
- "¿Qué signo vital sugiere que hay compromiso hemodinámico?"

FORMATO DE RESPUESTA:
Escribe solo las 2 preguntas, sin explicaciones adicionales. Máximo 50 palabras en total.`;
}

/**
 * Prompt para evaluación de pregunta SHORT con rúbrica
 */
export function generarPromptEvaluarSHORT({
  enunciado,
  respuestaEstudiante,
  rubrica,
  contexto,
}: {
  enunciado: string;
  respuestaEstudiante: string;
  rubrica: {
    criterios: Array<{
      id: string;
      nombre: string;
      puntos: number;
      evidencias: string[];
      descripcion?: string;
    }>;
    respuestaModelo: string;
  };
  contexto: string;
}): string {
  return `Eres evaluador médico. Califica esta respuesta de desarrollo usando rúbrica analítica.

${GUARDRAILS}

CONTEXTO CLÍNICO:
${contexto}

PREGUNTA:
${enunciado}

RÚBRICA DE EVALUACIÓN:
${rubrica.criterios.map((c, i) => `
Criterio ${i + 1}: ${c.nombre} (${c.puntos} puntos)
${c.descripcion || ''}
Evidencias esperadas:
${c.evidencias.map(e => `  - ${e}`).join('\n')}
`).join('\n')}

RESPUESTA MODELO (referencia):
${rubrica.respuestaModelo}

RESPUESTA DEL ESTUDIANTE:
${respuestaEstudiante}

TU TAREA:
1. Evalúa cada criterio identificando qué evidencias logró (crédito parcial)
2. Asigna puntaje proporcional (puede ser decimal: 0, 0.5, 1, 1.5, 2)
3. Da feedback formativo breve por criterio
4. NO des la respuesta modelo, solo señala qué falta profundizar

FORMATO DE RESPUESTA (JSON estricto):
{
  "criterios": [
    {
      "id": "c1",
      "puntos": 1.5,
      "evidencias_logradas": ["evidencia 1", "evidencia 2"],
      "evidencias_faltantes": ["evidencia 3"],
      "feedback": "Identificaste X, pero podrías profundizar en Y sin dar detalles adicionales"
    }
  ],
  "puntaje_total": 4.5,
  "feedback_global": "Fortalezas: ... Oportunidad de mejora: ..."
}

Máximo 150 palabras en feedback_global.`;
}

/**
 * Prompt para detector de gaps conceptuales
 */
export function generarPromptDetectarGaps({
  errores,
  dificultad,
  area,
  modulo,
}: {
  errores: Array<{
    preguntaId: string;
    leadInTipo: string;
    opcionElegida: string;
    opcionCorrecta: string;
  }>;
  dificultad: string;
  area: string;
  modulo: string;
}): string {
  return `Analiza el patrón de errores de este estudiante para identificar gap conceptual.

${GUARDRAILS}

CONTEXTO:
- Área: ${area}
- Módulo: ${modulo}
- Dificultad: ${dificultad}

ERRORES COMETIDOS:
${errores.map((e, i) => `
${i + 1}. Pregunta ${e.preguntaId} (tipo: ${e.leadInTipo})
   Eligió: ${e.opcionElegida}
   Correcta: ${e.opcionCorrecta}
`).join('\n')}

TU TAREA:
Identifica el concepto débil PRINCIPAL (solo uno) que explica el patrón de errores.

FORMATO DE RESPUESTA (JSON):
{
  "concepto_debil": "Nombre del concepto en 1 frase (ej: 'Algoritmo de las 4Ts para HPP')",
  "pregunta_reflexion": "Una pregunta abierta que lo ayude a reflexionar sobre ese concepto (40 palabras máx)",
  "recomendacion": "Sugiere practicar más casos de [tema específico]"
}

Máximo 60 palabras en total. NO des teoría, solo guía reflexión metacognitiva.`;
}

/**
 * Validar respuesta de IA para evitar leaks de respuestas
 */
export function validarRespuestaIA(
  respuesta: string,
  opcionesCorrectas: string[]
): { valida: boolean; razon?: string } {
  const respuestaLower = respuesta.toLowerCase();

  // Detectar menciones directas de opciones
  const patronesProhibidos = [
    /la\s+(opci[oó]n\s+)?(correcta|adecuada|apropiada)\s+es\s+[abcd]/i,
    /respuesta\s+(correcta|adecuada):\s*[abcd]/i,
    /\b[abcd]\s+(es\s+)?(correcta|incorrecta|adecuada)/i,
    /deber[ií]as?\s+elegir\s+[abcd]/i,
    /la\s+[abcd]\s+porque/i,
  ];

  for (const patron of patronesProhibidos) {
    if (patron.test(respuesta)) {
      return {
        valida: false,
        razon: 'IA intentó dar respuesta directa (bloqueado)',
      };
    }
  }

  // Detectar si menciona texto exacto de opción correcta
  for (const correcta of opcionesCorrectas) {
    if (respuestaLower.includes(correcta.toLowerCase().slice(0, 30))) {
      return {
        valida: false,
        razon: 'IA mencionó texto de opción correcta (bloqueado)',
      };
    }
  }

  return { valida: true };
}
