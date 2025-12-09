// lib/scoring.ts
/**
 * Lógica de evaluación de respuestas Short
 * 
 * Criterios de evaluación automática:
 * - ≥70% de criterios cumplidos → 2 puntos ✅
 * - 40-69% de criterios cumplidos → 1 punto ⚠️
 * - <40% de criterios cumplidos → 0 puntos ❌
 */

/**
 * Normaliza texto quitando acentos y convirtiendo a minúsculas
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Quita acentos
}

/**
 * Extrae palabras clave significativas (≥4 letras) de un criterio
 */
export function extractKeywords(criterio: string): string[] {
  return criterio
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter(word => word.length >= 4);
}

/**
 * Evalúa una respuesta Short contra criterios de evaluación
 * 
 * @param respuesta - Texto de la respuesta del estudiante
 * @param criterios - Lista de criterios esperados
 * @param puntosMaximos - Puntos máximos posibles (default: 2)
 * @returns Puntos obtenidos (0, 1 o 2)
 */
export function evaluateShortAnswer(
  respuesta: string,
  criterios: string[],
  puntosMaximos: number = 2
): number {
  // Validación básica
  if (!respuesta || respuesta.trim().length < 20) {
    return 0; // Respuesta muy corta
  }

  // Si no hay criterios, retornar puntos máximos (autoevaluación manual)
  if (!criterios || criterios.length === 0) {
    return puntosMaximos;
  }

  const textoNormalizado = normalizeText(respuesta);
  
  // Contar criterios cumplidos
  let criteriosCumplidos = 0;
  
  criterios.forEach(criterio => {
    const palabrasClave = extractKeywords(criterio);
    
    // Si al menos una palabra clave del criterio está presente
    const criterioCumplido = palabrasClave.some(palabra => 
      textoNormalizado.includes(palabra)
    );
    
    if (criterioCumplido) {
      criteriosCumplidos++;
    }
  });

  // Calcular porcentaje de criterios cumplidos
  const porcentaje = (criteriosCumplidos / criterios.length) * 100;

  // Asignar puntos según porcentaje
  if (porcentaje >= 70) {
    return puntosMaximos; // 2 puntos ✅
  } else if (porcentaje >= 40) {
    return Math.floor(puntosMaximos / 2); // 1 punto ⚠️
  } else {
    return 0; // 0 puntos ❌
  }
}

/**
 * Calcula el porcentaje de respuestas correctas
 * 
 * @param score - Puntos obtenidos
 * @param totalPoints - Puntos totales posibles
 * @returns Porcentaje redondeado (0-100)
 */
export function calculatePercentage(score: number, totalPoints: number): number {
  if (totalPoints === 0) return 0;
  return Math.round((score / totalPoints) * 100);
}

/**
 * Categoriza el resultado según el porcentaje
 * 
 * @param percentage - Porcentaje obtenido (0-100)
 * @returns Categoría del resultado
 */
export function categorizeResult(percentage: number): 'Excelente' | 'Aprobado' | 'Reprobado' {
  if (percentage >= 90) return 'Excelente';
  if (percentage >= 70) return 'Aprobado';
  return 'Reprobado';
}

/**
 * Valida que un score sea correcto
 * 
 * @param score - Puntos obtenidos
 * @param totalPoints - Puntos totales
 * @returns true si el score es válido
 */
export function validateScore(score: number, totalPoints: number): boolean {
  return score >= 0 && score <= totalPoints;
}
