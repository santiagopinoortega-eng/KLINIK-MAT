#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import JSON5 from 'json5';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CASES_FILE = join(__dirname, '../prisma/cases.json5');

try {
  console.log('📖 Leyendo archivo cases.json5...');
  const rawData = readFileSync(CASES_FILE, 'utf-8');
  
  console.log(`📏 Tamaño del archivo: ${rawData.length} caracteres`);
  console.log(`📄 Líneas: ${rawData.split('\n').length}`);
  
  console.log('\n🔍 Parseando JSON5...');
  const cases = JSON5.parse(rawData);
  
  console.log(`✅ Parseo exitoso!`);
  console.log(`📊 Total de casos: ${cases.length}`);
  
  // Mostrar primeros 3 casos con conteo de pasos
  console.log('\n📋 Primeros 3 casos:');
  cases.slice(0, 3).forEach((caso, idx) => {
    const mcqCount = caso.pasos?.filter(p => p.tipo === 'mcq').length || 0;
    const shortCount = caso.pasos?.filter(p => p.tipo === 'short').length || 0;
    
    console.log(`\n${idx + 1}. ${caso.id}`);
    console.log(`   Dificultad: ${caso.dificultad}`);
    console.log(`   MCQ: ${mcqCount}, Short: ${shortCount}`);
    console.log(`   Total pasos: ${caso.pasos?.length || 0}`);
    console.log(`   feedbackDinamico: ${caso.feedbackDinamico ? 'Sí' : 'No'}`);
  });
  
} catch (error) {
  console.error('❌ Error al parsear:', error.message);
  if (error.lineNumber) {
    console.error(`   Línea: ${error.lineNumber}`);
    console.error(`   Columna: ${error.columnNumber}`);
  }
  process.exit(1);
}
