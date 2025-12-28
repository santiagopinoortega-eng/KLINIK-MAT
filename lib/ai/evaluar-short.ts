// lib/ai/evaluar-short.ts
// Servicio para evaluar respuestas SHORT con IA

export interface EvaluacionSHORT {
  criterios: Array<{
    id: string;
    puntos: number;
    evidencias_logradas: string[];
    evidencias_faltantes: string[];
    feedback: string;
  }>;
  puntaje_total: number;
  feedback_global: string;
}

export async function evaluarRespuestaSHORT({
  caseId,
  preguntaId,
  respuestaEstudiante,
}: {
  caseId: string;
  preguntaId: string;
  respuestaEstudiante: string;
}): Promise<EvaluacionSHORT | null> {
  try {
    const res = await fetch('/api/ai/evaluar-short', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId,
        preguntaId,
        respuestaEstudiante,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Error evaluando SHORT:', data.error);
      return null;
    }

    if (data.evaluacionManual) {
      // IA no pudo evaluar, requiere revisión manual
      return null;
    }

    return data.evaluacion;
  } catch (error) {
    console.error('Error en evaluarRespuestaSHORT:', error);
    return null;
  }
}
