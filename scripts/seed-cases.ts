// @ts-nocheck
/**
 * scripts/seed-cases.ts
 * Lee `prisma/cases.json5` y carga los casos en la base de datos usando Prisma.
 * Este script hace upsert por `id` de cada caso: si existe, reemplaza preguntas y opciones.
 */

const fs = require('fs');
const path = require('path');
const JSON5 = require('json5');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Cargar `.env.local` si existe (dot env config predeterminado no carga .env.local)
try {
  const localEnvPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
  }
} catch (e) {
  // no fatal
}

// Si no está `DATABASE_URL`, permitir fallback a `DATABASE_URL_DEV` (útil para entornos dev)
if (!process.env.DATABASE_URL && process.env.DATABASE_URL_DEV) {
  console.warn('WARNING: `DATABASE_URL` no está definido; usando `DATABASE_URL_DEV` como fallback.');
  process.env.DATABASE_URL = process.env.DATABASE_URL_DEV;
}

// Seguridad: prevenir que el seed se ejecute contra la DB central sin confirmación explícita.
// Si DATABASE_URL está definido y es distinto a DATABASE_URL_DEV, requerimos CONFIRM_SEED_TO_PROD=1
if (process.env.DATABASE_URL && process.env.DATABASE_URL_DEV && process.env.DATABASE_URL !== process.env.DATABASE_URL_DEV) {
  if (process.env.CONFIRM_SEED_TO_PROD !== '1') {
    console.error('SECURITY: Estás a punto de ejecutar el seed contra `DATABASE_URL` (posible producción).');
    console.error('Si realmente querés ejecutar el seed en esa BD, reintentalo estableciendo la variable de entorno:');
    console.error('  CONFIRM_SEED_TO_PROD=1 npx dotenv -e .env.local -- npm run seed:cases');
    process.exit(1);
  }
}

if (!process.env.DATABASE_URL) {
  console.error('ERROR: la variable de entorno `DATABASE_URL` no está definida. Define `DATABASE_URL` o `DATABASE_URL_DEV` en .env.local o en el entorno.');
  process.exit(1);
}

const prisma = new PrismaClient();

function mapDifficulty(d) {
  if (!d) return 2;
  const s = String(d).toLowerCase().trim();
  // Common textual forms
  if (s === 'alta' || s === 'dificil' || s === 'difícil' || s === '3') return 3;
  if (s === 'media' || s === 'medio' || s === '2') return 2;
  if (s === 'baja' || s === 'facil' || s === 'fácil' || s === '1') return 1;
  // Contain checks (in case of longer strings)
  if (s.includes('alta')) return 3;
  if (s.includes('media')) return 2;
  if (s.includes('baja')) return 1;
  // fallback numeric
  const n = parseInt(d, 10);
  return Number.isFinite(n) ? n : 2;
}

async function upsertCase(caseObj) {
  const caseId = caseObj.id || undefined;
  const title = caseObj.titulo || caseObj.title || 'Sin título';
  const modulo = caseObj.modulo || caseObj.area || 'General';
  const area = caseObj.area || caseObj.modulo || 'General';
  const difficulty = mapDifficulty(caseObj.dificultad || caseObj.difficulty);
  
  // dificultad como string para compatibilidad con schema
  const dificultadText = caseObj.dificultad ? String(caseObj.dificultad) : null;
  
  // Procesar vignette: puede ser string u objeto
  let vignette = '';
  if (typeof caseObj.vignette === 'string') {
    vignette = caseObj.vignette;
  } else if (typeof caseObj.vignette === 'object' && caseObj.vignette !== null) {
    // Convertir objeto vignette a string formateado
    const v = caseObj.vignette;
    vignette = `**Paciente:** ${v.paciente || ''}\n\n` +
               `**Motivo de Consulta:** ${v.motivoConsulta || ''}\n\n` +
               `**Anamnesis:** ${v.anamnesis || ''}\n\n` +
               `**Examen Físico:** ${v.examenFisico || ''}\n\n` +
               `**Exámenes:** ${Array.isArray(v.examenes) ? v.examenes.join(', ') : ''}\n\n` +
               `**Contexto:** ${v.contexto || ''}`;
  } else {
    vignette = caseObj.vigneta || '';
  }
  
  const summary = caseObj.resumen || caseObj.summary || '';

  // Prepare questions data - adaptado para soportar 'questions' o 'pasos'
  const pasos = Array.isArray(caseObj.questions) ? caseObj.questions : 
                Array.isArray(caseObj.pasos) ? caseObj.pasos : [];
  const questionsCreate = pasos.map((p, idx) => {
    const qText = p.enunciado || p.text || `Paso ${idx + 1}`;
    const qOrder = idx + 1;
    const qId = p.id || `${caseId}-q${qOrder}`; // Generar ID si no existe
    const options = Array.isArray(p.opciones) ? p.opciones.map((opt, optIdx) => {
      const text = opt.texto || opt.text || '';
      const feedback = opt.explicacion || opt.feedback || '';
      const isCorrect = Boolean(opt.esCorrecta ?? opt.correcta ?? opt.isCorrect ?? false);
      const id = opt.id || `${qId}-opt${optIdx + 1}`; // Generar ID si no existe
      return { id, text, feedback, isCorrect, order: optIdx + 1 };
    }) : [];

    // For non-MCQ (short/other), options may be empty.
    const optionCreate = options.length > 0 ? { create: options } : undefined;

    // question-level guidance / feedback present in source as 'guia' or 'feedbackDocente'
    const guia = p.guia || p.guiaTexto || p.guiaDocente || undefined;
    const feedbackDocente = p.feedbackDocente || p.feedback || p.feedback_docente || undefined;

    return {
      id: qId,
      order: qOrder,
      text: qText,
      enunciado: qText,
      guia,
      feedbackDocente,
      ...(optionCreate ? { options: optionCreate } : {}),
    };
  });

  // Check existing
  const existing = await prisma.case.findUnique({ where: { id: caseId }, include: { questions: { include: { options: true } } } });

  // Prepare norms (referencias) if present
  const referencias = Array.isArray(caseObj.referencias) ? caseObj.referencias : caseObj.referencias || caseObj.reference || [];
  const normConnect = [];
  for (const ref of referencias) {
    try {
      const name = String(ref).trim();
      if (!name) continue;
      // simple slug for code
      const code = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || undefined;
      // upsert norm by code
      if (!code) continue;
      const norm = await prisma.minsalNorm.upsert({
        where: { code },
        create: { id: code, name, code },
        update: { name },
      });
      normConnect.push({ id: norm.id });
    } catch (e) {
      // ignore norm creation errors but log
      console.warn('No se pudo crear norma para referencia:', ref, e);
    }
  }

  // Extract feedbackDinamico from case object
  const feedbackDinamico = caseObj.feedbackDinamico || caseObj.feedback_dinamico || undefined;
  
  // Extract objetivosAprendizaje
  const objetivosAprendizaje = Array.isArray(caseObj.objetivosAprendizaje) 
    ? caseObj.objetivosAprendizaje 
    : [];

  if (existing) {
    console.log(`🔁 Actualizando caso existente: ${caseId} — ${title}`);
    // delete options and questions for the case
    const questionIds = existing.questions.map((q) => q.id);
    if (questionIds.length > 0) {
      await prisma.option.deleteMany({ where: { questionId: { in: questionIds } } });
      await prisma.question.deleteMany({ where: { id: { in: questionIds } } });
    }

    // update case fields
    await prisma.case.update({
      where: { id: caseId },
      data: {
        title,
        area,
        modulo,
        difficulty,
        dificultad: dificultadText,
        summary,
        vignette,
        objetivosAprendizaje,
        feedbackDinamico: feedbackDinamico || null,
        isPublic: true,
        questions: { create: questionsCreate },
        norms: normConnect.length > 0 ? { set: [], connect: normConnect } : undefined,
      },
    });
  } else {
    console.log(`➕ Creando caso: ${caseId} — ${title}`);
    await prisma.case.create({
      data: {
        id: caseId,
        title,
        area,
        modulo,
        difficulty,
        dificultad: dificultadText,
        summary,
        vignette,
        objetivosAprendizaje,
        feedbackDinamico: feedbackDinamico || null,
        isPublic: true,
        questions: { create: questionsCreate },
        norms: normConnect.length > 0 ? { connect: normConnect } : undefined,
      },
    });
  }
}

async function main() {
  let allCases = [];
  let loadedFromNewStructure = false;
  
  // 1. PRIORIDAD: Cargar casos desde prisma/cases/TEMA*/**/*.json (nueva estructura 2026)
  const casesDir = path.resolve(__dirname, '..', 'prisma', 'cases');
  if (fs.existsSync(casesDir)) {
    // Buscar todas las carpetas que empiezan con TEMA
    const allItems = fs.readdirSync(casesDir);
    const temaFolders = allItems.filter(item => {
      const fullPath = path.join(casesDir, item);
      return fs.statSync(fullPath).isDirectory() && item.startsWith('TEMA');
    });
    
    for (const temaFolder of temaFolders) {
      const temaDir = path.join(casesDir, temaFolder);
      console.log(`\n📁 Tema: ${temaFolder}`);
      
      // Buscar subcarpetas dentro de cada TEMA (ej: 01-control-normal)
      const subfolders = fs.readdirSync(temaDir).filter(item => {
        const fullPath = path.join(temaDir, item);
        return fs.statSync(fullPath).isDirectory();
      });
      
      for (const subfolder of subfolders) {
        const subfolderPath = path.join(temaDir, subfolder);
        console.log(`   📚 Submódulo: ${subfolder}`);
        
        // Buscar archivos .json o .json5 en la subcarpeta
        const files = fs.readdirSync(subfolderPath).filter(f => 
          f.endsWith('.json') || f.endsWith('.json5')
        );
        
        for (const file of files) {
          const filePath = path.join(subfolderPath, file);
          const raw = fs.readFileSync(filePath, 'utf8');
          let cases = file.endsWith('.json5') ? JSON5.parse(raw) : JSON.parse(raw);
          
          // Si es un objeto único, convertirlo a array
          if (!Array.isArray(cases)) {
            cases = [cases];
          }
          
          allCases = allCases.concat(cases);
          console.log(`      ✓ ${cases.length} casos cargados desde ${file}`);
          loadedFromNewStructure = true;
        }
      }
    }
    
    // 2. FALLBACK: Cargar desde prisma/cases.json5 solo si NO se cargó nada de la nueva estructura
    if (!loadedFromNewStructure) {
      const mainFilePath = path.resolve(__dirname, '..', 'prisma', 'cases.json5');
      if (fs.existsSync(mainFilePath)) {
        console.log('⚠️  No se encontraron casos en la nueva estructura.');
        console.log('📄 Cargando casos desde prisma/cases.json5 (archivo legacy)...\n');
        const raw = fs.readFileSync(mainFilePath, 'utf8');
        const arr = JSON5.parse(raw);
        if (Array.isArray(arr)) {
          allCases = allCases.concat(arr);
          console.log(`   ✓ ${arr.length} casos cargados desde archivo principal`);
          console.log('   💡 RECOMENDACIÓN: Ejecuta "node scripts/reorganizar-casos.mjs" para usar la nueva estructura\n');
        }
      }
    }
    
    // 3. Mantener compatibilidad con archivos sueltos en prisma/cases/*.json5 (DEPRECADO)
    const looseCasesFiles = fs.readdirSync(casesDir).filter(f => f.endsWith('.json5'));
    if (looseCasesFiles.length > 0) {
      console.log(`\n📄 Archivos sueltos (legacy):`);
      for (const file of looseCasesFiles) {
        const moduleName = path.basename(file, '.json5');
        console.log(`   📚 ${moduleName.toUpperCase()}`);
        
        const filePath = path.join(casesDir, file);
        const raw = fs.readFileSync(filePath, 'utf8');
        const cases = JSON5.parse(raw);
        
        if (!Array.isArray(cases)) {
          console.warn(`      ⚠️  ${file} no contiene un array, saltando...`);
          continue;
        }
        
        allCases = allCases.concat(cases);
        console.log(`      ✓ ${cases.length} casos cargados desde ${file}`);
      }
    }
  }

  if (allCases.length === 0) {
    console.error('❌ No se encontraron casos para importar.');
    process.exit(1);
  }

  console.log(`\n📊 Total de casos a procesar: ${allCases.length}\n`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const c of allCases) {
    try {
      const before = await prisma.case.findUnique({ where: { id: c.id || undefined } });
      await upsertCase(c);
      const after = await prisma.case.findUnique({ where: { id: c.id || undefined } });
      if (before && after) updated++;
      else if (!before && after) created++;
    } catch (err) {
      errors++;
      console.error(`❌ Error procesando caso ${c.id ?? c.titulo}:`, err);
    }
  }

  console.log(`\n✅ Importación finalizada.`);
  console.log(`   Creados: ${created}`);
  console.log(`   Actualizados: ${updated}`);
  console.log(`   Errores: ${errors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
