const fs = require('fs');
const JSON5 = require('json5');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 VALIDACIÓN: 02-patologia-embarazo/cases.json5');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const filePath = './prisma/cases/TEMA1-EMBARAZO-PRENATAL/02-patologia-embarazo/cases.json5';

// ============================================================================
// 1️⃣ VALIDACIÓN DE SINTAXIS JSON5
// ============================================================================
console.log('🔍 [1/7] Validando sintaxis JSON5...');
let cases;
try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remover comentarios de línea inicial antes del array y líneas vacías
  const lines = content.split('\n');
  let arrayStartIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === '[') {
      arrayStartIndex = i;
      break;
    }
  }
  
  if (arrayStartIndex >= 0) {
    // Mantener solo desde donde inicia el array
    content = lines.slice(arrayStartIndex).join('\n');
  }
  
  // Verificar que no esté vacío
  if (!content.trim()) {
    throw new Error('Archivo vacío o sin contenido válido');
  }
  
  cases = JSON5.parse(content);
  
  if (!Array.isArray(cases)) {
    throw new Error('El contenido no es un array de casos');
  }
  
  if (cases.length === 0) {
    throw new Error('Array de casos vacío');
  }
  
  console.log('✅ Sintaxis JSON5 válida\n');
} catch (error) {
  console.error('❌ ERROR DE SINTAXIS:');
  console.error(`   Línea: ${error.lineNumber || 'desconocida'}`);
  console.error(`   Columna: ${error.columnNumber || 'desconocida'}`);
  console.error(`   Mensaje: ${error.message}`);
  
  // Mostrar contexto del error
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  if (error.lineNumber && error.lineNumber <= lines.length) {
    console.error('\n   Contexto:');
    const start = Math.max(0, error.lineNumber - 3);
    const end = Math.min(lines.length, error.lineNumber + 2);
    for (let i = start; i < end; i++) {
      const marker = i === error.lineNumber - 1 ? '>>>' : '   ';
      console.error(`   ${marker} ${i + 1}: ${lines[i]}`);
    }
  }
  
  process.exit(1);
}

// ============================================================================
// 2️⃣ VALIDACIÓN DE IDs
// ============================================================================
console.log('🆔 [2/7] Validando IDs de casos...');
const ids = new Set();
const duplicates = [];
const wrongFormat = [];
const expectedPrefix = 'tema1-02-'; // Patrón: tema1-02-xxxx-nX

cases.forEach((caso, index) => {
  const id = caso.id;
  
  // Verificar duplicados
  if (ids.has(id)) {
    duplicates.push(id);
  } else {
    ids.add(id);
  }
  
  // Verificar formato (tema1-02-descripcion-n1/n2/n3)
  if (!id.startsWith(expectedPrefix)) {
    wrongFormat.push({ id, expected: `${expectedPrefix}...`, position: index + 1 });
  }
  
  // Verificar sufijo de nivel
  const match = id.match(/-(n[123])$/);
  if (!match) {
    wrongFormat.push({ id, reason: 'Falta sufijo de nivel (-n1, -n2, -n3)', position: index + 1 });
  } else {
    const nivel = match[1];
    const dificultad = caso.dificultad;
    const expectedDificultad = nivel.replace('n', '');
    if (dificultad !== expectedDificultad) {
      wrongFormat.push({ 
        id, 
        reason: `Nivel inconsistente: ID tiene ${nivel} pero dificultad="${dificultad}"`,
        position: index + 1 
      });
    }
  }
});

if (duplicates.length > 0) {
  console.error('❌ IDs DUPLICADOS:');
  duplicates.forEach(id => console.error(`   - ${id}`));
} else if (wrongFormat.length > 0) {
  console.error('⚠️  FORMATO DE IDs INCORRECTO:');
  wrongFormat.forEach(({ id, reason, expected, position }) => {
    console.error(`   - Caso #${position}: ${id}`);
    console.error(`     Problema: ${reason || `Debe comenzar con "${expected}"`}`);
  });
} else {
  console.log(`✅ ${cases.length} IDs únicos y con formato correcto\n`);
}

// ============================================================================
// 3️⃣ VALIDACIÓN DE CAMPOS OBLIGATORIOS
// ============================================================================
console.log('📝 [3/7] Validando campos obligatorios...');
const missingFields = [];
const requiredFields = [
  'id', 'titulo', 'area', 'modulo', 'dificultad',
  'objetivosAprendizaje', 'vignette', 'pasos',
  'feedbackDinamico', 'referencias'
];

cases.forEach((caso, index) => {
  const missing = [];
  requiredFields.forEach(field => {
    if (!caso[field]) {
      missing.push(field);
    }
  });
  
  if (missing.length > 0) {
    missingFields.push({ 
      id: caso.id || `Caso #${index + 1}`, 
      fields: missing 
    });
  }
});

if (missingFields.length > 0) {
  console.error('❌ CAMPOS FALTANTES:');
  missingFields.forEach(({ id, fields }) => {
    console.error(`   - ${id}:`);
    fields.forEach(f => console.error(`     * ${f}`));
  });
} else {
  console.log('✅ Todos los casos tienen campos obligatorios\n');
}

// ============================================================================
// 4️⃣ VALIDACIÓN DE ESTRUCTURA PASOS (MCQ + SHORT)
// ============================================================================
console.log('❓ [4/7] Validando estructura de preguntas...');
const pasosErrors = [];

cases.forEach((caso, index) => {
  if (!Array.isArray(caso.pasos)) {
    pasosErrors.push({ id: caso.id, error: 'pasos no es un array' });
    return;
  }
  
  const mcqCount = caso.pasos.filter(p => !p.tipo || p.tipo !== 'short').length;
  const shortCount = caso.pasos.filter(p => p.tipo === 'short').length;
  const totalCount = caso.pasos.length;
  
  // Validar que cada MCQ tenga 4 opciones y exactamente 1 correcta
  caso.pasos.forEach((paso, pIndex) => {
    if (paso.tipo !== 'short') {
      if (!paso.opciones || !Array.isArray(paso.opciones)) {
        pasosErrors.push({ 
          id: caso.id, 
          error: `Pregunta MCQ #${pIndex + 1} sin opciones o formato incorrecto` 
        });
      } else {
        if (paso.opciones.length !== 4) {
          pasosErrors.push({ 
            id: caso.id, 
            error: `Pregunta #${pIndex + 1} tiene ${paso.opciones.length} opciones (debe ser 4)` 
          });
        }
        
        const correctas = paso.opciones.filter(o => o.esCorrecta).length;
        if (correctas !== 1) {
          pasosErrors.push({ 
            id: caso.id, 
            error: `Pregunta #${pIndex + 1} tiene ${correctas} opciones correctas (debe ser 1)` 
          });
        }
      }
    } else {
      // Validar pregunta SHORT
      if (!paso.criteriosEvaluacion || !Array.isArray(paso.criteriosEvaluacion)) {
        pasosErrors.push({ 
          id: caso.id, 
          error: 'Pregunta SHORT sin criteriosEvaluacion' 
        });
      }
      if (!paso.guia || paso.guia.length < 50) {
        pasosErrors.push({ 
          id: caso.id, 
          error: 'Pregunta SHORT sin guía de respuesta adecuada' 
        });
      }
    }
  });
  
  // Validar cantidad de preguntas según nivel
  const nivel = parseInt(caso.dificultad);
  let expectedTotal = 6;
  let expectedShort = 0;
  
  if (nivel === 2) {
    expectedTotal = 7; // 6 MCQ + 1 SHORT
    expectedShort = 1;
  } else if (nivel === 3) {
    expectedTotal = 7; // 6 MCQ + 1 SHORT (o 7 MCQ + 1 SHORT = 8)
    expectedShort = 1;
  }
  
  if (nivel >= 2 && shortCount === 0) {
    pasosErrors.push({ 
      id: caso.id, 
      error: `Nivel ${nivel} debe tener al menos 1 pregunta SHORT` 
    });
  }
  
  if (totalCount < expectedTotal - 1) { // Tolerancia de -1
    pasosErrors.push({ 
      id: caso.id, 
      error: `Tiene ${totalCount} preguntas (esperadas: ~${expectedTotal})` 
    });
  }
});

if (pasosErrors.length > 0) {
  console.error('❌ ERRORES EN PREGUNTAS:');
  pasosErrors.forEach(({ id, error }) => {
    console.error(`   - ${id}: ${error}`);
  });
} else {
  console.log('✅ Todas las preguntas tienen estructura correcta\n');
}

// ============================================================================
// 5️⃣ VALIDACIÓN DE CONTENIDO (Longitudes, Palabras clave)
// ============================================================================
console.log('📏 [5/7] Validando longitud de contenido...');
const contentWarnings = [];

cases.forEach(caso => {
  const vignetteWords = caso.vignette.split(/\s+/).length;
  if (vignetteWords < 100) {
    contentWarnings.push({ 
      id: caso.id, 
      warning: `Viñeta muy corta (${vignetteWords} palabras, mínimo 100)` 
    });
  }
  
  if (caso.objetivosAprendizaje.length < 2) {
    contentWarnings.push({ 
      id: caso.id, 
      warning: 'Menos de 2 objetivos de aprendizaje' 
    });
  }
  
  if (caso.referencias.length === 0) {
    contentWarnings.push({ 
      id: caso.id, 
      warning: 'Sin referencias bibliográficas' 
    });
  }
});

if (contentWarnings.length > 0) {
  console.warn('⚠️  ADVERTENCIAS DE CONTENIDO:');
  contentWarnings.forEach(({ id, warning }) => {
    console.warn(`   - ${id}: ${warning}`);
  });
} else {
  console.log('✅ Contenido tiene longitudes adecuadas\n');
}

// ============================================================================
// 6️⃣ REPORTE DE TEMAS CUBIERTOS
// ============================================================================
console.log('🏥 [6/7] Temas clínicos identificados...');
const topics = {};

cases.forEach(caso => {
  const match = caso.id.match(/tema1-02-([^-]+)/);
  if (match) {
    const topic = match[1];
    if (!topics[topic]) {
      topics[topic] = { count: 0, niveles: {} };
    }
    topics[topic].count++;
    const nivel = caso.dificultad;
    topics[topic].niveles[`N${nivel}`] = (topics[topic].niveles[`N${nivel}`] || 0) + 1;
  }
});

Object.entries(topics).sort((a, b) => b[1].count - a[1].count).forEach(([topic, data]) => {
  const distribution = Object.entries(data.niveles)
    .map(([nivel, count]) => `${nivel}:${count}`)
    .join(', ');
  console.log(`   ${topic.padEnd(25)} ${data.count} casos (${distribution})`);
});
console.log('');

// ============================================================================
// 7️⃣ RESUMEN FINAL
// ============================================================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 RESUMEN FINAL');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const totalCasos = cases.length;
const nivel1 = cases.filter(c => c.dificultad === '1').length;
const nivel2 = cases.filter(c => c.dificultad === '2').length;
const nivel3 = cases.filter(c => c.dificultad === '3').length;

const totalPreguntas = cases.reduce((sum, c) => sum + c.pasos.length, 0);
const totalMCQ = cases.reduce((sum, c) => 
  sum + c.pasos.filter(p => p.tipo !== 'short').length, 0);
const totalSHORT = cases.reduce((sum, c) => 
  sum + c.pasos.filter(p => p.tipo === 'short').length, 0);

console.log(`📦 Total de Casos: ${totalCasos}`);
console.log(`   ├─ Nivel 1 (Básico):  ${nivel1} casos`);
console.log(`   ├─ Nivel 2 (Medio):   ${nivel2} casos`);
console.log(`   └─ Nivel 3 (Avanzado): ${nivel3} casos\n`);

console.log(`❓ Total de Preguntas: ${totalPreguntas}`);
console.log(`   ├─ MCQ (Opción Múltiple): ${totalMCQ}`);
console.log(`   └─ SHORT (Desarrollo):    ${totalSHORT}\n`);

const hasErrors = duplicates.length > 0 || 
                  wrongFormat.length > 0 || 
                  missingFields.length > 0 || 
                  pasosErrors.length > 0;

if (hasErrors) {
  console.log('❌ VALIDACIÓN FALLIDA - Corrija los errores antes de hacer seed\n');
  process.exit(1);
} else if (contentWarnings.length > 0) {
  console.log('⚠️  VALIDACIÓN EXITOSA CON ADVERTENCIAS - Puede hacer seed pero revise los warnings\n');
} else {
  console.log('✅ VALIDACIÓN 100% EXITOSA - Listo para seed\n');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
