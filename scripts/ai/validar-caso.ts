/**
 * Validador de estructura de casos clínicos
 * Verifica que el JSON generado por IA cumpla con el schema
 */

import { z } from 'zod';

// Schema de validación
const OpcionSchema = z.object({
  id: z.string().regex(/^[a-d]$/),
  texto: z.string().min(10),
  esCorrecta: z.boolean().optional(),
  explicacion: z.string().min(20),
});

const MCQSchema = z.object({
  id: z.string(),
  tipo: z.literal('mcq'),
  etapaId: z.string(),
  leadInTipo: z.enum(['diagnostico', 'siguiente_paso', 'interpretacion_examenes', 'farmacologia', 'pronostico']),
  enunciado: z.string().min(20),
  puntosMaximos: z.number().min(1),
  opciones: z.array(OpcionSchema).length(4),
  feedbackDocente: z.string().optional(),
});

const CriterioRubricaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  puntos: z.number().min(1),
  evidencias: z.array(z.string()).min(2),
  descripcion: z.string(),
});

const SHORTSchema = z.object({
  id: z.string(),
  tipo: z.literal('short'),
  etapaId: z.string(),
  enunciado: z.string().min(40),
  puntosMaximos: z.number().min(3),
  rubrica: z.object({
    criterios: z.array(CriterioRubricaSchema).min(2),
    respuestaModelo: z.string().min(100),
  }),
  guia: z.string().optional(),
  feedbackDocente: z.string().optional(),
});

const EtapaSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  texto: z.string().min(50),
  datos: z.record(z.any()).optional(),
});

const CasoClinicoSchema = z.object({
  id: z.string(),
  version: z.number().default(1),
  areaPrincipal: z.string(),
  modulo: z.string(),
  dificultad: z.enum(['Baja', 'Media', 'Alta']),
  titulo: z.string().min(10),
  objetivosAprendizaje: z.array(z.string()).min(2),
  blueprint: z.object({
    nivelCognitivo: z.enum(['conocimiento', 'comprension', 'aplicacion', 'razonamiento', 'analisis']),
    leadInTipos: z.array(z.string()),
    competencias: z.array(z.string()),
    nivelAtencion: z.array(z.string()),
  }),
  escenario: z.object({
    contexto: z.string(),
    etapas: z.array(EtapaSchema).min(3),
  }),
  pasos: z.array(z.union([MCQSchema, SHORTSchema])).min(6),
  feedbackDinamico: z.object({
    bajo: z.string().min(50),
    medio: z.string().min(50),
    alto: z.string().min(50),
  }),
  referencias: z.array(z.string()).min(3),
  aprendizaje: z.object({
    activarSpacedRepetition: z.boolean(),
    tarjetas: z.array(z.any()).optional(),
    erroresFrecuentes: z.array(z.any()).optional(),
  }).optional(),
  ai: z.object({
    habilitado: z.boolean(),
    usosPermitidos: z.array(z.string()),
    reglas: z.record(z.boolean()).optional(),
  }).optional(),
});

export interface ValidacionResultado {
  valido: boolean;
  errores: string[];
  advertencias: string[];
}

/**
 * Valida la estructura de un caso clínico
 */
export function validarCasoClinico(jsonString: string): ValidacionResultado {
  const errores: string[] = [];
  const advertencias: string[] = [];

  try {
    // 1. Parsear JSON5 (simplificado, remueve comentarios)
    const jsonLimpio = jsonString.replace(/\/\/.+$/gm, '');
    const caso = JSON.parse(jsonLimpio);

    // 2. Validar con Zod
    const resultado = CasoClinicoSchema.safeParse(caso);
    
    if (!resultado.success) {
      resultado.error.errors.forEach(err => {
        errores.push(`${err.path.join('.')}: ${err.message}`);
      });
      return { valido: false, errores, advertencias };
    }

    // 3. Validaciones adicionales (lógica de negocio)
    
    // 3.1 Verificar que solo hay UNA opción correcta por MCQ
    const mcqs = caso.pasos.filter((p: any) => p.tipo === 'mcq');
    mcqs.forEach((mcq: any, idx: number) => {
      const correctas = mcq.opciones.filter((o: any) => o.esCorrecta === true);
      if (correctas.length === 0) {
        errores.push(`MCQ ${mcq.id}: No tiene opción correcta marcada`);
      } else if (correctas.length > 1) {
        errores.push(`MCQ ${mcq.id}: Tiene ${correctas.length} opciones correctas (debe ser solo 1)`);
      }

      // Verificar longitud de opciones
      const longitudes = mcq.opciones.map((o: any) => o.texto.length);
      const maxLong = Math.max(...longitudes);
      const minLong = Math.min(...longitudes);
      if (maxLong / minLong > 2) {
        advertencias.push(`MCQ ${mcq.id}: Opciones muy desbalanceadas en longitud (${minLong}-${maxLong} chars)`);
      }
    });

    // 3.2 Verificar cantidad de preguntas según dificultad
    const numMCQ = mcqs.length;
    const numSHORT = caso.pasos.filter((p: any) => p.tipo === 'short').length;
    
    const expectedMCQ = caso.dificultad === 'Baja' ? 6 : caso.dificultad === 'Media' ? 6 : 7;
    const expectedSHORT = caso.dificultad === 'Baja' ? 0 : 1;
    
    if (numMCQ !== expectedMCQ) {
      errores.push(`Dificultad ${caso.dificultad}: Debe tener ${expectedMCQ} MCQ, tiene ${numMCQ}`);
    }
    if (numSHORT !== expectedSHORT) {
      errores.push(`Dificultad ${caso.dificultad}: Debe tener ${expectedSHORT} SHORT, tiene ${numSHORT}`);
    }

    // 3.3 Verificar suma de puntos de rúbrica en SHORT
    const shorts = caso.pasos.filter((p: any) => p.tipo === 'short');
    shorts.forEach((short: any) => {
      const sumaPuntos = short.rubrica.criterios.reduce((acc: number, c: any) => acc + c.puntos, 0);
      if (sumaPuntos !== short.puntosMaximos) {
        errores.push(`SHORT ${short.id}: Suma de criterios (${sumaPuntos}) ≠ puntosMaximos (${short.puntosMaximos})`);
      }
    });

    // 3.4 Verificar que etapas referenciadas existen
    const etapaIds = caso.escenario.etapas.map((e: any) => e.id);
    caso.pasos.forEach((paso: any) => {
      if (!etapaIds.includes(paso.etapaId)) {
        errores.push(`Paso ${paso.id}: Referencia etapa inexistente "${paso.etapaId}"`);
      }
    });

    // 3.5 Verificar que todas las opciones tienen explicación
    mcqs.forEach((mcq: any) => {
      mcq.opciones.forEach((opcion: any) => {
        if (!opcion.explicacion || opcion.explicacion.trim().length < 20) {
          advertencias.push(`MCQ ${mcq.id}, opción ${opcion.id}: Explicación muy corta o vacía`);
        }
      });
    });

    // 3.6 Verificar palabras absolutas (pistas técnicas)
    const palabrasAbsolutas = ['siempre', 'nunca', 'todos', 'ninguno', 'jamás'];
    mcqs.forEach((mcq: any) => {
      mcq.opciones.forEach((opcion: any) => {
        palabrasAbsolutas.forEach(palabra => {
          if (opcion.texto.toLowerCase().includes(palabra)) {
            advertencias.push(`MCQ ${mcq.id}, opción ${opcion.id}: Contiene "${palabra}" (evitar absolutismos)`);
          }
        });
      });
    });

    return {
      valido: errores.length === 0,
      errores,
      advertencias,
    };

  } catch (error: any) {
    return {
      valido: false,
      errores: [`Error parseando JSON: ${error.message}`],
      advertencias: [],
    };
  }
}

/**
 * Validación rápida de sintaxis JSON5
 */
export function validarSintaxisJSON5(jsonString: string): { valido: boolean; error?: string } {
  try {
    const limpio = jsonString.replace(/\/\/.+$/gm, '');
    JSON.parse(limpio);
    return { valido: true };
  } catch (error: any) {
    return { valido: false, error: error.message };
  }
}

/**
 * Imprime reporte de validación
 */
export function imprimirReporteValidacion(resultado: ValidacionResultado): void {
  console.log('\n🔍 REPORTE DE VALIDACIÓN\n');
  
  if (resultado.valido) {
    console.log('✅ Caso válido - Listo para usar\n');
  } else {
    console.log(`❌ Caso inválido - ${resultado.errores.length} errores\n`);
    console.log('ERRORES:');
    resultado.errores.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err}`);
    });
    console.log();
  }

  if (resultado.advertencias.length > 0) {
    console.log(`⚠️  ${resultado.advertencias.length} advertencias:\n`);
    resultado.advertencias.forEach((adv, idx) => {
      console.log(`  ${idx + 1}. ${adv}`);
    });
    console.log();
  }
}
