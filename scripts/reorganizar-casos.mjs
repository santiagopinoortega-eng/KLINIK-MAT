#!/usr/bin/env node
/**
 * Script para reorganizar cases.json5 en archivos por módulo
 * Separa los casos en la nueva estructura de carpetas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSON5 from 'json5';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeo de módulos a carpetas y archivos
const MODULE_MAPPING = {
  'ITS': { folder: 'GINECOLOGIA', file: 'ITS.json5', area: 'ginecologia' },
  'Climaterio y Menopausia': { folder: 'GINECOLOGIA', file: 'CLIMATERIO.json5', area: 'ginecologia' },
  'Anticoncepción': { folder: 'SSR', file: 'ANTICONCEPCION.json5', area: 'ssr' },
  'Consejería': { folder: 'SSR', file: 'CONSEJERIA.json5', area: 'ssr' },
};

async function main() {
  console.log('🔄 Reorganizando casos por módulo...\n');

  // Leer el archivo principal
  const mainFilePath = path.resolve(__dirname, '..', 'prisma', 'cases.json5');
  
  if (!fs.existsSync(mainFilePath)) {
    console.error('❌ No se encontró el archivo cases.json5');
    process.exit(1);
  }

  const rawData = fs.readFileSync(mainFilePath, 'utf8');
  const allCases = JSON5.parse(rawData);

  if (!Array.isArray(allCases)) {
    console.error('❌ El archivo cases.json5 no contiene un array válido');
    process.exit(1);
  }

  console.log(`📊 Total de casos encontrados: ${allCases.length}\n`);

  // Agrupar casos por módulo
  const casesByModule = {};
  
  for (const caso of allCases) {
    const modulo = caso.modulo || caso.area || 'Sin módulo';
    
    if (!casesByModule[modulo]) {
      casesByModule[modulo] = [];
    }
    
    casesByModule[modulo].push(caso);
  }

  // Mostrar resumen
  console.log('📋 Distribución de casos por módulo:\n');
  for (const [modulo, casos] of Object.entries(casesByModule)) {
    console.log(`   ${modulo}: ${casos.length} casos`);
  }
  console.log('');

  // Crear archivos por módulo
  let totalCreated = 0;
  
  for (const [moduloName, mapping] of Object.entries(MODULE_MAPPING)) {
    const casos = casesByModule[moduloName] || [];
    
    if (casos.length === 0) {
      console.log(`⚠️  ${moduloName}: Sin casos, creando archivo vacío`);
      continue;
    }

    // Ordenar por dificultad y título
    const difficultyOrder = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
    casos.sort((a, b) => {
      const diffA = difficultyOrder[a.dificultad] || 0;
      const diffB = difficultyOrder[b.dificultad] || 0;
      if (diffB !== diffA) return diffB - diffA;
      return (a.titulo || '').localeCompare(b.titulo || '');
    });

    // Crear el archivo
    const targetDir = path.resolve(__dirname, '..', 'prisma', 'cases', mapping.folder);
    const targetFile = path.join(targetDir, mapping.file);
    
    // Asegurar que el directorio existe
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Generar contenido con comentarios
    let content = `// Casos Clínicos: ${moduloName}\n`;
    content += `// Área: ${mapping.area.toUpperCase()}\n`;
    content += `// Total de casos: ${casos.length}\n`;
    content += `// Última actualización: ${new Date().toISOString().split('T')[0]}\n\n`;
    
    // Agregar casos con formato JSON5 bonito
    content += JSON.stringify(casos, null, 2);
    
    fs.writeFileSync(targetFile, content, 'utf8');
    
    console.log(`✅ ${mapping.folder}/${mapping.file} - ${casos.length} casos`);
    totalCreated++;
  }

  console.log(`\n✨ Reorganización completada: ${totalCreated} archivos creados\n`);
  
  // Crear archivos placeholder para módulos futuros
  console.log('📝 Creando archivos placeholder para módulos futuros...\n');
  
  const placeholders = [
    { folder: 'OBSTETRICIA', file: 'EMBARAZO.json5', modulo: 'Embarazo' },
    { folder: 'OBSTETRICIA', file: 'PARTO.json5', modulo: 'Parto' },
    { folder: 'OBSTETRICIA', file: 'PUERPERIO.json5', modulo: 'Puerperio' },
    { folder: 'NEONATOLOGIA', file: 'RN.json5', modulo: 'Recién Nacido' },
  ];

  for (const placeholder of placeholders) {
    const targetDir = path.resolve(__dirname, '..', 'prisma', 'cases', placeholder.folder);
    const targetFile = path.join(targetDir, placeholder.file);
    
    if (!fs.existsSync(targetFile)) {
      const content = `// Casos Clínicos: ${placeholder.modulo}\n// Próximamente\n\n[]`;
      fs.writeFileSync(targetFile, content, 'utf8');
      console.log(`   📄 ${placeholder.folder}/${placeholder.file}`);
    }
  }

  console.log('\n🎉 ¡Reorganización completada exitosamente!');
  console.log('\n💡 Próximos pasos:');
  console.log('   1. Revisar los archivos creados en prisma/cases/');
  console.log('   2. Ejecutar: npm run seed:cases');
  console.log('   3. (Opcional) Renombrar cases.json5 a cases.json5.backup\n');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
