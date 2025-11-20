#!/usr/bin/env node
/**
 * Script de validación de estructura de casos clínicos
 * 
 * ESTRUCTURA REQUERIDA:
 * - BAJA: 5 preguntas MCQ (sin Short)
 * - MEDIA: 5 MCQ + 1 Short REFLEXIVA (sin criteriosEvaluacion)
 * - ALTA: 6 MCQ + 1 Short CON CRITERIOS (con criteriosEvaluacion)
 * 
 * REQUISITOS COMUNES:
 * - Cada MCQ con 4 opciones (A-D)
 * - Cada opción con explicación
 * - Exactamente 1 opción correcta por pregunta
 * - feedbackDinamico (bajo, medio, alto)
 * - referencias bibliográficas
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import JSON5 from 'json5';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CASES_FILE = join(__dirname, '../prisma/cases.json5');

// Configuración de requisitos según dificultad
const REQUIREMENTS = {
  'Baja': { 
    mcq: 5, 
    short: 0, 
    shortType: null 
  },
  'Media': { 
    mcq: 5, 
    short: 1, 
    shortType: 'reflexiva' // SIN criteriosEvaluacion
  },
  'Alta': { 
    mcq: 6, 
    short: 1, 
    shortType: 'criterios' // CON criteriosEvaluacion
  }
};

function validateCases() {
  console.log('🔍 Validando estructura de casos clínicos...\n');
  
  const rawData = readFileSync(CASES_FILE, 'utf-8');
  const cases = JSON5.parse(rawData);
  
  const issues = [];
  const stats = {
    total: cases.length,
    valid: 0,
    invalid: 0,
    byDifficulty: { 'Baja': 0, 'Media': 0, 'Alta': 0 }
  };

  cases.forEach((caso, index) => {
    const caseIssues = [];
    const expected = REQUIREMENTS[caso.dificultad];
    
    if (!expected) {
      caseIssues.push(`❌ Dificultad inválida: "${caso.dificultad}" (debe ser: Baja, Media o Alta)`);
      stats.invalid++;
      issues.push({
        index: index + 1,
        id: caso.id,
        titulo: caso.titulo,
        dificultad: caso.dificultad,
        issues: caseIssues
      });
      return;
    }

    // Contar pasos por tipo
    const mcqSteps = caso.pasos?.filter(p => p.tipo === 'mcq') || [];
    const shortSteps = caso.pasos?.filter(p => p.tipo === 'short') || [];

    // 1. Validar cantidad de MCQ
    if (mcqSteps.length !== expected.mcq) {
      caseIssues.push(
        `📊 MCQ: ${mcqSteps.length}/${expected.mcq} (${expected.mcq - mcqSteps.length > 0 ? 'faltan' : 'sobran'} ${Math.abs(expected.mcq - mcqSteps.length)})`
      );
    }

    // 2. Validar cantidad de Short
    if (shortSteps.length !== expected.short) {
      caseIssues.push(
        `✍️  Short: ${shortSteps.length}/${expected.short} (${expected.short - shortSteps.length > 0 ? 'falta' : 'sobra'} ${Math.abs(expected.short - shortSteps.length)})`
      );
    }

    // 3. Validar cada MCQ
    mcqSteps.forEach((step, stepIndex) => {
      const opciones = step.opciones || [];
      
      // 3.1 Validar cantidad de opciones
      if (opciones.length !== 4) {
        caseIssues.push(
          `   ⚠️  MCQ ${stepIndex + 1}: tiene ${opciones.length} opciones (debe tener 4: A-D)`
        );
      }

      // 3.2 Validar que cada opción tenga explicación
      opciones.forEach((opcion, opIndex) => {
        if (!opcion.explicacion || opcion.explicacion.trim() === '') {
          caseIssues.push(
            `   📝 MCQ ${stepIndex + 1}, Opción ${String.fromCharCode(97 + opIndex).toUpperCase()}: falta explicación/justificación`
          );
        }
      });

      // 3.3 Validar que haya exactamente una respuesta correcta
      const correctas = opciones.filter(o => o.esCorrecta === true);
      if (correctas.length !== 1) {
        caseIssues.push(
          `   ✓  MCQ ${stepIndex + 1}: ${correctas.length} respuestas marcadas como correctas (debe ser exactamente 1)`
        );
      }
    });

    // 4. Validar Short según dificultad
    if (shortSteps.length > 0) {
      shortSteps.forEach((step, stepIndex) => {
        // 4.1 Validar que tenga guía
        if (!step.guia || step.guia.trim() === '') {
          caseIssues.push(`   📖 Short ${stepIndex + 1}: falta campo 'guia' (obligatorio)`);
        }

        // 4.2 Validar según tipo esperado
        if (expected.shortType === 'reflexiva') {
          // MEDIA: NO debe tener criteriosEvaluacion
          if (step.criteriosEvaluacion && step.criteriosEvaluacion.length > 0) {
            caseIssues.push(
              `   💭 Short ${stepIndex + 1}: caso MEDIA debe ser reflexiva (SIN criteriosEvaluacion)`
            );
          }
        } else if (expected.shortType === 'criterios') {
          // ALTA: DEBE tener criteriosEvaluacion
          if (!step.criteriosEvaluacion || step.criteriosEvaluacion.length === 0) {
            caseIssues.push(
              `   🎯 Short ${stepIndex + 1}: caso ALTA debe tener criteriosEvaluacion (evaluación automática)`
            );
          }
        }
      });
    }

    // 5. Validar feedback adaptativo
    if (!caso.feedbackDinamico) {
      caseIssues.push(`💬 Falta feedbackDinamico (bajo, medio, alto)`);
    } else {
      const fb = caso.feedbackDinamico;
      const missing = [];
      if (!fb.bajo) missing.push('bajo');
      if (!fb.medio) missing.push('medio');
      if (!fb.alto) missing.push('alto');
      
      if (missing.length > 0) {
        caseIssues.push(`💬 feedbackDinamico incompleto (falta: ${missing.join(', ')})`);
      }
    }

    // 6. Validar fuentes bibliográficas
    if (!caso.referencias || caso.referencias.length === 0) {
      caseIssues.push(`📚 Faltan referencias bibliográficas`);
    }

    // Estadísticas
    stats.byDifficulty[caso.dificultad] = (stats.byDifficulty[caso.dificultad] || 0) + 1;
    
    if (caseIssues.length === 0) {
      stats.valid++;
    } else {
      stats.invalid++;
      issues.push({
        index: index + 1,
        id: caso.id,
        titulo: caso.titulo,
        dificultad: caso.dificultad,
        issues: caseIssues
      });
    }
  });

  // Reporte
  console.log('📈 ESTADÍSTICAS GENERALES');
  console.log('═'.repeat(60));
  console.log(`Total de casos: ${stats.total}`);
  console.log(`✅ Casos válidos: ${stats.valid}`);
  console.log(`❌ Casos con problemas: ${stats.invalid}`);
  console.log(`\nPor dificultad:`);
  console.log(`  🟢 Baja (5 MCQ): ${stats.byDifficulty['Baja'] || 0}`);
  console.log(`  🟡 Media (5 MCQ + 1 Short reflexiva): ${stats.byDifficulty['Media'] || 0}`);
  console.log(`  🔴 Alta (6 MCQ + 1 Short con criterios): ${stats.byDifficulty['Alta'] || 0}`);
  console.log('═'.repeat(60));
  console.log();

  if (issues.length > 0) {
    console.log('⚠️  CASOS CON PROBLEMAS:\n');
    issues.forEach(issue => {
      console.log(`${issue.index}. [${issue.dificultad}] ${issue.titulo}`);
      console.log(`   ID: ${issue.id}`);
      issue.issues.forEach(i => console.log(`   ${i}`));
      console.log();
    });
  } else {
    console.log('🎉 ¡Todos los casos cumplen con la estructura requerida!');
  }

  return issues.length === 0;
}

// Ejecutar validación
const isValid = validateCases();
process.exit(isValid ? 0 : 1);
