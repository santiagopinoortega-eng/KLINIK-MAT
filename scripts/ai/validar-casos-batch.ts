#!/usr/bin/env ts-node
/**
 * Validador batch de casos clínicos
 * Valida todos los archivos JSON5 en prisma/cases/
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { validarCasoClinico, imprimirReporteValidacion, ValidacionResultado } from './validar-caso';

const CASES_DIR = path.join(__dirname, '../../prisma/cases');

async function validarTodosLosCasos() {
  console.log('🔍 Validador Batch de Casos Clínicos\n');
  console.log(`Directorio: ${CASES_DIR}\n`);

  try {
    // Leer todos los archivos .json5
    const files = await fs.readdir(CASES_DIR);
    const json5Files = files.filter(f => f.endsWith('.json5'));

    if (json5Files.length === 0) {
      console.log('⚠️  No se encontraron archivos .json5 en el directorio');
      return;
    }

    console.log(`Encontrados ${json5Files.length} archivos\n`);
    console.log('='.repeat(60));

    const resultados: Array<{ file: string; resultado: ValidacionResultado }> = [];

    // Validar cada archivo
    for (const file of json5Files) {
      const filePath = path.join(CASES_DIR, file);
      const contenido = await fs.readFile(filePath, 'utf-8');

      console.log(`\n📄 Validando: ${file}`);
      const resultado = validarCasoClinico(contenido);

      resultados.push({ file, resultado });

      if (resultado.valido) {
        console.log('✅ Válido');
      } else {
        console.log(`❌ Inválido (${resultado.errores.length} errores)`);
      }

      if (resultado.advertencias.length > 0) {
        console.log(`⚠️  ${resultado.advertencias.length} advertencias`);
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN FINAL\n');

    const validos = resultados.filter(r => r.resultado.valido);
    const invalidos = resultados.filter(r => !r.resultado.valido);
    const conAdvertencias = resultados.filter(r => r.resultado.advertencias.length > 0);

    console.log(`✅ Válidos: ${validos.length}/${resultados.length}`);
    console.log(`❌ Inválidos: ${invalidos.length}/${resultados.length}`);
    console.log(`⚠️  Con advertencias: ${conAdvertencias.length}/${resultados.length}\n`);

    if (invalidos.length > 0) {
      console.log('Archivos con errores:');
      invalidos.forEach(({ file, resultado }) => {
        console.log(`\n  ${file}:`);
        resultado.errores.forEach(err => console.log(`    - ${err}`));
      });
      console.log();
    }

    if (conAdvertencias.length > 0) {
      console.log('Archivos con advertencias:');
      conAdvertencias.forEach(({ file, resultado }) => {
        console.log(`\n  ${file}:`);
        resultado.advertencias.forEach(adv => console.log(`    - ${adv}`));
      });
      console.log();
    }

    // Exit code
    if (invalidos.length > 0) {
      console.log('❌ Validación falló\n');
      process.exit(1);
    } else {
      console.log('✅ Todos los casos son válidos\n');
      process.exit(0);
    }

  } catch (error: any) {
    console.error('Error ejecutando validación:', error.message);
    process.exit(1);
  }
}

// Ejecutar
if (require.main === module) {
  validarTodosLosCasos();
}
