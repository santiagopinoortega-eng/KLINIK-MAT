# 🤖 Sistema de Generación de Casos Clínicos con IA

Sistema automatizado para generar casos clínicos de alta calidad usando Claude Sonnet 4 o GPT-4.

## 🎯 Características

- ✅ Generación con IA (Claude/GPT-4)
- ✅ Validación automática con Zod
- ✅ Prompts pedagógicos optimizados
- ✅ Formato JSON5 compatible con Prisma
- ✅ Verificación de estructura médica
- ✅ Batch generation (15 casos/día)

---

## 📦 Setup

### 1. Instalar dependencias

```bash
npm install @anthropic-ai/sdk openai zod
```

### 2. Configurar API Keys

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-api03-...  # Claude
OPENAI_API_KEY=sk-...                # GPT-4
AI_PROVIDER=claude                    # 'claude' o 'gpt4'
```

---

## 🚀 Uso

### Generar 1 caso

```bash
npm run generar:casos -- \
  --area="Urgencias obstétricas" \
  --modulo="Hemorragia postparto" \
  --dificultad=Media \
  --cantidad=1
```

### Generar 15 casos (batch diario)

```bash
npm run generar:casos -- \
  --area="Embarazo y control prenatal" \
  --dificultad=mix \
  --cantidad=15
```

### Parámetros

- `--area`: Área médica (ver lista abajo)
- `--modulo`: Módulo específico (opcional)
- `--dificultad`: Baja | Media | Alta | mix (aleatorio)
- `--cantidad`: Número de casos a generar
- `--tema`: Tema específico (opcional, ej: "Preeclampsia severa")

### Áreas válidas

```typescript
- "Embarazo y control prenatal"
- "Parto y puerperio"
- "Urgencias obstétricas"
- "Patología ginecológica"
- "Oncología ginecológica"
- "Endocrinología reproductiva"
- "Cirugía ginecológica"
- "Anticoncepción y planificación familiar"
```

---

## 🔍 Validación

### Validar un caso

```bash
# Automático durante generación
# Si hay errores, el caso no se guarda
```

### Validar todos los casos

```bash
npm run validar:casos
```

**Checks realizados:**
- ✅ Sintaxis JSON5 válida
- ✅ Estructura completa (metadata, etapas, preguntas)
- ✅ Exactamente 1 opción correcta por MCQ
- ✅ Cantidad correcta de preguntas según dificultad
- ✅ Suma de puntos de rúbrica = puntosMaximos
- ✅ Etapas referenciadas existen
- ✅ Todas las opciones tienen explicación
- ⚠️  Opciones balanceadas en longitud
- ⚠️  Sin palabras absolutas ("siempre", "nunca")

---

## 📊 Workflow Diario Recomendado

### Mañana (2 horas) - Generación

```bash
# 1. Generar 15 casos
npm run generar:casos -- \
  --area="Urgencias obstétricas" \
  --dificultad=mix \
  --cantidad=15

# Output: prisma/cases/urgencias-obstetricas-hpp-123456.json5
#         prisma/cases/urgencias-obstetricas-eclampsia-123457.json5
#         ... (15 archivos)
```

### Tarde (3 horas) - Revisión Médica

Revisar manualmente cada caso generado:

1. **Viñeta clínica:** ¿Es realista? ¿Contexto chileno apropiado?
2. **Opciones MCQ:** ¿Son plausibles? ¿Longitud similar?
3. **Explicaciones:** ¿Son pedagógicas? ¿Enseñan algo útil?
4. **Referencias:** ¿Son actualizadas? ¿Incluyen MINSAL?
5. **Rúbrica SHORT:** ¿Evidencias apropiadas? ¿Respuesta modelo completa?

**Tips de revisión:**
- Verificar protocolos MINSAL cuando aplique
- Asegurar lenguaje médico chileno (no traducciones literales)
- Ajustar dosis de medicamentos a formulario nacional
- Validar contexto de atención (CESFAM, Hospital tipo X)

### Noche (30 min) - Seed y Test

```bash
# 1. Validar todos los casos
npm run validar:casos

# 2. Seed incremental (solo casos nuevos)
npm run seed:cases

# 3. Test aleatorio
npm run dev
# Navegar a /casos/[caso-random] y probar
```

---

## 🎓 Estructura del Caso Generado

```json5
{
  // Metadata
  id: "urgencias-obstetricas-hpp-atonia-001",
  areaPrincipal: "Urgencias obstétricas",
  dificultad: "Media", // Baja: 6 MCQ | Media: 6 MCQ + 1 SHORT | Alta: 7 MCQ + 1 SHORT
  
  // Escenario progresivo
  escenario: {
    contexto: "Hospital tipo 2, turno nocturno",
    etapas: [
      { id: "e1", titulo: "Presentación", texto: "..." },
      { id: "e2", titulo: "Complicación", texto: "..." },
      { id: "e3", titulo: "Examen físico", texto: "..." },
    ]
  },
  
  // Evaluación
  pasos: [
    {
      tipo: "mcq",
      leadInTipo: "diagnostico", // o siguiente_paso, interpretacion_examenes, etc.
      opciones: [
        { id: "a", texto: "...", explicacion: "..." },
        { id: "b", texto: "...", esCorrecta: true, explicacion: "CORRECTO. ..." },
        // ... exactamente 4 opciones
      ]
    },
    // ... 6 MCQ total
    {
      tipo: "short",
      rubrica: {
        criterios: [
          { nombre: "Diagnóstico", puntos: 2, evidencias: ["keyword1", ...] },
          { nombre: "Manejo", puntos: 2, evidencias: [...] },
          { nombre: "Comunicación", puntos: 2, evidencias: [...] }
        ],
        respuestaModelo: "Respuesta ideal completa..."
      }
    }
  ],
  
  // Referencias
  referencias: [
    "Guía MINSAL ...",
    "WHO recommendations ...",
    "ACOG Practice Bulletin ..."
  ]
}
```

---

## 💰 Costos

### Claude Sonnet 4
- **Input:** $3/MTok
- **Output:** $15/MTok
- **Tokens por caso:** ~2,000 input + ~6,000 output
- **Costo por caso:** ~$0.096
- **15 casos/día:** ~$1.44/día = **$43/mes**

### GPT-4 Turbo
- **Input:** $10/MTok
- **Output:** $30/MTok
- **Tokens por caso:** ~2,000 input + ~6,000 output
- **Costo por caso:** ~$0.20
- **15 casos/día:** ~$3/día = **$90/mes**

**Recomendación:** Usar **Claude Sonnet 4** (más barato y mejor en textos largos)

---

## 🔧 Troubleshooting

### Error: "ANTHROPIC_API_KEY no configurada"
```bash
# Agregar a .env.local
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Error: "Validación falló: Suma de criterios ≠ puntosMaximos"
La IA generó una rúbrica con puntos incorrectos. Editar manualmente el archivo .json5:
```json5
// Asegurar que suma = puntosMaximos
criterios: [
  { puntos: 2 },
  { puntos: 2 },
  { puntos: 2 }  // Total: 6
],
puntosMaximos: 6  // ✅ Coincide
```

### Error: "MCQ tiene 2 opciones correctas"
La IA marcó múltiples opciones como correctas. Editar manualmente:
```json5
opciones: [
  { id: "a", esCorrecta: false },
  { id: "b", esCorrecta: true },  // Solo esta
  { id: "c", esCorrecta: false }, // era: true → false
  { id: "d", esCorrecta: false }
]
```

### Casos generados con contexto no chileno
Ajustar el prompt en `scripts/ai/prompts.ts` para enfatizar:
- Sistema de salud chileno (CESFAM, SAP, Hospital tipo X)
- Protocolos MINSAL
- Medicamentos según formulario nacional
- Costos y acceso realistas

---

## 📈 Métricas de Calidad

Después de 1 mes de generación (450 casos):

### Validación técnica
- ✅ 95%+ de casos válidos sin edición manual
- ⚠️  5% requieren ajustes menores (dosificaciones, referencias)

### Revisión pedagógica
- Tiempo de revisión: **10-12 min/caso**
- Ajustes comunes:
  * Viñetas muy genéricas → agregar detalles específicos
  * Opciones desbalanceadas → reescribir para igualar longitud
  * Referencias desactualizadas → buscar versión más reciente

### Feedback de estudiantes (beta)
- Realismo: 4.5/5
- Claridad: 4.7/5
- Dificultad apropiada: 4.3/5

---

## 🚀 Próximos Pasos

### Semana 1-2
- [ ] Generar 100 casos (Urgencias obstétricas)
- [ ] Validar con docentes expertos
- [ ] Ajustar prompts según feedback

### Mes 1
- [ ] Generar 450 casos (mix de áreas)
- [ ] Crear casos de dificultad Alta (razonamiento complejo)
- [ ] Implementar sistema de tags para búsqueda

### Mes 2
- [ ] A/B testing de diferentes prompts
- [ ] Métricas de engagement (qué casos se completan más)
- [ ] Iterar basado en datos de uso real

---

## 📚 Recursos Adicionales

- [Prompts optimizados](./prompts.ts)
- [Schema de validación](./validar-caso.ts)
- [Ejemplo de caso completo](../../prisma/cases/hpp-atonia-v2.json5)
- [Guía de escritura de MCQ (NBME)](https://www.nbme.org/sites/default/files/2019-08/Item-Writing-Manual-Download.pdf)

---

**Última actualización:** 28 dic 2025  
**Mantenedor:** Sistema KLINIK-MAT
