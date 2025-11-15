// @ts-nocheck
/**
 * scripts/seed-cases.ts
 * Lee `prisma/cases.json5` y carga los casos en la base de datos usando Prisma.
 * Este script hace upsert por `id` de cada caso: si existe, reemplaza preguntas y opciones.
 */

const fs = require('fs');
const path = require('path');
const JSON5 = require('json5');
const { PrismaClient } = require('@prisma/client');

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
  const area = caseObj.modulo || caseObj.modulo || caseObj.area || 'General';
  const difficulty = mapDifficulty(caseObj.dificultad || caseObj.difficulty);
  const vignette = caseObj.vigneta || caseObj.vignette || '';
  const summary = caseObj.resumen || caseObj.summary || '';

  // Prepare questions data
  const pasos = Array.isArray(caseObj.pasos) ? caseObj.pasos : [];
  const questionsCreate = pasos.map((p, idx) => {
    const qText = p.enunciado || p.text || `Paso ${idx + 1}`;
    const qOrder = idx + 1;
    const options = Array.isArray(p.opciones) ? p.opciones.map((opt) => {
      const text = opt.texto || opt.text || opt.texto || '';
      const feedback = opt.explicacion || opt.feedback || '';
      const isCorrect = Boolean(opt.esCorrecta ?? opt.isCorrect ?? false);
      return { text, feedback, isCorrect };
    }) : [];

    // For non-MCQ (short/other), options may be empty.
    const optionCreate = options.length > 0 ? { create: options } : undefined;

    // question-level guidance / feedback present in source as 'guia' or 'feedbackDocente'
    const guia = p.guia || p.guiaTexto || p.guiaDocente || undefined;
    const feedbackDocente = p.feedbackDocente || p.feedback || p.feedback_docente || undefined;

    return {
      order: qOrder,
      text: qText,
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
        create: { name, code },
        update: { name },
      });
      normConnect.push({ id: norm.id });
    } catch (e) {
      // ignore norm creation errors but log
      console.warn('No se pudo crear norma para referencia:', ref, e);
    }
  }

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
        difficulty,
        summary,
        vignette,
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
        difficulty,
        summary,
        vignette,
        isPublic: true,
        questions: { create: questionsCreate },
        norms: normConnect.length > 0 ? { connect: normConnect } : undefined,
      },
    });
  }
}

async function main() {
  const filePath = path.resolve(__dirname, '..', 'prisma', 'cases.json5');
  if (!fs.existsSync(filePath)) {
    console.error('No se encontró prisma/cases.json5');
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const arr = JSON5.parse(raw);
  if (!Array.isArray(arr)) {
    console.error('El archivo no contiene un array de casos.');
    process.exit(1);
  }

  console.log(`📥 Cargando ${arr.length} casos desde prisma/cases.json5`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const c of arr) {
    try {
      const before = await prisma.case.findUnique({ where: { id: c.id || undefined } });
      await upsertCase(c);
      const after = await prisma.case.findUnique({ where: { id: c.id || undefined } });
      if (before && after) updated++;
      else if (!before && after) created++;
    } catch (err) {
      errors++;
      console.error(`Error procesando caso ${c.id ?? c.titulo}:`, err);
    }
  }

  console.log(`✅ Importación finalizada. Creado: ${created}, Actualizado: ${updated}, Errores: ${errors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
