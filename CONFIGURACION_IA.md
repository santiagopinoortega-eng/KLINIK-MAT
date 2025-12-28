# 🤖 CONFIGURACIÓN DE IA - GUÍA RÁPIDA

## ✅ Checklist de Implementación

- [x] SDK instalado (`@google/generative-ai`)
- [x] Tablas de DB creadas (`AiUsage`, `CacheEntry`)
- [x] Endpoints API creados (`/api/ai/tutor`, `/api/ai/evaluar-short`, `/api/ai/gaps`)
- [x] Componentes frontend (`TutorButton`, `GapsAnalysis`)
- [x] Prompts con guardrails
- [x] Sistema de rate limiting
- [x] Tracking de costos
- [x] Documentación completa

## 🚀 Setup en 3 Pasos

### 1. Obtener API Key de Gemini

```bash
# 1. Ir a: https://makersuite.google.com/app/apikey
# 2. Hacer clic en "Create API Key"
# 3. Copiar la key generada
```

### 2. Configurar Variable de Entorno

```bash
# Editar .env.local (o .env en desarrollo)
echo 'GEMINI_API_KEY=tu_api_key_aqui' >> .env.local
```

### 3. Verificar Configuración

```bash
# Ejecutar script de test
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/test-gemini.ts

# Deberías ver:
# ✓ API key encontrada
# ✓ Cliente Gemini inicializado
# ✓ Respuesta recibida
# ✅ CONFIGURACIÓN CORRECTA
```

## 📦 Archivos Creados

### Backend (API Routes)
- `app/api/ai/tutor/route.ts` - Tutor socrático (POST, GET)
- `app/api/ai/evaluar-short/route.ts` - Evaluación SHORT con rúbrica (POST)
- `app/api/ai/gaps/route.ts` - Análisis de gaps conceptuales (POST)
- `app/api/ai/estadisticas/route.ts` - Estadísticas de uso (GET)

### Servicios
- `lib/gemini.ts` - Cliente Gemini con rate limiting y cache
- `lib/ai/prompts.ts` - Prompts con guardrails profesionales
- `lib/ai/evaluar-short.ts` - Helper para evaluación SHORT

### Componentes Frontend
- `app/components/TutorButton.tsx` - Botón de ayuda IA
- `app/components/GapsAnalysis.tsx` - Análisis al finalizar caso
- `app/hooks/useAITutor.ts` - Hook para estado del tutor

### Database
- `prisma/schema.prisma` - Modelos `AiUsage` y `CacheEntry`
- `prisma/migrations/.../migration.sql` - Migración aplicada

### Documentación
- `SISTEMA_IA.md` - Documentación técnica completa
- `EJEMPLO_INTEGRACION_IA.md` - Ejemplos de uso en frontend
- `scripts/test-gemini.ts` - Script de verificación

## 🎯 Funcionalidades Implementadas

### 1. Tutor Socrático
- ✅ 1 uso por caso clínico
- ✅ Solo en preguntas MCQ falladas
- ✅ NUNCA da respuestas directas
- ✅ 2-3 preguntas guía
- ✅ Validación anti-leak de respuestas

**Uso:**
```tsx
<TutorButton
  caseId="caso-123"
  preguntaId="q1"
  opcionElegida="a"
  opcionCorrecta="b"
/>
```

### 2. Evaluación SHORT
- ✅ Calificación con rúbrica analítica
- ✅ Crédito parcial por evidencias
- ✅ Feedback formativo por criterio
- ✅ Puntaje decimal (ej: 4.5/6)

**Uso:**
```tsx
const evaluacion = await evaluarRespuestaSHORT({
  caseId: "caso-123",
  preguntaId: "q7",
  respuestaEstudiante: "...",
});
```

### 3. Detector de Gaps
- ✅ Análisis de patrón de errores
- ✅ Identifica concepto débil
- ✅ Pregunta de reflexión
- ✅ Recomendación de práctica

**Uso:**
```tsx
<GapsAnalysis
  caseId="caso-123"
  errores={[...]}
  area="Urgencias obstétricas"
  modulo="Hemorragia postparto"
/>
```

## 🛡️ Seguridad y Límites

### Rate Limiting
- **Por usuario/día**: 50 llamadas
- **Por caso**: 3 llamadas (1 tutor + 1 SHORT + 1 gaps)
- **Cache**: 1 hora (reduce costos)

### Guardrails
```typescript
✓ No menciona opciones correctas (a, b, c, d)
✓ No da respuestas finales
✓ Solo preguntas socráticas
✓ Redirige si piden respuesta
✓ Validación automática de salida
```

### Tokens
- **Max input**: 1,000 tokens
- **Max output**: 200 tokens
- **Estimación**: ~4 caracteres = 1 token

## 💰 Costos Proyectados

### Gemini Flash 1.5
- Input: $0.075 / 1M tokens
- Output: $0.30 / 1M tokens

### Escenario Real (1,000 usuarios activos)
- **15 casos/día por usuario**
- **450,000 casos/mes**
- **Costo sin optimizar**: $95/mes
- **Costo optimizado**: $50-60/mes
- **Por usuario**: ~$0.05-0.095/mes (50-95 CLP)
- **% de ingresos**: ~1% (asumiendo $5,000 CLP/mes)

### Optimizaciones Activas
1. Cache de respuestas similares (1h TTL)
2. Rate limiting estricto
3. Prompts optimizados (<1000 tokens)
4. Validación pre-llamada

## 📊 Monitoreo

### Estadísticas de Usuario
```bash
curl http://localhost:3000/api/ai/estadisticas
```

**Respuesta:**
```json
{
  "hoy": {
    "llamadasHoy": 5,
    "limiteHoy": 50,
    "porcentajeUsado": 10
  },
  "ultimos30Dias": {
    "usosPorTipo": [
      { "tipo": "tutor_socratico", "cantidad": 42, "tokensInput": 63000, "tokensOutput": 13860 },
      { "tipo": "evaluar_short", "cantidad": 18, "tokensInput": 27000, "tokensOutput": 5940 }
    ],
    "tokensTotal": { "input": 90000, "output": 19800 },
    "costoEstimadoUSD": "0.0135"
  }
}
```

### Base de Datos

```sql
-- Ver uso de IA por usuario
SELECT userId, tipo, COUNT(*) as llamadas, SUM(tokensInput + tokensOutput) as tokens_totales
FROM ai_usage
WHERE createdAt >= NOW() - INTERVAL '30 days'
GROUP BY userId, tipo;

-- Ver costos del mes
SELECT 
  DATE_TRUNC('day', createdAt) as fecha,
  SUM(tokensInput) / 1000000.0 * 0.075 as costo_input,
  SUM(tokensOutput) / 1000000.0 * 0.30 as costo_output
FROM ai_usage
WHERE createdAt >= NOW() - INTERVAL '30 days'
GROUP BY fecha
ORDER BY fecha DESC;
```

## 🧪 Testing

### 1. Test de Configuración
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/test-gemini.ts
```

### 2. Test Manual en App
1. Iniciar servidor: `npm run dev`
2. Ir a caso: http://localhost:3000/casos/urgencias-obstetricas-hpp-atonia-001
3. Responder incorrectamente pregunta 1
4. Hacer clic en "Solicitar ayuda del tutor IA"
5. Verificar:
   - ✓ Respuesta tiene 2-3 preguntas
   - ✓ NO menciona opciones (a, b, c, d)
   - ✓ NO da respuesta correcta
   - ✓ Guía el razonamiento

### 3. Test de Límites
```bash
# Llamar 4 veces al mismo caso (debería bloquear)
for i in {1..4}; do
  curl -X POST http://localhost:3000/api/ai/tutor \
    -H "Content-Type: application/json" \
    -d '{"caseId":"test","preguntaId":"q1","opcionElegida":"a","opcionCorrecta":"b"}'
done

# Respuesta esperada en 4ta llamada:
# {"error":"Límite de consultas por caso alcanzado","tipo":"limite_caso"}
```

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY no configurada"
```bash
# Verificar que .env.local existe y tiene la key
cat .env.local | grep GEMINI_API_KEY

# Si no existe, crear:
echo 'GEMINI_API_KEY=tu_api_key_aqui' >> .env.local

# Reiniciar servidor
```

### Error: "API_KEY_INVALID"
```bash
# Obtener nueva key en:
https://makersuite.google.com/app/apikey

# Reemplazar en .env.local
```

### Error: "QUOTA_EXCEEDED"
```bash
# Gemini Flash tiene cuota gratuita limitada
# Opciones:
# 1. Esperar al siguiente período (se resetea mensual)
# 2. Activar facturación en Google Cloud Console
# 3. Usar otra API key (crear nuevo proyecto)
```

### Error: "Respuesta vacía o muy corta"
```bash
# Verificar que el modelo esté respondiendo
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/test-gemini.ts

# Si falla, revisar:
# - Status de Gemini API: https://status.cloud.google.com
# - Límites del modelo (maxOutputTokens > 0)
```

## 📚 Recursos

- **Gemini API Docs**: https://ai.google.dev/docs
- **Pricing**: https://ai.google.dev/pricing
- **Modelos**: https://ai.google.dev/models/gemini
- **Límites**: https://ai.google.dev/pricing#1_5flash

## 🎓 Principios Pedagógicos

El sistema sigue estas reglas:

1. **No dar respuestas** - El estudiante debe razonar
2. **Preguntas socráticas** - Estimular pensamiento crítico
3. **Feedback formativo** - Identificar qué está bien y qué falta
4. **Metacognición** - Reflexión sobre el proceso de aprendizaje
5. **Andamiaje** - Ayuda justa, no soluciones completas

## ✨ Próximos Pasos

Una vez configurado:

1. ✅ Integrar `TutorButton` en componente de preguntas MCQ
2. ✅ Agregar evaluación SHORT automática
3. ✅ Mostrar análisis de gaps en pantalla de resultados
4. 📊 Crear dashboard de analytics de IA
5. 🧪 Hacer A/B testing de prompts
6. 📈 Monitorear engagement y efectividad

---

**¿Todo funcionando?** 🎉

Ahora tienes un tutor IA profesional que:
- Guía sin dar respuestas directas
- Evalúa con rúbricas analíticas
- Detecta gaps conceptuales
- Cuesta <1% de tus ingresos
- Escala a miles de usuarios
- Está listo para producción

**¡Excelente trabajo!** 🚀
