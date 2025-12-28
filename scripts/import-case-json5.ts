// scripts/import-case-json5.ts
// Importar un caso desde archivo JSON5 a la base de datos

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import JSON5 from 'json5';

const prisma = new PrismaClient();

interface OptionData {
  id: string;
  texto: string;
  explicacion?: string;
  esCorrecta?: boolean;
}

interface PasoData {
  id: string;
  tipo: string;
  enunciado: string;
  opciones?: OptionData[];
  feedbackDocente?: string;
  puntosMaximos?: number;
  criteriosEvaluacion?: string[];
  guia?: string;
}

interface CaseData {
  id: string;
  modulo: string;
  dificultad: string;
  titulo: string;
  vigneta: string;
  pasos: PasoData[];
  feedbackDinamico: {
    bajo: string;
    medio: string;
    alto: string;
  };
  referencias: string[];
}

async function importCase(filePath: string) {
  console.log(`📥 Importando caso desde: ${filePath}\n`);

  // Leer archivo JSON5
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const caseData: CaseData = JSON5.parse(fileContent);

  console.log(`📋 Caso: ${caseData.titulo}`);
  console.log(`🆔 ID: ${caseData.id}`);
  console.log(`📚 Módulo: ${caseData.modulo}`);
  console.log(`🎯 Dificultad: ${caseData.dificultad}\n`);

  // Contar preguntas por tipo
  const mcqCount = caseData.pasos.filter(p => p.tipo === 'mcq').length;
  const shortCount = caseData.pasos.filter(p => p.tipo === 'short').length;
  
  // Validar estructura según dificultad
  console.log(`📊 Estructura: ${mcqCount} MCQ + ${shortCount} SHORT = ${caseData.pasos.length} total`);
  const validation = validateCaseStructure(caseData.dificultad, mcqCount, shortCount);
  
  if (!validation.valid) {
    console.error('\n❌ ERRORES DE VALIDACIÓN:');
    validation.errors.forEach(err => console.error(`   - ${err}`));
    console.error('\n📚 Reglas de estructura:');
    console.error('   BAJA: 6 MCQ (A-D)');
    console.error('   MEDIA: 6 MCQ + 1 SHORT');
    console.error('   ALTA: 7 MCQ + 1 SHORT');
    throw new Error('Caso no cumple con la estructura requerida');
  }
  console.log('✅ Estructura válida\n');

  // Mapear dificultad a número
  const difficultyMap: { [key: string]: number } = {
    'Baja': 1,
    'Media': 2,
    'Alta': 3
  };
  const difficulty = difficultyMap[caseData.dificultad] || 2;

  // Crear caso en BD
  const createdCase = await prisma.case.create({
    data: {
      id: caseData.id,
      title: caseData.titulo,
      area: 'Obstetricia', // Extraer del ID o módulo
      difficulty,
      dificultad: caseData.dificultad,
      modulo: caseData.modulo,
      vignette: caseData.vigneta,
      isPublic: true,
      feedbackDinamico: caseData.feedbackDinamico,
      referencias: caseData.referencias,
      updatedAt: new Date(),
    }
  });

  console.log(`✅ Caso creado: ${createdCase.id}\n`);

  // Crear preguntas
  for (let i = 0; i < caseData.pasos.length; i++) {
    const paso = caseData.pasos[i];
    
    console.log(`📝 Pregunta ${i + 1}/${caseData.pasos.length}: ${paso.tipo.toUpperCase()}`);

    const question = await prisma.question.create({
      data: {
        id: `${caseData.id}-${paso.id}`,
        caseId: caseData.id,
        order: i + 1,
        tipo: paso.tipo,
        enunciado: paso.enunciado,
        text: paso.enunciado, // Legacy compatibility
        feedbackDocente: paso.feedbackDocente,
        guia: paso.guia,
        puntosMaximos: paso.puntosMaximos || 0,
        criteriosEval: paso.criteriosEvaluacion || [],
      }
    });

    // Crear opciones si es MCQ
    if (paso.tipo === 'mcq' && paso.opciones) {
      // Validar que tenga exactamente 4 opciones (A-D)
      const optionValidation = validateMcqOptions(paso.opciones.length);
      if (!optionValidation.valid) {
        throw new Error(`Pregunta ${paso.id}: ${optionValidation.error}`);
      }
      
      for (let j = 0; j < paso.opciones.length; j++) {
        const opcion = paso.opciones[j];
        
        await prisma.option.create({
          data: {
            id: `${question.id}-${opcion.id}`,
            questionId: question.id,
            text: opcion.texto,
            explicacion: opcion.explicacion,
            isCorrect: opcion.esCorrecta || false,
            order: j + 1,
          }
        });
      }
      console.log(`   ✅ ${paso.opciones.length} opciones creadas`);
    }
  }

  console.log(`\n✨ Caso importado exitosamente!\n`);
  console.log(`📊 Resumen:`);
  console.log(`   - 1 caso clínico`);
  console.log(`   - ${caseData.pasos.length} preguntas`);
  console.log(`   - ${caseData.pasos.filter(p => p.tipo === 'mcq').length} MCQ`);
  console.log(`   - ${caseData.pasos.filter(p => p.tipo === 'short').length} SHORT`);
  
  const totalOptions = caseData.pasos
    .filter(p => p.opciones)
    .reduce((acc, p) => acc + (p.opciones?.length || 0), 0);
  console.log(`   - ${totalOptions} opciones totales\n`);
}

// Ejecutar
const caseFile = process.argv[2] || 'prisma/cases/hpp-atonia.json5';
const fullPath = path.resolve(process.cwd(), caseFile);

if (!fs.existsSync(fullPath)) {
  console.error(`❌ Error: Archivo no encontrado: ${fullPath}`);
  process.exit(1);
}

importCase(fullPath)
  .catch((error) => {
    console.error('❌ Error importando caso:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
