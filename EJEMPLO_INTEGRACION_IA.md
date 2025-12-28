// EJEMPLO_INTEGRACION_IA.md
# Ejemplo Completo de Integración IA

Este documento muestra cómo integrar las 3 funcionalidades de IA en tu frontend.

## 1. Tutor Socrático en Preguntas MCQ

### Escenario
Usuario responde incorrectamente una pregunta MCQ. Queremos mostrar botón de ayuda.

### Implementación

```tsx
// app/casos/[id]/PreguntaMCQ.tsx
'use client';

import { useState } from 'react';
import TutorButton from '@/app/components/TutorButton';
import { useAITutor } from '@/app/hooks/useAITutor';

interface PreguntaMCQProps {
  caseId: string;
  pregunta: {
    id: string;
    enunciado: string;
    opciones: Array<{
      id: string;
      texto: string;
      correcta: boolean;
      explicacion: string;
    }>;
  };
}

export default function PreguntaMCQ({ caseId, pregunta }: PreguntaMCQProps) {
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const [verificada, setVerificada] = useState(false);
  const { puede: puedeUsarTutor } = useAITutor({ caseId });

  const opcionCorrecta = pregunta.opciones.find(o => o.correcta);
  const esIncorrecta = verificada && respuestaSeleccionada !== opcionCorrecta?.id;

  const verificarRespuesta = () => {
    setVerificada(true);
  };

  return (
    <div className="space-y-4">
      {/* Enunciado */}
      <h3 className="font-semibold text-lg">{pregunta.enunciado}</h3>

      {/* Opciones */}
      <div className="space-y-2">
        {pregunta.opciones.map(opcion => (
          <button
            key={opcion.id}
            onClick={() => !verificada && setRespuestaSeleccionada(opcion.id)}
            disabled={verificada}
            className={`
              w-full p-4 text-left rounded-lg border-2 transition-all
              ${respuestaSeleccionada === opcion.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              ${verificada && opcion.correcta ? 'border-green-500 bg-green-50' : ''}
              ${verificada && respuestaSeleccionada === opcion.id && !opcion.correcta ? 'border-red-500 bg-red-50' : ''}
              ${!verificada ? 'hover:border-blue-300 cursor-pointer' : 'cursor-default'}
            `}
          >
            <span className="font-medium">{opcion.id.toUpperCase()}.</span> {opcion.texto}
          </button>
        ))}
      </div>

      {/* Botón verificar */}
      {!verificada && respuestaSeleccionada && (
        <button
          onClick={verificarRespuesta}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          Verificar respuesta
        </button>
      )}

      {/* Tutor IA (solo si es incorrecta) */}
      {esIncorrecta && puedeUsarTutor && (
        <div className="mt-6">
          <TutorButton
            caseId={caseId}
            preguntaId={pregunta.id}
            opcionElegida={respuestaSeleccionada!}
            opcionCorrecta={opcionCorrecta!.id}
          />
        </div>
      )}

      {/* Explicaciones (después del tutor o directo) */}
      {verificada && (
        <div className="mt-6 space-y-3">
          <h4 className="font-semibold text-gray-900">Explicaciones:</h4>
          {pregunta.opciones.map(opcion => (
            <div
              key={opcion.id}
              className={`p-3 rounded-lg ${
                opcion.correcta ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <p className="font-medium mb-1">
                {opcion.id.toUpperCase()}. {opcion.correcta && '✓ Correcta'}
              </p>
              <p className="text-sm text-gray-700">{opcion.explicacion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 2. Evaluación Automática de Pregunta SHORT

### Escenario
Usuario responde pregunta de desarrollo. Queremos evaluarla automáticamente con rúbrica.

### Implementación

```tsx
// app/casos/[id]/PreguntaSHORT.tsx
'use client';

import { useState } from 'react';
import { evaluarRespuestaSHORT, EvaluacionSHORT } from '@/lib/ai/evaluar-short';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface PreguntaSHORTProps {
  caseId: string;
  pregunta: {
    id: string;
    enunciado: string;
    rubrica: {
      criterios: Array<{
        id: string;
        nombre: string;
        puntos: number;
        evidencias: string[];
      }>;
      respuestaModelo: string;
    };
  };
}

export default function PreguntaSHORT({ caseId, pregunta }: PreguntaSHORTProps) {
  const [respuesta, setRespuesta] = useState('');
  const [evaluando, setEvaluando] = useState(false);
  const [evaluacion, setEvaluacion] = useState<EvaluacionSHORT | null>(null);

  const handleSubmit = async () => {
    if (respuesta.length < 10) {
      alert('Escribe al menos 10 caracteres');
      return;
    }

    setEvaluando(true);

    try {
      const resultado = await evaluarRespuestaSHORT({
        caseId,
        preguntaId: pregunta.id,
        respuestaEstudiante: respuesta,
      });

      if (resultado) {
        setEvaluacion(resultado);
      } else {
        alert('No se pudo evaluar automáticamente. Revisar manualmente.');
      }
    } catch (error) {
      console.error('Error evaluando:', error);
    } finally {
      setEvaluando(false);
    }
  };

  const puntajeMaximo = pregunta.rubrica.criterios.reduce((sum, c) => sum + c.puntos, 0);

  return (
    <div className="space-y-4">
      {/* Enunciado */}
      <h3 className="font-semibold text-lg">{pregunta.enunciado}</h3>

      {/* Rúbrica (mostrar antes de responder) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Rúbrica de evaluación:</h4>
        <ul className="space-y-2 text-sm">
          {pregunta.rubrica.criterios.map(criterio => (
            <li key={criterio.id} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">{criterio.nombre}</span>
                <span className="text-blue-600 ml-2">({criterio.puntos} pts)</span>
                <ul className="mt-1 ml-4 text-gray-600 space-y-0.5">
                  {criterio.evidencias.map((ev, i) => (
                    <li key={i}>• {ev}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-blue-600 mt-3">
          Puntaje máximo: {puntajeMaximo} puntos
        </p>
      </div>

      {/* Textarea para respuesta */}
      {!evaluacion && (
        <>
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder="Escribe tu respuesta aquí... (mínimo 10 caracteres)"
            className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            disabled={evaluando}
          />

          <button
            onClick={handleSubmit}
            disabled={evaluando || respuesta.length < 10}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
          >
            {evaluando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Evaluando con IA...
              </>
            ) : (
              'Enviar respuesta'
            )}
          </button>
        </>
      )}

      {/* Resultados de evaluación */}
      {evaluacion && (
        <div className="space-y-4 animate-fade-in">
          {/* Puntaje total */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Tu puntaje:</span>
              <span className="text-3xl font-bold text-green-600">
                {evaluacion.puntaje_total.toFixed(1)} / {puntajeMaximo}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(evaluacion.puntaje_total / puntajeMaximo) * 100}%` }}
              />
            </div>
          </div>

          {/* Feedback por criterio */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Evaluación por criterio:</h4>
            {evaluacion.criterios.map((criterio, index) => {
              const criterioOriginal = pregunta.rubrica.criterios[index];
              const porcentaje = (criterio.puntos / criterioOriginal.puntos) * 100;

              return (
                <div
                  key={criterio.id}
                  className="border border-gray-200 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {criterioOriginal.nombre}
                    </span>
                    <span className={`font-semibold ${porcentaje >= 80 ? 'text-green-600' : porcentaje >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {criterio.puntos.toFixed(1)} / {criterioOriginal.puntos}
                    </span>
                  </div>

                  {/* Evidencias logradas */}
                  {criterio.evidencias_logradas.length > 0 && (
                    <div className="text-sm">
                      <p className="text-green-700 font-medium mb-1">✓ Lograste:</p>
                      <ul className="ml-4 space-y-0.5 text-green-600">
                        {criterio.evidencias_logradas.map((ev, i) => (
                          <li key={i}>• {ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Evidencias faltantes */}
                  {criterio.evidencias_faltantes.length > 0 && (
                    <div className="text-sm">
                      <p className="text-yellow-700 font-medium mb-1">↻ Faltó profundizar:</p>
                      <ul className="ml-4 space-y-0.5 text-yellow-600">
                        {criterio.evidencias_faltantes.map((ev, i) => (
                          <li key={i}>• {ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Feedback */}
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {criterio.feedback}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Feedback global */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Feedback general:</h4>
            <p className="text-gray-700 leading-relaxed">
              {evaluacion.feedback_global}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 3. Análisis de Gaps al Finalizar Caso

### Escenario
Usuario completa caso con 2+ errores. Queremos analizar patrón.

### Implementación

```tsx
// app/casos/[id]/ResultadosCaso.tsx
'use client';

import GapsAnalysis from '@/app/components/GapsAnalysis';
import { CheckCircle, XCircle } from 'lucide-react';

interface ResultadosCasoProps {
  caseId: string;
  area: string;
  modulo: string;
  preguntas: Array<{
    id: string;
    correcta: boolean;
    opcionElegida: string;
  }>;
  puntaje: number;
  puntajeMaximo: number;
}

export default function ResultadosCaso({
  caseId,
  area,
  modulo,
  preguntas,
  puntaje,
  puntajeMaximo,
}: ResultadosCasoProps) {
  // Filtrar errores
  const errores = preguntas
    .filter(p => !p.correcta)
    .map(p => ({
      preguntaId: p.id,
      opcionElegida: p.opcionElegida,
    }));

  const porcentaje = Math.round((puntaje / puntajeMaximo) * 100);

  return (
    <div className="space-y-6">
      {/* Puntaje general */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Caso completado</h2>
        <div className="flex items-center gap-4">
          <div className="text-5xl font-bold">{porcentaje}%</div>
          <div className="text-sm">
            <p>{puntaje} / {puntajeMaximo} puntos</p>
            <p className="opacity-80">
              {preguntas.length - errores.length} correctas de {preguntas.length}
            </p>
          </div>
        </div>
      </div>

      {/* Resumen de preguntas */}
      <div className="grid grid-cols-1 gap-3">
        <h3 className="font-semibold text-gray-900">Resumen de preguntas:</h3>
        {preguntas.map((pregunta, index) => (
          <div
            key={pregunta.id}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              pregunta.correcta ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            {pregunta.correcta ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium text-gray-900">
              Pregunta {index + 1}
            </span>
            <span className={`ml-auto text-sm ${pregunta.correcta ? 'text-green-600' : 'text-red-600'}`}>
              {pregunta.correcta ? 'Correcta' : 'Incorrecta'}
            </span>
          </div>
        ))}
      </div>

      {/* Análisis de gaps (si hay 2+ errores) */}
      {errores.length >= 2 && (
        <GapsAnalysis
          caseId={caseId}
          errores={errores}
          area={area}
          modulo={modulo}
        />
      )}

      {/* Botones de acción */}
      <div className="flex gap-3">
        <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
          Ver explicaciones
        </button>
        <button className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700">
          Siguiente caso
        </button>
      </div>
    </div>
  );
}
```

## 4. Verificar Estado de IA

### Hook para verificar disponibilidad

```tsx
// hooks/useAIStatus.ts
import { useState, useEffect } from 'react';

export function useAIStatus() {
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai/estadisticas')
      .then(res => res.json())
      .then(data => {
        setEstadisticas(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error obteniendo stats IA:', err);
        setLoading(false);
      });
  }, []);

  return { estadisticas, loading };
}

// Uso en componente
function ProfileAIStats() {
  const { estadisticas, loading } = useAIStatus();

  if (loading) return <div>Cargando...</div>;
  if (!estadisticas) return null;

  return (
    <div className="bg-white rounded-lg p-4 border">
      <h3 className="font-semibold mb-2">Uso de IA hoy:</h3>
      <p className="text-sm text-gray-600">
        {estadisticas.hoy.llamadasHoy} / {estadisticas.hoy.limiteHoy} consultas usadas
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${estadisticas.hoy.porcentajeUsado}%` }}
        />
      </div>
    </div>
  );
}
```

---

## Notas Importantes

1. **El tutor NUNCA da respuestas directas** - Validación automática lo bloquea
2. **Límite de 1 uso del tutor por caso** - Se guarda en DB persistente
3. **Evaluación SHORT puede fallar** - Siempre tener fallback manual
4. **Análisis de gaps requiere ≥2 errores** - No se muestra si no hay patrón
5. **Todas las llamadas son trackeadas** - Verificar analytics en `/api/ai/estadisticas`

## Variables de Entorno Requeridas

```env
GEMINI_API_KEY=your_actual_key_here
DATABASE_URL=postgresql://...
```

Sin `GEMINI_API_KEY`, las funciones de IA fallarán silenciosamente.
