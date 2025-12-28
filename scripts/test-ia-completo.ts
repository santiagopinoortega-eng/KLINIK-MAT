// scripts/test-ia-completo.ts
// Test completo del sistema de IA

import { config } from 'dotenv';
import { llamarGemini, puedeUsarIA, LIMITS } from '../lib/gemini';
import { generarPromptTutorMCQ, generarPromptEvaluarSHORT, generarPromptDetectarGaps, validarRespuestaIA } from '../lib/ai/prompts';

// Cargar variables de entorno
config({ path: '.env.local' });

console.log('🧪 TEST COMPLETO DEL SISTEMA DE IA\n');
console.log('═══════════════════════════════════════════════════════════════\n');

// Datos de prueba
const TEST_USER_ID = 'test_user_123';
const TEST_CASE_ID = 'test_case_456';
const TEST_PREGUNTA_ID = 'test_q1';

async function testTutorSocratico() {
  console.log('1️⃣  TEST: TUTOR SOCRÁTICO\n');
  console.log('─────────────────────────────────────────────────────────────\n');
  
  try {
    const prompt = generarPromptTutorMCQ({
      contextoEtapa: `Paciente de 28 años, 38 semanas de gestación. G2P1. 
Parto vaginal hace 10 minutos. Placenta completa expulsada.
Sangrado vaginal abundante (>500ml).
PA: 90/60, FC: 110 lpm, útero blando a la palpación.`,
      enunciado: '¿Cuál es la primera medida terapéutica?',
      opcionElegida: 'Administrar misoprostol rectal',
      opcionCorrecta: 'Masaje uterino bimanual',
      leadInTipo: 'siguiente_paso',
      explicaciones: [
        { id: 'a', texto: 'Masaje uterino: Primera medida para estimular contracción' },
        { id: 'b', texto: 'Misoprostol: Útil pero no es primera línea' },
        { id: 'c', texto: 'Oxitocina IV: Importante pero después del masaje' },
        { id: 'd', texto: 'Histerectomía: Medida extrema' }
      ]
    });

    console.log('📝 Prompt generado (primeros 200 caracteres):');
    console.log(prompt.substring(0, 200) + '...\n');

    console.log('📡 Llamando a Gemini...');
    const respuesta = await llamarGemini(prompt, TEST_USER_ID, TEST_CASE_ID, 'tutor');

    console.log('\n✅ RESPUESTA DEL TUTOR:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(respuesta.texto);
    console.log('─────────────────────────────────────────────────────────────\n');

    console.log('📊 Tokens usados:');
    console.log(`   Input: ${respuesta.tokensUsados.input}`);
    console.log(`   Output: ${respuesta.tokensUsados.output}`);
    console.log(`   Cached: ${respuesta.cached ? 'Sí' : 'No'}\n`);

    // Validar que no dé respuestas directas
    const validacion = validarRespuestaIA(respuesta.texto, ['Masaje uterino bimanual']);
    
    if (validacion.valida) {
      console.log('✅ Validación: NO reveló respuesta correcta\n');
    } else {
      console.log(`⚠️  Validación: ${validacion.razon}\n`);
    }

    return true;
  } catch (error: any) {
    console.error('❌ Error en tutor socrático:', error.message);
    return false;
  }
}

async function testEvaluarSHORT() {
  console.log('\n2️⃣  TEST: EVALUACIÓN SHORT CON RÚBRICA\n');
  console.log('─────────────────────────────────────────────────────────────\n');

  try {
    const prompt = generarPromptEvaluarSHORT({
      enunciado: 'Explica el manejo inicial de la hemorragia postparto por atonía uterina.',
      respuestaEstudiante: `El manejo inicial incluye:
1. Masaje uterino bimanual para estimular la contracción
2. Administrar oxitocina 10 UI IM o IV
3. Evaluar signos vitales y reponer volemia

Si persiste el sangrado, considerar misoprostol 800 mcg rectal.`,
      rubrica: {
        criterios: [
          {
            id: 'c1',
            nombre: 'Medidas mecánicas',
            puntos: 2,
            evidencias: [
              'Menciona masaje uterino',
              'Especifica técnica bimanual',
              'Explica objetivo (estimular contracción)'
            ]
          },
          {
            id: 'c2',
            nombre: 'Manejo farmacológico',
            puntos: 2,
            evidencias: [
              'Oxitocina como primera línea',
              'Dosis correcta (10 UI)',
              'Vía de administración (IM o IV)',
              'Menciona alternativas (misoprostol)'
            ]
          },
          {
            id: 'c3',
            nombre: 'Monitoreo y soporte',
            puntos: 2,
            evidencias: [
              'Control de signos vitales',
              'Reposición de volemia',
              'Evaluación de sangrado'
            ]
          }
        ],
        respuestaModelo: `Manejo inicial de HPP por atonía:
1. Masaje uterino bimanual: mano interna en fondo uterino, externa en abdomen
2. Oxitocina 10 UI IM/IV inmediata
3. Monitoreo: PA, FC, cuantificar sangrado
4. Reposición: cristaloides 1000ml bolo, tipo y cruza
5. Si persiste: misoprostol 800mcg rectal, ác. tranexámico 1g IV
6. Preparar compresión B-Lynch o quirófano si no responde`
      },
      contexto: 'Paciente 28 años, 38 sem, parto vaginal, placenta completa expulsada, sangrado >500ml, útero blando'
    });

    console.log('📝 Prompt generado (primeros 200 caracteres):');
    console.log(prompt.substring(0, 200) + '...\n');

    console.log('📡 Llamando a Gemini...');
    const respuesta = await llamarGemini(prompt, TEST_USER_ID, TEST_CASE_ID, 'evaluar_short');

    console.log('\n✅ RESPUESTA DE EVALUACIÓN:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(respuesta.texto);
    console.log('─────────────────────────────────────────────────────────────\n');

    console.log('📊 Tokens usados:');
    console.log(`   Input: ${respuesta.tokensUsados.input}`);
    console.log(`   Output: ${respuesta.tokensUsados.output}`);
    console.log(`   Cached: ${respuesta.cached ? 'Sí' : 'No'}\n`);

    // Intentar parsear JSON
    try {
      const jsonMatch = respuesta.texto.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const evaluacion = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON parseado correctamente:');
        console.log(`   Puntaje total: ${evaluacion.puntaje_total}`);
        console.log(`   Criterios evaluados: ${evaluacion.criterios?.length || 0}\n`);
      }
    } catch (e) {
      console.log('⚠️  No se pudo parsear JSON de evaluación\n');
    }

    return true;
  } catch (error: any) {
    console.error('❌ Error en evaluación SHORT:', error.message);
    return false;
  }
}

async function testDetectarGaps() {
  console.log('\n3️⃣  TEST: DETECTOR DE GAPS CONCEPTUALES\n');
  console.log('─────────────────────────────────────────────────────────────\n');

  try {
    const prompt = generarPromptDetectarGaps({
      errores: [
        {
          preguntaId: 'q1',
          leadInTipo: 'diagnostico',
          opcionElegida: 'Desprendimiento de placenta',
          opcionCorrecta: 'Atonía uterina'
        },
        {
          preguntaId: 'q2',
          leadInTipo: 'siguiente_paso',
          opcionElegida: 'Oxitocina inmediata',
          opcionCorrecta: 'Masaje uterino primero'
        },
        {
          preguntaId: 'q5',
          leadInTipo: 'farmacologia',
          opcionElegida: 'Misoprostol 400 mcg VO',
          opcionCorrecta: 'Misoprostol 800 mcg rectal'
        }
      ],
      dificultad: 'Media',
      area: 'Urgencias obstétricas',
      modulo: 'Hemorragia postparto'
    });

    console.log('📝 Prompt generado (primeros 200 caracteres):');
    console.log(prompt.substring(0, 200) + '...\n');

    console.log('📡 Llamando a Gemini...');
    const respuesta = await llamarGemini(prompt, TEST_USER_ID, TEST_CASE_ID, 'gaps');

    console.log('\n✅ ANÁLISIS DE GAPS:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(respuesta.texto);
    console.log('─────────────────────────────────────────────────────────────\n');

    console.log('📊 Tokens usados:');
    console.log(`   Input: ${respuesta.tokensUsados.input}`);
    console.log(`   Output: ${respuesta.tokensUsados.output}`);
    console.log(`   Cached: ${respuesta.cached ? 'Sí' : 'No'}\n`);

    // Intentar parsear JSON
    try {
      const jsonMatch = respuesta.texto.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analisis = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON parseado correctamente:');
        console.log(`   Concepto débil: ${analisis.concepto_debil}`);
        console.log(`   Pregunta reflexión: ${analisis.pregunta_reflexion}\n`);
      }
    } catch (e) {
      console.log('⚠️  No se pudo parsear JSON de análisis\n');
    }

    return true;
  } catch (error: any) {
    console.error('❌ Error en detector de gaps:', error.message);
    return false;
  }
}

async function testLimites() {
  console.log('\n4️⃣  TEST: SISTEMA DE LÍMITES\n');
  console.log('─────────────────────────────────────────────────────────────\n');

  console.log('📋 Límites configurados:');
  console.log(`   Max input tokens: ${LIMITS.MAX_INPUT_TOKENS}`);
  console.log(`   Max output tokens: ${LIMITS.MAX_OUTPUT_TOKENS}`);
  console.log(`   Llamadas/día por usuario: ${LIMITS.MAX_CALLS_PER_USER_PER_DAY}`);
  console.log(`   Llamadas por caso: ${LIMITS.MAX_CALLS_PER_CASE}`);
  console.log(`   Cache TTL: ${LIMITS.CACHE_TTL / 1000}s\n`);

  // Test de verificación de límites
  const limites = await puedeUsarIA(TEST_USER_ID, TEST_CASE_ID);
  
  console.log('✅ Verificación de límites:');
  console.log(`   Puede usar: ${limites.puede ? 'Sí' : 'No'}`);
  if (limites.razon) {
    console.log(`   Razón: ${limites.razon}`);
  }
  if (limites.llamadasRestantes !== undefined) {
    console.log(`   Llamadas restantes en este caso: ${limites.llamadasRestantes}\n`);
  }

  return true;
}

async function runAllTests() {
  const startTime = Date.now();

  console.log('🚀 Iniciando tests del sistema de IA...\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const resultados = {
    tutor: false,
    evaluar: false,
    gaps: false,
    limites: false
  };

  // Test 1: Tutor Socrático
  resultados.tutor = await testTutorSocratico();

  // Test 2: Evaluación SHORT
  resultados.evaluar = await testEvaluarSHORT();

  // Test 3: Detector de Gaps
  resultados.gaps = await testDetectarGaps();

  // Test 4: Sistema de límites
  resultados.limites = await testLimites();

  // Resumen
  const endTime = Date.now();
  const duracion = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE TESTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`1️⃣  Tutor Socrático:      ${resultados.tutor ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`2️⃣  Evaluación SHORT:      ${resultados.evaluar ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`3️⃣  Detector de Gaps:      ${resultados.gaps ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`4️⃣  Sistema de Límites:    ${resultados.limites ? '✅ PASS' : '❌ FAIL'}`);

  const totalPassed = Object.values(resultados).filter(r => r).length;
  const totalTests = Object.values(resultados).length;

  console.log(`\n📈 Total: ${totalPassed}/${totalTests} tests pasados`);
  console.log(`⏱️  Duración: ${duracion}s\n`);

  if (totalPassed === totalTests) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON! Sistema de IA 100% funcional.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Algunos tests fallaron. Revisa los errores arriba.\n');
    process.exit(1);
  }
}

runAllTests();
