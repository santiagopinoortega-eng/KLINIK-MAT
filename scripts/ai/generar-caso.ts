#!/usr/bin/env ts-node
/**
 * Generador de casos clínicos usando Claude/GPT-4
 * Uso: npx ts-node scripts/ai/generar-caso.ts --area "Urgencias obstétricas" --cantidad 5
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { CASO_CLINICO_PROMPT } from './prompts';
import { validarCasoClinico } from './validar-caso';

// Configuración
const PROVIDER = process.env.AI_PROVIDER || 'claude'; // 'claude' o 'gpt4'
const OUTPUT_DIR = path.join(__dirname, '../../prisma/cases');

// Clientes IA
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface GenerarCasoParams {
  area: string;
  modulo?: string;
  dificultad: 'Baja' | 'Media' | 'Alta';
  tema?: string;
}

/**
 * Genera un caso clínico usando IA
 */
async function generarCasoConIA(params: GenerarCasoParams): Promise<string> {
  const { area, modulo, dificultad, tema } = params;
  
  const userPrompt = `
Genera un caso clínico con las siguientes características:

**Área:** ${area}
**Módulo:** ${modulo || 'General'}
**Dificultad:** ${dificultad}
${tema ? `**Tema específico:** ${tema}` : ''}

IMPORTANTE:
- Usa datos clínicos realistas de Chile (protocolos MINSAL)
- Sigue EXACTAMENTE el formato JSON5 del ejemplo
- ${dificultad === 'Baja' ? '6 MCQ' : dificultad === 'Media' ? '6 MCQ + 1 SHORT' : '7 MCQ + 1 SHORT'}
- Incluye etapas progresivas del caso (3-4 etapas)
- Lead-in tipos variados: diagnostico, siguiente_paso, interpretacion, farmacologia
- Opciones homogéneas en longitud y complejidad
- Explicaciones pedagógicas en TODAS las opciones
- Referencias a guías MINSAL cuando aplique

Responde SOLO con el JSON5 válido, sin markdown ni explicaciones adicionales.
`.trim();

  let respuestaIA: string;

  if (PROVIDER === 'claude') {
    console.log('🤖 Generando con Claude Sonnet 4...');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      temperature: 0.7,
      system: CASO_CLINICO_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    respuestaIA = message.content[0].type === 'text' ? message.content[0].text : '';
  } else {
    console.log('🤖 Generando con GPT-4...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: 8000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: CASO_CLINICO_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    });

    respuestaIA = completion.choices[0]?.message?.content || '';
  }

  return respuestaIA;
}

/**
 * Limpia la respuesta de la IA (remueve markdown, etc.)
 */
function limpiarRespuestaIA(respuesta: string): string {
  // Remover bloques de código markdown
  let limpia = respuesta.replace(/```json5?\n?/g, '').replace(/```\n?/g, '');
  
  // Remover comentarios al inicio si los hay
  limpia = limpia.replace(/^\/\/.+\n/gm, '');
  
  return limpia.trim();
}

/**
 * Genera un ID único para el caso
 */
function generarIdCaso(area: string, modulo: string): string {
  const areaSlug = area.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const moduloSlug = modulo.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const timestamp = Date.now().toString().slice(-6);
  
  return `${areaSlug}-${moduloSlug}-${timestamp}`;
}

/**
 * Guarda el caso en archivo JSON5
 */
async function guardarCaso(casoJSON: string, area: string): Promise<string> {
  // Crear directorio si no existe
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  // Parsear para obtener ID o módulo
  const caso = JSON.parse(casoJSON.replace(/\/\/.+/g, '')); // JSON5 simple parse
  const id = caso.id || generarIdCaso(area, caso.modulo || 'general');
  
  const filename = `${id}.json5`;
  const filepath = path.join(OUTPUT_DIR, filename);
  
  // Guardar con formato bonito
  await fs.writeFile(filepath, casoJSON, 'utf-8');
  
  console.log(`✅ Caso guardado: ${filename}`);
  return filepath;
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parsear argumentos
  const area = args.find(a => a.startsWith('--area'))?.split('=')[1] || 'Embarazo y control prenatal';
  const modulo = args.find(a => a.startsWith('--modulo'))?.split('=')[1];
  const dificultad = (args.find(a => a.startsWith('--dificultad'))?.split('=')[1] || 'Media') as 'Baja' | 'Media' | 'Alta';
  const cantidad = parseInt(args.find(a => a.startsWith('--cantidad'))?.split('=')[1] || '1');
  const tema = args.find(a => a.startsWith('--tema'))?.split('=')[1];
  
  console.log('🎯 Generador de Casos Clínicos con IA\n');
  console.log(`Área: ${area}`);
  console.log(`Módulo: ${modulo || 'General'}`);
  console.log(`Dificultad: ${dificultad}`);
  console.log(`Cantidad: ${cantidad}`);
  console.log(`Proveedor: ${PROVIDER.toUpperCase()}\n`);
  
  // Validar API keys
  if (PROVIDER === 'claude' && !process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Error: ANTHROPIC_API_KEY no configurada');
    process.exit(1);
  }
  
  if (PROVIDER === 'gpt4' && !process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY no configurada');
    process.exit(1);
  }
  
  const casosGenerados: string[] = [];
  const errores: string[] = [];
  
  // Generar casos
  for (let i = 0; i < cantidad; i++) {
    console.log(`\n📝 Generando caso ${i + 1}/${cantidad}...`);
    
    try {
      // Generar con IA
      const respuesta = await generarCasoConIA({
        area,
        modulo,
        dificultad,
        tema,
      });
      
      // Limpiar respuesta
      const casoJSON = limpiarRespuestaIA(respuesta);
      
      // Validar estructura
      console.log('🔍 Validando estructura...');
      const validacion = validarCasoClinico(casoJSON);
      
      if (!validacion.valido) {
        throw new Error(`Validación falló: ${validacion.errores.join(', ')}`);
      }
      
      // Guardar
      const filepath = await guardarCaso(casoJSON, area);
      casosGenerados.push(filepath);
      
      console.log(`✅ Caso ${i + 1} completado`);
      
      // Esperar 2s entre llamadas (rate limiting)
      if (i < cantidad - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error: any) {
      console.error(`❌ Error en caso ${i + 1}:`, error.message);
      errores.push(`Caso ${i + 1}: ${error.message}`);
    }
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN');
  console.log('='.repeat(50));
  console.log(`✅ Casos generados: ${casosGenerados.length}/${cantidad}`);
  console.log(`❌ Errores: ${errores.length}`);
  
  if (casosGenerados.length > 0) {
    console.log('\n📁 Archivos creados:');
    casosGenerados.forEach(f => console.log(`  - ${path.basename(f)}`));
  }
  
  if (errores.length > 0) {
    console.log('\n⚠️  Errores encontrados:');
    errores.forEach(e => console.log(`  - ${e}`));
  }
  
  console.log('\n💡 Próximos pasos:');
  console.log('1. Revisar casos generados en prisma/cases/');
  console.log('2. Validar contenido médico y ajustar si necesario');
  console.log('3. Ejecutar: npm run seed:cases');
}

// Ejecutar
if (require.main === module) {
  main().catch(console.error);
}

export { generarCasoConIA, guardarCaso };
