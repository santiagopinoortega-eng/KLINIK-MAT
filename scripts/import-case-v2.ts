// scripts/import-case-v2.ts
// Importador para estructura completa de casos clínicos v2

import { PrismaClient } from '@prisma/client';
import JSON5 from 'json5';
import * as fs from 'fs';
import type { CasoClinico } from '../lib/types/caso-clinico';
import { validarEstructuraCasoCompleto } from '../lib/types/caso-clinico';

const prisma = new PrismaClient();

async function importarCasoV2(filePath: string) {
  console.log(`\n📥 Importando caso v2 desde: ${filePath}\n`);

  // Leer y parsear JSON5
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const casoData: CasoClinico = JSON5.parse(fileContent);

  // Validar estructura completa
  const validacion = validarEstructuraCasoCompleto(casoData);
  if (!validacion.valido) {
    console.error('❌ ERRORES DE VALIDACIÓN:');
    validacion.errores.forEach(err => console.error(`   - ${err}`));
    throw new Error('Caso no cumple con la estructura requerida');
  }
  console.log('✅ Validación estructural exitosa\n');

  // Mapear dificultad a número
  const difficultyMap: Record<string, number> = {
    'Baja': 1,
    'Media': 2,
    'Alta': 3
  };

  console.log(`📋 Caso: ${casoData.titulo}`);
  console.log(`🆔 ID: ${casoData.id}`);
  console.log(`📚 Área: ${casoData.areaPrincipal}`);
  console.log(`🎯 Dificultad: ${casoData.dificultad}`);
  console.log(`📖 Objetivos: ${casoData.objetivosAprendizaje.length}`);
  console.log(`🎭 Etapas: ${casoData.escenario.etapas.length}`);
  console.log(`❓ Preguntas: ${casoData.pasos.length}\n`);

  // Crear caso en BD
  const caso = await prisma.case.create({
    data: {
      id: casoData.id,
      version: casoData.version || 1,
      title: casoData.titulo,
      area: casoData.areaPrincipal,
      difficulty: difficultyMap[casoData.dificultad],
      dificultad: casoData.dificultad,
      modulo: casoData.modulo,
      summary: casoData.escenario.contexto,
      isPublic: true,
      
      // Nuevos campos JSON
      objetivosAprendizaje: casoData.objetivosAprendizaje,
      blueprint: casoData.blueprint as any,
      escenario: casoData.escenario as any,
      feedbackDinamico: casoData.feedbackDinamico as any,
      referencias: casoData.referencias,
      aprendizaje: casoData.aprendizaje as any,
      ai: casoData.ai as any,
      
      updatedAt: new Date(),
    }
  });

  console.log(`✅ Caso creado: ${caso.id}\n`);

  // Crear preguntas
  let mcqCount = 0;
  let shortCount = 0;

  for (let i = 0; i < casoData.pasos.length; i++) {
    const paso = casoData.pasos[i];
    
    console.log(`📝 Pregunta ${i + 1}/${casoData.pasos.length}: ${paso.tipo.toUpperCase()} (${paso.id})`);

    const questionData: any = {
      id: `${casoData.id}-${paso.id}`,
      caseId: casoData.id,
      order: i + 1,
      tipo: paso.tipo,
      enunciado: paso.enunciado,
      text: paso.enunciado,
      puntosMaximos: paso.puntosMaximos,
      feedbackDocente: paso.feedbackDocente,
    };

    // Campos específicos según tipo
    if (paso.tipo === 'mcq') {
      questionData.etapaId = paso.etapaId;
      questionData.leadInTipo = paso.leadInTipo;
      questionData.controlCalidad = paso.controlCalidad || null;
      mcqCount++;
    } else if (paso.tipo === 'short') {
      questionData.etapaId = paso.etapaId;
      questionData.rubrica = paso.rubrica;
      questionData.guia = paso.guia;
      questionData.evaluacionAuto = paso.evaluacionAutomatica || null;
      shortCount++;
    }

    const question = await prisma.question.create({
      data: questionData
    });

    // Crear opciones si es MCQ
    if (paso.tipo === 'mcq' && paso.opciones) {
      console.log(`   Creando ${paso.opciones.length} opciones...`);
      
      for (let j = 0; j < paso.opciones.length; j++) {
        const opcion = paso.opciones[j];
        
        await prisma.option.create({
          data: {
            id: `${question.id}-${opcion.id}`,
            questionId: question.id,
            text: opcion.texto,
            isCorrect: opcion.esCorrecta || false,
            explicacion: opcion.explicacion,
            order: j + 1,
          }
        });
      }
    }
  }

  console.log(`\n✨ Caso importado exitosamente!`);
  console.log(`📊 Resumen:`);
  console.log(`   - 1 caso clínico (v${casoData.version})`);
  console.log(`   - ${casoData.pasos.length} preguntas (${mcqCount} MCQ + ${shortCount} SHORT)`);
  console.log(`   - ${casoData.escenario.etapas.length} etapas del escenario`);
  console.log(`   - ${casoData.referencias.length} referencias bibliográficas`);
  if (casoData.aprendizaje?.tarjetas) {
    console.log(`   - ${casoData.aprendizaje.tarjetas.length} tarjetas SRS`);
  }
  if (casoData.ai?.habilitado) {
    console.log(`   - IA habilitada con ${casoData.ai.usosPermitidos.length} usos permitidos`);
  }
}

// Ejecutar
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Uso: npx ts-node scripts/import-case-v2.ts <archivo.json5>');
  process.exit(1);
}

const filePath = args[0];
if (!fs.existsSync(filePath)) {
  console.error(`❌ Archivo no encontrado: ${filePath}`);
  process.exit(1);
}

importarCasoV2(filePath)
  .then(() => {
    console.log('\n🎉 Proceso completado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error durante la importación:', error.message);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
