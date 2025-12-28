# Sistema de IA - Gemini Flash Integration

Sistema de inteligencia artificial educativa basado en Gemini Flash 1.5 con guardrails profesionales.

## 🎯 Características Principales

### 1. Tutor Socrático (1 uso por caso)
- **Propósito**: Guiar al estudiante sin dar respuestas directas
- **Activación**: Botón "Solicitar ayuda del tutor IA" en preguntas MCQ falladas
- **Límite**: 1 vez por caso clínico
- **Guardrails**: 
  - NUNCA menciona opciones correctas (a, b, c, d)
  - Solo hace preguntas guía (2-3 preguntas socráticas)
  - Enfoca en razonamiento clínico, no en resultados
  - Validación automática de respuestas

### 2. Evaluación Automática SHORT
- **Propósito**: Calificar preguntas de desarrollo con rúbrica analítica
- **Activación**: Automática al enviar respuesta SHORT
- **Características**:
  - Crédito parcial por evidencias logradas
  - Feedback formativo por criterio
  - Puntaje decimal (ej: 1.5/2.0 puntos)
  - Identificación de fortalezas y gaps

### 3. Detector de Gaps Conceptuales
- **Propósito**: Identificar patrones en errores
- **Activación**: Automática al finalizar caso con ≥2 errores
- **Características**:
  - Identifica concepto débil principal
  - Pregunta de reflexión metacognitiva
  - Recomendación de práctica específica
  - No da teoría, solo guía reflexión

## 🛡️ Guardrails de Seguridad

Aplicados a TODOS los prompts:

```typescript
1. JAMÁS mencionar opciones correctas (a, b, c, d)
2. NO dar respuestas finales, solo guiar razonamiento
3. Usar preguntas socráticas, no afirmaciones directas
4. Si estudiante pide respuesta, redirigir con pregunta
5. Máximo 2-3 preguntas cortas por respuesta
6. Enfoque en proceso, no en resultado
7. Lenguaje médico accesible pero profesional
```

### Validación Automática

Sistema detecta y bloquea:
- Menciones de "opción correcta es X"
- Texto exacto de opciones correctas
- Respuestas directas disfrazadas
- Fallback seguro si validación falla

## 💰 Control de Costos

### Límites Implementados

```typescript
MAX_INPUT_TOKENS: 1000
MAX_OUTPUT_TOKENS: 200
MAX_CALLS_PER_USER_PER_DAY: 50
MAX_CALLS_PER_CASE: 3 // 1 tutor + 1 short + 1 gaps
CACHE_TTL: 1 hora
```

### Proyección de Costos

**Gemini Flash 1.5 Pricing:**
- Input: $0.075 / 1M tokens
- Output: $0.30 / 1M tokens

**Caso de uso (1,000 usuarios, 15 casos/día):**
- Costo sin optimizar: $95/mes
- Costo optimizado (cache): $50-60/mes
- Por usuario: $0.05-0.095/mes (~50-95 CLP)
- % de ingresos: ~1% (asumiendo $5,000 CLP/mes)

### Optimizaciones Activas

1. **Caché inteligente**: Respuestas similares se reutilizan (1 hora TTL)
2. **Rate limiting**: Por usuario/día y por caso
3. **Validación pre-llamada**: Evita llamadas innecesarias
4. **Prompts optimizados**: Máximo contexto, mínimos tokens

## 📊 Tracking y Analytics

### Modelo AiUsage

```prisma
model AiUsage {
  id           String   @id
  userId       String
  caseId       String
  preguntaId   String?
  tipo         String   // "tutor_socratico", "evaluar_short", "detectar_gaps"
  tokensInput  Int
  tokensOutput Int
  cached       Boolean
  metadata     Json?    // Puntaje, concepto débil, etc.
  createdAt    DateTime
}
```

### Métricas Disponibles

- Llamadas por día/mes por usuario
- Tokens consumidos por tipo
- Costo estimado en USD
- % de respuestas desde caché
- Conceptos débiles más frecuentes

Endpoint: `GET /api/ai/estadisticas`

## 🚀 Uso en Frontend

### Tutor Socrático

```tsx
import TutorButton from '@/app/components/TutorButton';

<TutorButton
  caseId={casoId}
  preguntaId={pregunta.id}
  opcionElegida={respuestaUsuario}
  opcionCorrecta={respuestaCorrecta}
  yaUsado={yaUsoTutor}
/>
```

### Evaluación SHORT

```tsx
import { evaluarRespuestaSHORT } from '@/lib/ai/evaluar-short';

const evaluacion = await evaluarRespuestaSHORT({
  caseId,
  preguntaId,
  respuestaEstudiante,
});

if (evaluacion) {
  // Mostrar feedback con crédito parcial
  console.log(evaluacion.puntaje_total);
  console.log(evaluacion.feedback_global);
}
```

### Análisis de Gaps

```tsx
import GapsAnalysis from '@/app/components/GapsAnalysis';

// Al finalizar caso
<GapsAnalysis
  caseId={casoId}
  errores={erroresCometidos}
  area={area}
  modulo={modulo}
/>
```

## 🔒 Seguridad

1. **Autenticación**: Clerk (todas las rutas protegidas)
2. **Rate limiting**: Redis-based con límites por usuario
3. **Validación de entrada**: Sanitización de prompts
4. **CSRF**: Tokens en todas las mutaciones
5. **Logging**: Todas las llamadas registradas para auditoría

## 📝 Variables de Entorno

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Database (ya configurado)
DATABASE_URL=postgresql://...

# Redis (para cache - opcional, usa in-memory si no está)
REDIS_URL=redis://...
```

## 🧪 Testing

```bash
# Verificar límites
curl -X GET http://localhost:3000/api/ai/tutor?caseId=test-case-001

# Solicitar tutor
curl -X POST http://localhost:3000/api/ai/tutor \
  -H "Content-Type: application/json" \
  -d '{
    "caseId": "urgencias-obstetricas-hpp-atonia-001",
    "preguntaId": "q1",
    "opcionElegida": "a",
    "opcionCorrecta": "b"
  }'

# Ver estadísticas
curl -X GET http://localhost:3000/api/ai/estadisticas
```

## 📈 Roadmap

- [ ] Dashboard admin para monitoreo de costos en tiempo real
- [ ] A/B testing de prompts para optimizar calidad
- [ ] Feedback loop: estudiantes califican utilidad de IA
- [ ] Análisis longitudinal: tracking de mejora post-IA
- [ ] Multimodal: análisis de imágenes diagnósticas
- [ ] Fine-tuning: modelo especializado en casos chilenos

## 🎓 Principios Pedagógicos

1. **Constructivismo**: Estudiante construye conocimiento, IA solo guía
2. **Metacognición**: Preguntas que estimulan reflexión sobre proceso
3. **Feedback formativo**: Identifica qué está bien y qué falta profundizar
4. **Zona de desarrollo próximo**: Ayuda justa, no respuestas completas
5. **Evaluación auténtica**: Rúbricas que reflejan práctica clínica real

## 📞 Soporte

Para dudas sobre implementación de IA:
- Revisar logs: `logger.info('Llamada Gemini exitosa', {...})`
- Verificar límites: Endpoint `/api/ai/estadisticas`
- Caché: Tabla `cache_entries` en DB
- Uso: Tabla `ai_usage` para analytics

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 28, 2025  
**Modelo**: Gemini Flash 1.5  
**Costo operacional**: ~$50-95/mes para 1,000 usuarios activos
