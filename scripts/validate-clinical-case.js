#!/usr/bin/env node

/**
 * 🔍 Script de Validación de Casos Clínicos
 * 
 * Valida la estructura y contenido de casos clínicos según
 * los estándares de KLINIK-MAT 2026
 * 
 * Uso:
 *   node scripts/validate-clinical-case.js [path-to-case.json5]
 *   node scripts/validate-clinical-case.js --all
 *   node scripts/validate-clinical-case.js --subarea OBSTETRICIA/01-embarazo-prenatal/01-control-normal
 */

const fs = require('fs');
const path = require('path');
const JSON5 = require('json5');

// ============================================================================
// 🎯 CONFIGURACIÓN
// ============================================================================

const DIFFICULTY_CONFIG = {
  1: { label: 'BAJA', mcq: 6, short: 0 },
  2: { label: 'MEDIA', mcq: 6, short: 1 },
  3: { label: 'ALTA', mcq: 7, short: 1 },
};

const REQUIRED_FIELDS = [
  'id',
  'title',
  'area',
  'modulo',
  'difficulty',
  'vignette',
  'questions',
];

const VALID_AREAS = [
  'Embarazo y Control Prenatal',
  'Parto y Atención Intraparto',
  'Puerperio y Lactancia',
  'Ginecología',
  'Salud Sexual y Anticoncepción',
  'Neonatología / Recién Nacido',
];

// ============================================================================
// 🔍 FUNCIONES DE VALIDACIÓN
// ============================================================================

class CaseValidator {
  constructor(caseData, filePath) {
    this.case = caseData;
    this.filePath = filePath;
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  validate() {
    this.validateStructure();
    this.validateMetadata();
    this.validateVignette();
    this.validateQuestions();
    this.validateShortQuestions();
    this.validateIntegrity();

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
    };
  }

  // --------------------------------------------------------------------------
  // Estructura básica
  // --------------------------------------------------------------------------

  validateStructure() {
    // Verificar campos requeridos
    for (const field of REQUIRED_FIELDS) {
      if (!(field in this.case)) {
        this.errors.push(`❌ Campo requerido faltante: ${field}`);
      }
    }

    // Verificar que questions sea array
    if (!Array.isArray(this.case.questions)) {
      this.errors.push('❌ El campo "questions" debe ser un array');
    }
  }

  // --------------------------------------------------------------------------
  // Metadatos
  // --------------------------------------------------------------------------

  validateMetadata() {
    // Validar ID
    if (this.case.id && !/^[a-z0-9-]+$/.test(this.case.id)) {
      this.warnings.push('⚠️  ID debe usar solo minúsculas, números y guiones');
    }

    // Validar dificultad
    if (![1, 2, 3].includes(this.case.difficulty)) {
      this.errors.push('❌ Dificultad debe ser 1, 2 o 3');
    }

    // Validar área
    if (!VALID_AREAS.includes(this.case.area)) {
      this.warnings.push(`⚠️  Área "${this.case.area}" no reconocida. Áreas válidas: ${VALID_AREAS.join(', ')}`);
    }

    // Validar título
    if (this.case.title) {
      if (this.case.title.length < 10) {
        this.warnings.push('⚠️  Título muy corto (< 10 caracteres)');
      }
      if (this.case.title.length > 150) {
        this.warnings.push('⚠️  Título muy largo (> 150 caracteres)');
      }
    }

    // Info sobre el caso
    this.info.push(`📊 Caso: ${this.case.title || 'Sin título'}`);
    this.info.push(`📁 Área: ${this.case.area || 'No especificada'}`);
    this.info.push(`📂 Módulo: ${this.case.modulo || 'No especificado'}`);
    this.info.push(`🎯 Dificultad: ${this.case.difficulty} (${DIFFICULTY_CONFIG[this.case.difficulty]?.label || 'Desconocida'})`);
  }

  // --------------------------------------------------------------------------
  // Viñeta clínica
  // --------------------------------------------------------------------------

  validateVignette() {
    if (!this.case.vignette) {
      this.errors.push('❌ Viñeta clínica (vignette) es requerida');
      return;
    }

    const vignette = this.case.vignette.trim();

    if (vignette.length < 100) {
      this.warnings.push('⚠️  Viñeta muy corta (< 100 caracteres). ¿Está completa?');
    }

    // Verificar elementos clave
    const hasAge = /\d+\s*(años|año)/.test(vignette);
    const hasVitalSigns = /(PA|presión arterial|FC|frecuencia cardíaca|T°|temperatura)/i.test(vignette);
    const hasLab = /(laboratorio|hemograma|glicemia|exámenes)/i.test(vignette);

    if (!hasAge) {
      this.warnings.push('⚠️  No se encontró edad del paciente en la viñeta');
    }

    if (this.case.difficulty >= 2 && !hasVitalSigns) {
      this.warnings.push('⚠️  No se encontraron signos vitales en la viñeta (recomendado para nivel medio/alto)');
    }

    this.info.push(`📝 Viñeta: ${vignette.length} caracteres`);
  }

  // --------------------------------------------------------------------------
  // Preguntas MCQ
  // --------------------------------------------------------------------------

  validateQuestions() {
    if (!Array.isArray(this.case.questions)) {
      return; // Ya reportado en validateStructure
    }

    const mcqQuestions = this.case.questions.filter(q => q.tipo === 'mcq' || !q.tipo);
    const expectedMcq = DIFFICULTY_CONFIG[this.case.difficulty]?.mcq || 0;

    // Validar número de preguntas MCQ
    if (mcqQuestions.length !== expectedMcq) {
      this.errors.push(
        `❌ Dificultad ${DIFFICULTY_CONFIG[this.case.difficulty]?.label} requiere ${expectedMcq} preguntas MCQ, tiene ${mcqQuestions.length}`
      );
    }

    this.info.push(`❓ Preguntas MCQ: ${mcqQuestions.length}/${expectedMcq}`);

    // Validar cada pregunta MCQ
    mcqQuestions.forEach((q, index) => {
      this.validateMcqQuestion(q, index + 1);
    });
  }

  validateMcqQuestion(question, number) {
    const prefix = `Pregunta MCQ #${number}`;

    // Verificar enunciado
    if (!question.enunciado && !question.text) {
      this.errors.push(`❌ ${prefix}: Falta enunciado`);
    }

    const enunciado = question.enunciado || question.text || '';
    if (enunciado.length < 10) {
      this.warnings.push(`⚠️  ${prefix}: Enunciado muy corto`);
    }

    // Verificar opciones
    const opciones = question.opciones || question.options || [];
    if (!Array.isArray(opciones)) {
      this.errors.push(`❌ ${prefix}: Opciones debe ser un array`);
      return;
    }

    if (opciones.length < 4 || opciones.length > 5) {
      this.warnings.push(`⚠️  ${prefix}: Debe tener 4-5 opciones, tiene ${opciones.length}`);
    }

    // Verificar que hay exactamente una opción correcta
    const correctas = opciones.filter(o => o.esCorrecta || o.isCorrect);
    if (correctas.length === 0) {
      this.errors.push(`❌ ${prefix}: No hay opción correcta marcada`);
    } else if (correctas.length > 1) {
      this.errors.push(`❌ ${prefix}: Hay ${correctas.length} opciones marcadas como correctas (debe ser solo 1)`);
    }

    // Verificar explicaciones
    opciones.forEach((opcion, idx) => {
      const explicacion = opcion.explicacion || opcion.explanation || opcion.feedback;
      if (!explicacion) {
        this.warnings.push(`⚠️  ${prefix}, Opción ${idx + 1}: Falta explicación`);
      } else if (explicacion.length < 20) {
        this.warnings.push(`⚠️  ${prefix}, Opción ${idx + 1}: Explicación muy corta (<20 chars)`);
      }

      // Verificar texto de opción
      const texto = opcion.texto || opcion.text || '';
      if (texto.length < 5) {
        this.warnings.push(`⚠️  ${prefix}, Opción ${idx + 1}: Texto muy corto`);
      }
    });
  }

  // --------------------------------------------------------------------------
  // Preguntas SHORT
  // --------------------------------------------------------------------------

  validateShortQuestions() {
    const shortQuestions = this.case.questions?.filter(q => q.tipo === 'short') || [];
    const expectedShort = DIFFICULTY_CONFIG[this.case.difficulty]?.short || 0;

    // Validar número de preguntas SHORT
    if (shortQuestions.length !== expectedShort) {
      if (expectedShort > 0) {
        this.errors.push(
          `❌ Dificultad ${DIFFICULTY_CONFIG[this.case.difficulty]?.label} requiere ${expectedShort} pregunta SHORT, tiene ${shortQuestions.length}`
        );
      } else if (shortQuestions.length > 0) {
        this.warnings.push(
          `⚠️  Dificultad ${DIFFICULTY_CONFIG[this.case.difficulty]?.label} no requiere preguntas SHORT, pero tiene ${shortQuestions.length}`
        );
      }
    }

    this.info.push(`💬 Preguntas SHORT: ${shortQuestions.length}/${expectedShort}`);

    // Validar cada pregunta SHORT
    shortQuestions.forEach((q, index) => {
      this.validateShortQuestion(q, index + 1);
    });
  }

  validateShortQuestion(question, number) {
    const prefix = `Pregunta SHORT #${number}`;

    // Verificar enunciado
    if (!question.enunciado) {
      this.errors.push(`❌ ${prefix}: Falta enunciado`);
    }

    // Verificar criterios de evaluación
    if (!question.criteriosEvaluacion || !Array.isArray(question.criteriosEvaluacion)) {
      this.errors.push(`❌ ${prefix}: Falta criteriosEvaluacion o no es un array`);
      return;
    }

    const criterios = question.criteriosEvaluacion;
    const minCriterios = this.case.difficulty === 2 ? 3 : 4;
    const maxCriterios = this.case.difficulty === 2 ? 4 : 6;

    if (criterios.length < minCriterios) {
      this.warnings.push(`⚠️  ${prefix}: Tiene ${criterios.length} criterios, recomendado ${minCriterios}-${maxCriterios}`);
    }

    // Verificar que al menos hay criterios esenciales
    const esenciales = criterios.filter(c => c.esencial === true);
    const minEsenciales = this.case.difficulty === 2 ? 2 : 3;

    if (esenciales.length < minEsenciales) {
      this.warnings.push(`⚠️  ${prefix}: Tiene ${esenciales.length} criterios esenciales, recomendado al menos ${minEsenciales}`);
    }

    // Verificar cada criterio
    criterios.forEach((criterio, idx) => {
      if (!criterio.criterio) {
        this.errors.push(`❌ ${prefix}, Criterio ${idx + 1}: Falta texto del criterio`);
      }
      if (typeof criterio.puntos !== 'number') {
        this.errors.push(`❌ ${prefix}, Criterio ${idx + 1}: Falta puntos o no es un número`);
      }
      if (typeof criterio.esencial !== 'boolean') {
        this.warnings.push(`⚠️  ${prefix}, Criterio ${idx + 1}: Campo 'esencial' debe ser true/false`);
      }
    });

    // Verificar respuesta modelo
    if (!question.respuestaModelo) {
      this.errors.push(`❌ ${prefix}: Falta respuestaModelo`);
    } else if (question.respuestaModelo.length < 50) {
      this.warnings.push(`⚠️  ${prefix}: Respuesta modelo muy corta (<50 caracteres)`);
    }

    // Verificar feedback docente
    if (!question.feedbackDocente) {
      this.warnings.push(`⚠️  ${prefix}: Falta feedbackDocente (recomendado)`);
    }

    this.info.push(`  └─ Criterios: ${criterios.length} (${esenciales.length} esenciales)`);
  }

  // --------------------------------------------------------------------------
  // Integridad general
  // --------------------------------------------------------------------------

  validateIntegrity() {
    // Verificar orden de preguntas
    if (this.case.questions) {
      const orders = this.case.questions.map(q => q.order).filter(o => typeof o === 'number');
      const uniqueOrders = new Set(orders);

      if (orders.length !== uniqueOrders.size) {
        this.warnings.push('⚠️  Hay números de orden duplicados en las preguntas');
      }

      // Verificar que los órdenes son consecutivos
      const sortedOrders = [...orders].sort((a, b) => a - b);
      const isConsecutive = sortedOrders.every((val, idx) => idx === 0 || val === sortedOrders[idx - 1] + 1);
      if (!isConsecutive && orders.length > 0) {
        this.warnings.push('⚠️  Los números de orden no son consecutivos');
      }
    }

    // Estadísticas finales
    const totalQuestions = this.case.questions?.length || 0;
    this.info.push(`📈 Total de preguntas: ${totalQuestions}`);
  }
}

// ============================================================================
// 🚀 EJECUCIÓN
// ============================================================================

function validateCase(filePath) {
  try {
    // Leer archivo
    const content = fs.readFileSync(filePath, 'utf8');
    const caseData = JSON5.parse(content);

    // Validar
    const validator = new CaseValidator(caseData, filePath);
    const result = validator.validate();

    // Mostrar resultados
    console.log('\n' + '='.repeat(80));
    console.log(`📄 Validando: ${path.basename(filePath)}`);
    console.log('='.repeat(80) + '\n');

    // Info
    if (result.info.length > 0) {
      result.info.forEach(info => console.log(info));
      console.log();
    }

    // Warnings
    if (result.warnings.length > 0) {
      console.log('⚠️  ADVERTENCIAS:\n');
      result.warnings.forEach(warning => console.log(`   ${warning}`));
      console.log();
    }

    // Errors
    if (result.errors.length > 0) {
      console.log('❌ ERRORES:\n');
      result.errors.forEach(error => console.log(`   ${error}`));
      console.log();
    }

    // Resumen
    console.log('─'.repeat(80));
    if (result.valid) {
      console.log('✅ VALIDACIÓN EXITOSA\n');
      return true;
    } else {
      console.log(`❌ VALIDACIÓN FALLIDA: ${result.errors.length} errores encontrados\n`);
      return false;
    }
  } catch (error) {
    console.error(`\n❌ ERROR al procesar ${filePath}:`);
    console.error(`   ${error.message}\n`);
    return false;
  }
}

function validateDirectory(dirPath) {
  console.log(`\n🔍 Validando casos en: ${dirPath}\n`);

  const files = fs.readdirSync(dirPath, { recursive: true })
    .filter(file => file.endsWith('.json5') && !file.startsWith('_'));

  if (files.length === 0) {
    console.log('⚠️  No se encontraron archivos .json5 en el directorio\n');
    return;
  }

  let passed = 0;
  let failed = 0;

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isFile()) {
      const result = validateCase(fullPath);
      if (result) {
        passed++;
      } else {
        failed++;
      }
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMEN GENERAL');
  console.log('='.repeat(80));
  console.log(`Total casos validados: ${passed + failed}`);
  console.log(`✅ Exitosos: ${passed}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log('='.repeat(80) + '\n');
}

// Punto de entrada
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🔍 Validador de Casos Clínicos KLINIK-MAT

Uso:
  node scripts/validate-clinical-case.js <archivo.json5>
  node scripts/validate-clinical-case.js --all
  node scripts/validate-clinical-case.js --subarea <path-to-subarea>

Ejemplos:
  node scripts/validate-clinical-case.js prisma/cases/OBSTETRICIA/01-embarazo-prenatal/01-control-normal/cpn-001.json5
  node scripts/validate-clinical-case.js --subarea prisma/cases/OBSTETRICIA/01-embarazo-prenatal/01-control-normal
  node scripts/validate-clinical-case.js --all
    `);
    return;
  }

  if (args[0] === '--all') {
    validateDirectory('prisma/cases');
  } else if (args[0] === '--subarea') {
    if (!args[1]) {
      console.error('❌ Error: Debe especificar la ruta de la subárea');
      return;
    }
    validateDirectory(args[1]);
  } else {
    validateCase(args[0]);
  }
}

main();
