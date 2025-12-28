# Generador de Casos Clínicos con IA - Quick Start

## ⚡ Setup Rápido (5 minutos)

### 1. Instalar dependencias

```bash
npm install @anthropic-ai/sdk openai zod
```

### 2. Agregar API keys a .env.local

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
OPENAI_API_KEY=sk-xxxxx
AI_PROVIDER=claude  # o 'gpt4'
```

### 3. Generar tu primer caso

```bash
npm run generar:casos -- \
  --area="Urgencias obstétricas" \
  --dificultad=Media \
  --cantidad=1
```

**Output:** `prisma/cases/urgencias-obstetricas-xxx-123456.json5`

### 4. Validar y hacer seed

```bash
# Validar
npm run validar:casos

# Agregar a BD
npm run seed:cases

# Probar
npm run dev
# Ir a http://localhost:3000/casos
```

---

## 📊 Workflow Diario (15 casos)

### Mañana - Generar (2h)

```bash
npm run generar:casos -- \
  --area="Embarazo y control prenatal" \
  --dificultad=mix \
  --cantidad=15
```

### Tarde - Revisar (3h)

Abrir cada archivo `.json5` en `prisma/cases/` y verificar:
- ✅ Viñetas realistas (contexto chileno)
- ✅ Opciones MCQ balanceadas
- ✅ Explicaciones pedagógicas
- ✅ Referencias actualizadas

### Noche - Deploy (30min)

```bash
npm run validar:casos
npm run seed:cases
git add prisma/cases/
git commit -m "feat: agregar 15 casos de [área]"
```

---

## 💰 Costos

**Claude Sonnet 4 (recomendado):**
- $0.096/caso
- 15 casos/día = $1.44/día = **$43/mes**

**GPT-4 Turbo:**
- $0.20/caso
- 15 casos/día = $3/día = **$90/mes**

---

## 🎯 Meta: 450 Casos en 1 Mes

```
Día 1-10:  150 casos (Urgencias obstétricas)
Día 11-20: 150 casos (Embarazo y control prenatal)
Día 21-30: 150 casos (Parto y puerperio)
```

**Listo para lanzamiento en Marzo 2025** 🚀

---

Documentación completa: [README.md](./README.md)
