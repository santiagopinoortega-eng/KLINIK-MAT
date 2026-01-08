// app/api/casos/[id]/answer/route.ts
// Lógica para verificar la opción seleccionada.

import { NextResponse } from 'next/server';
import { compose, withAuth, withRateLimit, withLogging, withValidation } from '@/lib/middleware/api-middleware';
import { getOptionDetails } from '@/services/caso.service';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { NotFoundError, ValidationError } from '@/lib/errors/app-errors';
import { z } from 'zod';

const AnswerDto = z.object({
  optionId: z.string().min(1, 'Option ID es requerido'),
});

// Manejador POST para verificar la respuesta del usuario.
export const POST = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.WRITE),
  withValidation(AnswerDto),
  withLogging
)(async (req, context, params: { id: string }) => {
  const { optionId } = context.body;

  // 1. Obtener los detalles completos y seguros de la opción
  const option = await getOptionDetails(optionId);

  if (!option) {
    throw new NotFoundError('Option');
  }

  // 2. Lógica de Grading (Razonamiento Clínico)
  const isCorrect = option.isCorrect;
  const feedback = option.feedback || (isCorrect 
      ? "¡Excelente! Esta es la conducta correcta según la norma MINSAL." 
      : "La respuesta seleccionada es incorrecta. Revisa el feedback para entender el error clínico.");

  // 3. Devolver el resultado al cliente
  return NextResponse.json({
    success: true,
    isCorrect,
    feedback,
    optionId: option.id, 
  });
});