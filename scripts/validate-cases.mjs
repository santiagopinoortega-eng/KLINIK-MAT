import fs from 'fs';
import path from 'path';
import JSON5 from 'json5';

const file = path.resolve(process.cwd(), 'prisma', 'cases.json5');

function error(msg) {
  console.error('ERROR:', msg);
}

function warn(msg) {
  console.warn('WARN:', msg);
}

function ok(msg) {
  console.log('OK:', msg);
}

let raw;
try {
  raw = fs.readFileSync(file, 'utf8');
} catch (e) {
  error(`No se pudo leer ${file}: ${e.message}`);
  process.exit(2);
}

let arr;
try {
  arr = JSON5.parse(raw);
} catch (e) {
  error(`JSON5 parse error: ${e.message}`);
  process.exit(3);
}

if (!Array.isArray(arr)) {
  error('El archivo no contiene un array en la raíz.');
  process.exit(4);
}

let hadError = false;
let ids = new Set();
let slugs = new Set();

const allowedPasosTipos = new Set(['pregunta', 'texto', 'imagen', 'clinico']);

console.log(`Parsed ${arr.length} casos.`);

arr.forEach((c, idx) => {
  const ctx = `caso[${idx}] (id=${c.id ?? 'MISSING'})`;
  if (!c.id) {
    error(`${ctx}: falta campo "id".`);
    hadError = true;
  } else {
    if (ids.has(c.id)) {
      error(`${ctx}: id duplicado '${c.id}'.`);
      hadError = true;
    }
    ids.add(c.id);
  }

  if (!c.titulo && !c.title) {
    error(`${ctx}: falta campo "titulo" o "title".`);
    hadError = true;
  }

  if (c.slug) {
    if (slugs.has(c.slug)) {
      error(`${ctx}: slug duplicado '${c.slug}'.`);
      hadError = true;
    }
    slugs.add(c.slug);
  }

  if (!Array.isArray(c.pasos) || c.pasos.length === 0) {
    error(`${ctx}: "pasos" debe ser un array no vacío.`);
    hadError = true;
  } else {
    c.pasos.forEach((p, pidx) => {
      const pctx = `${ctx} -> paso[${pidx}]`;
      if (!p.tipo) {
        warn(`${pctx}: falta campo "tipo" (recomendado).`);
      } else if (!allowedPasosTipos.has(p.tipo) && typeof p.tipo === 'string') {
        // allow other types but warn
        warn(`${pctx}: tipo '${p.tipo}' no está en la lista sugerida (${[...allowedPasosTipos].join(', ')}).`);
      }

      // If it's a pregunta (pregunta con opciones), check opciones
      if (p.tipo === 'pregunta' || p.pregunta || p.opciones) {
        if (!Array.isArray(p.opciones) || p.opciones.length === 0) {
          error(`${pctx}: paso tipo pregunta sin "opciones" no vacías.`);
          hadError = true;
        } else {
          const optIds = new Set();
          p.opciones.forEach((o, oidx) => {
            if (!o.id && !o._id) {
              warn(`${pctx} -> opcion[${oidx}]: falta "id" (se recomienda).`);
            } else {
              const oid = o.id ?? o._id;
              if (optIds.has(oid)) {
                error(`${pctx} -> opcion[${oidx}]: id de opción duplicado '${oid}'.`);
                hadError = true;
              }
              optIds.add(oid);
            }

            if (!('texto' in o) && !('text' in o) && !('label' in o)) {
              warn(`${pctx} -> opcion[${oidx}]: falta campo "texto/text/label".`);
            }

            if (o.correct === undefined && o.isCorrect === undefined && o.score === undefined) {
              // Not necessarily an error, but warn if no indication of correctness
              warn(`${pctx} -> opcion[${oidx}]: no hay indicador claro de respuesta correcta (campo "correct"/"isCorrect"/"score").`);
            }
          });
        }
      }
    });
  }

  // Optional checks: dificultad normalizada
  if ('dificultad' in c) {
    const dif = String(c.dificultad).toLowerCase();
    const allowedDiff = ['fácil', 'media', 'difícil', 'facil', 'media', 'dificil', 'baja', 'alta'];
    if (!allowedDiff.includes(dif)) {
      warn(`${ctx}: valor de "dificultad" ('${c.dificultad}') no estándar.`);
    }
  }
});

if (!hadError) {
  ok('Validación completada sin errores críticos.');
  process.exit(0);
} else {
  error('Se encontraron errores en el/los casos. Revisa los mensajes anteriores.');
  process.exit(1);
}
