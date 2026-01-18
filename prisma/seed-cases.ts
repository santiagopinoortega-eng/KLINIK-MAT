// prisma/seed-cases.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import JSON5 from 'json5';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

interface CaseData {
  id: string;
  titulo: string;
  area: string;
  modulo: string;
  dificultad: string;
  objetivosAprendizaje: string[];
  vignette: string;
  pasos: Array<{
    tipo?: string;
    enunciado: string;
    opciones?: Array<{
      texto: string;
      esCorrecta: boolean;
      explicacion: string;
    }>;
    criteriosEvaluacion?: string[];
    guia?: string;
  }>;
  feedbackDinamico: {
    bajo: string;
    medio: string;
    alto: string;
  };
  referencias: string[];
}

async function loadCasesFromDirectory(dirPath: string) {
  const casesFile = path.join(dirPath, 'cases.json5');
  
  if (!fs.existsSync(casesFile)) {
    console.log(`⚠️  No se encontró ${casesFile}`);
    return [];
  }

  const content = fs.readFileSync(casesFile, 'utf8');
  const cases = JSON5.parse(content) as CaseData[];
  
  return cases;
}

async function seedCases() {
  console.log('📚 Iniciando carga de casos clínicos...\n');

  const casesBasePath = path.join(__dirname, 'cases', 'TEMA1-EMBARAZO-PRENATAL');
  
  // Directorios de casos
  const directories = [
    path.join(casesBasePath, '01-control-normal'),
    path.join(casesBasePath, '02-patologia-embarazo'),
  ];

  let totalCasosCreados = 0;
  let totalPreguntasCreadas = 0;

  for (const dir of directories) {
    const dirName = path.basename(dir);
    console.log(`📂 Procesando: ${dirName}`);

    const cases = await loadCasesFromDirectory(dir);
    
    if (cases.length === 0) {
      console.log(`   ⚠️  No hay casos en este directorio\n`);
      continue;
    }

    console.log(`   📋 Encontrados ${cases.length} casos`);

    for (const caseData of cases) {
      try {
        // Crear el caso clínico
        const createdCase = await prisma.case.create({
          data: {
            id: caseData.id,
            title: caseData.titulo,
            area: caseData.area,
            modulo: caseData.modulo,
            difficulty: parseInt(caseData.dificultad),
            objetivosAprendizaje: caseData.objetivosAprendizaje,
            vignette: caseData.vignette,
            feedbackDinamico: caseData.feedbackDinamico || null,
            isPublic: true,
          },
        });

        // Crear las preguntas (pasos)
        let questionOrder = 1;
        for (const paso of caseData.pasos) {
          const isMCQ = !paso.tipo || paso.tipo !== 'short';

          if (isMCQ && paso.opciones) {
            // Pregunta de opción múltiple
            await prisma.question.create({
              data: {
                id: randomUUID(),
                caseId: createdCase.id,
                order: questionOrder,
                tipo: 'mcq',
                enunciado: paso.enunciado,
                text: paso.enunciado, // Legacy field
                options: {
                  create: paso.opciones.map((opcion, idx) => ({
                    id: randomUUID(),
                    text: opcion.texto,
                    isCorrect: opcion.esCorrecta,
                    feedback: opcion.explicacion,
                    order: idx + 1,
                  })),
                },
              },
            });
            totalPreguntasCreadas++;
          } else if (paso.tipo === 'short') {
            // Pregunta de desarrollo
            await prisma.question.create({
              data: {
                id: randomUUID(),
                caseId: createdCase.id,
                order: questionOrder,
                tipo: 'short',
                enunciado: paso.enunciado,
                text: paso.enunciado, // Legacy field
                criteriosEval: paso.criteriosEvaluacion || [],
                guia: paso.guia || '',
              },
            });
            totalPreguntasCreadas++;
          }

          questionOrder++;
        }

        totalCasosCreados++;
        console.log(`   ✅ ${caseData.id} - ${caseData.titulo}`);
        
      } catch (error: any) {
        console.error(`   ❌ Error creando caso ${caseData.id}:`, error.message);
      }
    }

    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 RESUMEN:`);
  console.log(`   ✅ Casos clínicos creados: ${totalCasosCreados}`);
  console.log(`   ✅ Preguntas creadas: ${totalPreguntasCreadas}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function main() {
  try {
    await seedCases();
    console.log('🎉 Seed de casos clínicos completado exitosamente!');
  } catch (error) {
    console.error('❌ Error durante el seed de casos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
