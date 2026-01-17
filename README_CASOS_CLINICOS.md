# 🏥 Sistema de Casos Clínicos KLINIK-MAT 2026

> **480 casos clínicos** distribuidos en **6 áreas** y **24 subáreas**  
> Optimizado para aprendizaje progresivo y pensamiento clínico

---

## 🎯 Configuración Rápida

```
Total:              480 casos
Áreas:              6 áreas × 80 casos
Subáreas:           24 subáreas × 20 casos

Dificultad BAJA:    6 MCQ
Dificultad MEDIA:   6 MCQ + 1 SHORT
Dificultad ALTA:    7 MCQ + 1 SHORT
```

---

## 📚 Documentación Disponible

| Documento | Descripción |
|-----------|-------------|
| [PLAN_CASOS_CLINICOS_2026.md](./PLAN_CASOS_CLINICOS_2026.md) | Plan detallado completo con todas las áreas |
| [GUIA_CREACION_CASOS_2026.md](./GUIA_CREACION_CASOS_2026.md) | Guía paso a paso para crear casos |
| [RESUMEN_CASOS_CLINICOS_2026.md](./RESUMEN_CASOS_CLINICOS_2026.md) | Resumen ejecutivo del sistema |
| [NOMENCLATURA_IDS_CASOS.md](./NOMENCLATURA_IDS_CASOS.md) | Convenciones de IDs y nomenclatura |

---

## 🗂️ Estructura de Áreas

```
1. 🤰 Embarazo y Control Prenatal (80)
   ├── Control Prenatal Normal (20)
   ├── Patología del Embarazo (20)
   ├── Diagnóstico Prenatal (20)
   └── Complicaciones Materno-Fetales (20)

2. 👶 Parto y Atención Intraparto (80)
   ├── Parto Normal y Mecánica (20)
   ├── Monitoreo Fetal Intraparto (20)
   ├── Parto Instrumental (20)
   └── Urgencias Obstétricas (20)

3. 🍼 Puerperio y Lactancia (80)
   ├── Puerperio Normal (20)
   ├── Complicaciones Puerperio (20)
   ├── Lactancia Materna (20)
   └── Cuidados del RN (20)

4. 👩‍⚕️ Ginecología (80)
   ├── Trastornos Menstruales (20)
   ├── Infecciones Genitales (20)
   ├── Patología de Mamas (20)
   └── Patología Ovárica/Endometrial (20)

5. 💊 Salud Sexual y Anticoncepción (80)
   ├── Métodos Anticonceptivos (20)
   ├── Métodos Barrera (20)
   ├── ITS (20)
   └── Planificación Familiar (20)

6. 🧸 Neonatología (80)
   ├── Atención Inmediata RN (20)
   ├── RN Prematuro (20)
   ├── Patología Neonatal (20)
   └── Cuidados Neonatales (20)
```

---

## 🛠️ Comandos Rápidos

### Validar Casos

```bash
# Validar un caso específico
npm run validate:case prisma/cases/OBSTETRICIA/.../caso.json5

# Validar una subárea completa
npm run validate:subarea prisma/cases/OBSTETRICIA/01-embarazo-prenatal/01-control-normal

# Validar todos los casos
npm run validate:all
```

### Crear Base de Datos

```bash
# Migrar schema
npm run db:push

# Hacer seed de casos
npm run seed:cases
```

---

## 📝 Plantillas y Ejemplos

| Archivo | Uso |
|---------|-----|
| `prisma/cases/_PLANTILLA_CASO_2026.json5` | Plantilla base para nuevos casos |
| `prisma/cases/_EJEMPLO_CASO_NIVEL_MEDIO.json5` | Ejemplo completo nivel MEDIA |
| `prisma/cases/OBSTETRICIA/.../hpp-atonia-v2.json5` | Caso existente de referencia |

---

## 🎓 Filosofía Pedagógica

### 4 Principios Clave

1. **📈 Progresión Gradual**  
   Baja → Media → Alta

2. **🤔 Toma de Decisiones**  
   Énfasis en el "por qué"

3. **🔗 Integración de Materias**  
   Ciencias básicas ↔ clínicas

4. **🧠 Pensamiento Clínico**  
   Razonamiento estructurado

---

## 📊 Distribución por Dificultad

### Por cada subárea (20 casos)

```
🟢 BAJA (7):   35%  →  6 preguntas MCQ
🟡 MEDIA (8):  40%  →  6 MCQ + 1 SHORT
🔴 ALTA (5):   25%  →  7 MCQ + 1 SHORT
```

---

## 🚀 Quick Start

### 1. Lee la Documentación
```bash
# Guía completa de creación
cat GUIA_CREACION_CASOS_2026.md
```

### 2. Revisa Ejemplos
```bash
# Ver ejemplo de caso nivel medio
cat prisma/cases/_EJEMPLO_CASO_NIVEL_MEDIO.json5
```

### 3. Crea tu Primer Caso
```bash
# Copiar plantilla
cp prisma/cases/_PLANTILLA_CASO_2026.json5 prisma/cases/OBSTETRICIA/.../mi-caso.json5

# Editar caso
# ...

# Validar
npm run validate:case prisma/cases/OBSTETRICIA/.../mi-caso.json5
```

---

## 📦 Archivos Clave

```
KLINIK-MAT/
├── 📄 PLAN_CASOS_CLINICOS_2026.md          ← Plan detallado
├── 📄 GUIA_CREACION_CASOS_2026.md          ← Guía paso a paso
├── 📄 RESUMEN_CASOS_CLINICOS_2026.md       ← Resumen ejecutivo
├── 📄 NOMENCLATURA_IDS_CASOS.md            ← Convenciones de IDs
│
├── lib/constants/
│   └── clinical-cases.ts                    ← Constantes TypeScript
│
├── scripts/
│   └── validate-clinical-case.js            ← Script de validación
│
└── prisma/cases/
    ├── _PLANTILLA_CASO_2026.json5           ← Plantilla base
    ├── _EJEMPLO_CASO_NIVEL_MEDIO.json5      ← Ejemplo completo
    │
    ├── OBSTETRICIA/
    ├── GINECOLOGIA/
    └── NEONATOLOGIA/
```

---

## ✅ Checklist Antes de Empezar

- [ ] Leer `GUIA_CREACION_CASOS_2026.md` completa
- [ ] Revisar `_EJEMPLO_CASO_NIVEL_MEDIO.json5`
- [ ] Familiarizarse con `lib/constants/clinical-cases.ts`
- [ ] Tener acceso a guías clínicas actualizadas
- [ ] Probar script de validación

---

## 📈 Progreso Actual

```
OBSTETRICIA:     0/240 (0%)
GINECOLOGIA:     0/160 (0%)
NEONATOLOGIA:    0/80  (0%)
─────────────────────────
TOTAL:           0/480 (0%)
```

---

## 💡 Tips Rápidos

1. ✅ Usa la plantilla siempre
2. ✅ Valida frecuentemente
3. ✅ Basa en casos reales
4. ✅ Explica el "por qué"
5. ✅ Mantén consistencia

---

## 📞 Recursos Adicionales

- **Constantes:** `lib/constants/clinical-cases.ts`
- **Schema:** `prisma/schema.prisma`
- **Validación:** `scripts/validate-clinical-case.js`
- **Ejemplos:** `prisma/cases/_EJEMPLO_*.json5`

---

**🎯 Sistema listo para construcción de 480 casos clínicos de alta calidad**

*Última actualización: 12 de enero de 2026*
