// lib/gemini.ts
// Cliente seguro para Gemini Flash API con control de costos

import { GoogleGenerativeAI } from '@google/generative-ai';
import { cache } from './cache';
import { logger } from './logger';

// Validar API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('GEMINI_API_KEY no configurada en producción');
}

// Inicializar cliente
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Límites de seguridad y costo
export const LIMITS = {
  MAX_INPUT_TOKENS: 1000,
  MAX_OUTPUT_TOKENS: 200,
  MAX_CALLS_PER_USER_PER_DAY: 50,
  MAX_CALLS_PER_CASE: 3, // 1 tutor + 1 short + 1 gaps
  CACHE_TTL: 3600 * 1000, // 1 hora
} as const;

// Configuración del modelo
const MODEL_CONFIG = {
  model: 'gemini-2.0-flash-exp', // Gemini Flash 3.0 - ÚNICO MODELO PERMITIDO
  generationConfig: {
    maxOutputTokens: LIMITS.MAX_OUTPUT_TOKENS,
    temperature: 0.7, // Balance creatividad/precisión
    topP: 0.8,
    topK: 40,
  },
  // Safety settings removidos para compatibilidad
};

/**
 * Resultado de llamada a Gemini
 */
export interface GeminiResponse {
  texto: string;
  tokensUsados: {
    input: number;
    output: number;
  };
  cached: boolean;
}

/**
 * Error personalizado para Gemini
 */
export class GeminiError extends Error {
  constructor(
    message: string,
    public code: 'API_KEY_MISSING' | 'RATE_LIMIT' | 'API_ERROR' | 'INVALID_RESPONSE',
    public details?: any
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

/**
 * Llamada segura a Gemini Flash con cacheo y límites
 */
export async function llamarGemini(
  prompt: string,
  userId: string,
  caseId: string,
  tipo: 'tutor' | 'evaluar_short' | 'gaps'
): Promise<GeminiResponse> {
  // Validar API key
  if (!genAI) {
    throw new GeminiError(
      'Gemini API no configurada',
      'API_KEY_MISSING'
    );
  }

  // Validar longitud del prompt
  const estimatedTokens = Math.ceil(prompt.length / 4); // Aproximación
  if (estimatedTokens > LIMITS.MAX_INPUT_TOKENS) {
    throw new GeminiError(
      `Prompt muy largo: ${estimatedTokens} tokens (máx: ${LIMITS.MAX_INPUT_TOKENS})`,
      'INVALID_RESPONSE'
    );
  }

  // Verificar rate limit del usuario (por día)
  const rateLimitKey = `gemini:ratelimit:${userId}:${new Date().toISOString().split('T')[0]}`;
  const callsToday = cache.get<number>(rateLimitKey) || 0;
  
  if (callsToday >= LIMITS.MAX_CALLS_PER_USER_PER_DAY) {
    throw new GeminiError(
      'Límite diario de consultas alcanzado',
      'RATE_LIMIT',
      { callsToday, limit: LIMITS.MAX_CALLS_PER_USER_PER_DAY }
    );
  }

  // Verificar límite por caso
  const caseLimitKey = `gemini:case:${userId}:${caseId}`;
  const callsPerCase = cache.get<number>(caseLimitKey) || 0;
  
  if (callsPerCase >= LIMITS.MAX_CALLS_PER_CASE) {
    throw new GeminiError(
      'Límite de consultas por caso alcanzado',
      'RATE_LIMIT',
      { callsPerCase, limit: LIMITS.MAX_CALLS_PER_CASE }
    );
  }

  // Generar clave de caché (para prompts similares)
  const cacheKey = `gemini:response:${tipo}:${Buffer.from(prompt).toString('base64').slice(0, 50)}`;
  const cached = cache.get<GeminiResponse>(cacheKey);
  
  if (cached) {
    logger.info('Respuesta Gemini desde caché', { userId, caseId, tipo });
    return { ...cached, cached: true };
  }

  try {
    // Llamada a Gemini
    const model = genAI.getGenerativeModel(MODEL_CONFIG);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const texto = response.text();

    // Validar respuesta
    if (!texto || texto.length < 10) {
      throw new GeminiError(
        'Respuesta vacía o muy corta de Gemini',
        'INVALID_RESPONSE'
      );
    }

    // Estimar tokens (Gemini no devuelve conteo exacto en Flash)
    const tokensUsados = {
      input: estimatedTokens,
      output: Math.ceil(texto.length / 4),
    };

    const geminiResponse: GeminiResponse = {
      texto,
      tokensUsados,
      cached: false,
    };

    // Guardar en caché
    cache.set(cacheKey, geminiResponse, LIMITS.CACHE_TTL);

    // Incrementar contadores
    cache.set(rateLimitKey, callsToday + 1, 24 * 60 * 60 * 1000); // 24 horas
    cache.set(caseLimitKey, callsPerCase + 1, 4 * 60 * 60 * 1000); // 4 horas

    // Log para monitoreo de costos
    logger.info('Llamada Gemini exitosa', {
      userId,
      caseId,
      tipo,
      tokensInput: tokensUsados.input,
      tokensOutput: tokensUsados.output,
      longitudRespuesta: texto.length,
    });

    return geminiResponse;

  } catch (error: any) {
    logger.error('Error en llamada Gemini', {
      userId,
      caseId,
      tipo,
      error: error.message,
    });

    throw new GeminiError(
      'Error al comunicarse con Gemini API',
      'API_ERROR',
      { originalError: error.message }
    );
  }
}

/**
 * Verificar si usuario puede usar IA
 */
export async function puedeUsarIA(userId: string, caseId: string): Promise<{
  puede: boolean;
  razon?: string;
  llamadasRestantes?: number;
}> {
  // Verificar llamadas del día
  const rateLimitKey = `gemini:ratelimit:${userId}:${new Date().toISOString().split('T')[0]}`;
  const callsToday = cache.get<number>(rateLimitKey) || 0;
  
  if (callsToday >= LIMITS.MAX_CALLS_PER_USER_PER_DAY) {
    return {
      puede: false,
      razon: 'Límite diario alcanzado. Vuelve mañana.',
    };
  }

  // Verificar llamadas del caso
  const caseLimitKey = `gemini:case:${userId}:${caseId}`;
  const callsPerCase = cache.get<number>(caseLimitKey) || 0;
  
  if (callsPerCase >= LIMITS.MAX_CALLS_PER_CASE) {
    return {
      puede: false,
      razon: 'Ya usaste todas las ayudas de IA para este caso.',
    };
  }

  return {
    puede: true,
    llamadasRestantes: LIMITS.MAX_CALLS_PER_CASE - callsPerCase,
  };
}

/**
 * Obtener estadísticas de uso de IA
 */
export function obtenerEstadisticasIA(userId: string): {
  llamadasHoy: number;
  limiteHoy: number;
  porcentajeUsado: number;
} {
  const rateLimitKey = `gemini:ratelimit:${userId}:${new Date().toISOString().split('T')[0]}`;
  const callsToday = cache.get<number>(rateLimitKey) || 0;

  return {
    llamadasHoy: callsToday,
    limiteHoy: LIMITS.MAX_CALLS_PER_USER_PER_DAY,
    porcentajeUsado: Math.round((callsToday / LIMITS.MAX_CALLS_PER_USER_PER_DAY) * 100),
  };
}
