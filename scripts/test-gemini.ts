// scripts/test-gemini.ts
// Script para verificar configuración de Gemini API

import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Cargar variables de entorno
config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
  console.log('🧪 Testeando configuración de Gemini...\n');

  // 1. Verificar API key
  if (!GEMINI_API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY no está configurada');
    console.log('   → Agrega GEMINI_API_KEY a tu archivo .env');
    console.log('   → Obtén tu key en: https://makersuite.google.com/app/apikey\n');
    process.exit(1);
  }

  console.log('✓ API key encontrada');
  console.log(`  Key: ${GEMINI_API_KEY.slice(0, 10)}...${GEMINI_API_KEY.slice(-5)}\n`);

  // 2. Inicializar cliente
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('✓ Cliente Gemini inicializado\n');

    // 3. Test simple
    console.log('📡 Haciendo llamada de prueba...');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp', // Gemini Flash 3.0 - ÚNICO MODELO
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7,
      },
    });

    const prompt = `Eres un tutor médico. Haz UNA pregunta socrática sobre diagnóstico diferencial de dolor abdominal agudo en embarazo. Máximo 20 palabras.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const texto = response.text();

    console.log('✓ Respuesta recibida:\n');
    console.log('─────────────────────────────────────────────');
    console.log(texto);
    console.log('─────────────────────────────────────────────\n');

    // 4. Verificar límites
    const longitudTexto = texto.length;
    const tokensAprox = Math.ceil(longitudTexto / 4);

    console.log('📊 Métricas:');
    console.log(`   - Longitud respuesta: ${longitudTexto} caracteres`);
    console.log(`   - Tokens aprox (output): ${tokensAprox}`);
    console.log(`   - Tokens aprox (input): ${Math.ceil(prompt.length / 4)}`);
    
    // Calcular costo
    const costoInput = (Math.ceil(prompt.length / 4) / 1_000_000) * 0.075;
    const costoOutput = (tokensAprox / 1_000_000) * 0.30;
    const costoTotal = costoInput + costoOutput;

    console.log(`\n💰 Costo estimado:`)
    console.log(`   - Input: $${costoInput.toFixed(6)}`);
    console.log(`   - Output: $${costoOutput.toFixed(6)}`);
    console.log(`   - Total: $${costoTotal.toFixed(6)}`);

    console.log('\n✅ CONFIGURACIÓN CORRECTA\n');
    console.log('Próximos pasos:');
    console.log('  1. npm run dev (iniciar servidor)');
    console.log('  2. Ir a un caso clínico');
    console.log('  3. Responder incorrectamente una pregunta MCQ');
    console.log('  4. Hacer clic en "Solicitar ayuda del tutor IA"');
    console.log('  5. Verificar que no da respuestas directas\n');

  } catch (error: any) {
    console.error('❌ ERROR al llamar Gemini API:\n');
    console.error(error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 Solución:');
      console.log('   - Verifica que tu API key sea válida');
      console.log('   - Obtén una nueva en: https://makersuite.google.com/app/apikey');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.log('\n💡 Solución:');
      console.log('   - Has excedido tu cuota gratuita');
      console.log('   - Activa facturación en Google Cloud Console');
    }
    
    process.exit(1);
  }
}

testGemini();
