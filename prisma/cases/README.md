# 📚 Casos Clínicos de KLINIK-MAT

**Última actualización:** 28 de diciembre de 2025

---

## 📋 Estado Actual

La estructura de casos clínicos ha sido **renovada completamente**.

### ✨ Cambios Principales

1. **Nueva estructura en Prisma Schema**:
   - ✅ Soporte para preguntas tipo `mcq` (múltiple opción) y `short` (respuesta abierta)
   - ✅ Campo `enunciado` para el texto de la pregunta
   - ✅ Campo `explicacion` en opciones (más detallado que `feedback`)
   - ✅ Campo `criteriosEval: String[]` para evaluar preguntas abiertas
   - ✅ Campo `puntosMaximos` para scoring
   - ✅ Campo `referencias: String[]` para bibliografía

2. **Base de datos limpiada** (28 dic 2025):
   - ❌ Eliminados todos los casos antiguos (54 casos, 322 preguntas, 1148 opciones)
   - ✅ Estructura lista para nueva generación de contenido

3. **Archivos limpiados**:
   - ❌ Carpetas `GINECOLOGIA/`, `OBSTETRICIA/`, `NEONATOLOGIA/`, `SSR/` eliminadas
   - 📦 `cases.json5` → `cases.json5.backup`

---

## 🚀 Próximos Pasos

- [ ] Crear casos piloto con nueva estructura
- [ ] Script de seeding actualizado
- [ ] Componentes frontend para MCQ + SHORT
- [ ] Sistema de evaluación automática

Ver `/ESTRUCTURA-CASOS.md` y `/STACK_TECNOLOGICO.md` para más detalles.
