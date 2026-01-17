# 📁 Estructura de Carpetas - Casos Clínicos KLINIK-MAT

**Total:** 1200 casos | **TEMAs:** 6 | **Subáreas:** 24

---

## 📊 Vista General

```
prisma/cases/
├── _PLANTILLA_CASO_2026.json5
├── _EJEMPLO_CASO_NIVEL_MEDIO.json5
├── README.md
│
├── 📁 TEMA1-EMBARAZO-PRENATAL/ (200 casos)
│   ├── 01-control-normal/ (50 casos)
│   ├── 02-patologia-embarazo/ (50 casos)
│   ├── 03-diagnostico-prenatal/ (50 casos)
│   └── 04-complicaciones/ (50 casos)
│
├── 📁 TEMA2-PARTO-INTRAPARTO/ (200 casos)
│   ├── 01-parto-normal/ (50 casos)
│   ├── 02-monitoreo-fetal/ (50 casos)
│   ├── 03-parto-instrumental/ (50 casos)
│   └── 04-urgencias/ (50 casos)
│
├── 📁 TEMA3-PUERPERIO-LACTANCIA/ (200 casos)
│   ├── 01-puerperio-normal/ (50 casos)
│   ├── 02-complicaciones/ (50 casos)
│   ├── 03-lactancia/ (50 casos)
│   └── 04-cuidados-rn/ (50 casos)
│
├── 📁 TEMA4-GINECOLOGIA/ (200 casos)
│   ├── 01-trastornos-menstruales/ (50 casos)
│   ├── 02-infecciones/ (50 casos)
│   ├── 03-patologia-mamas/ (50 casos)
│   └── 04-patologia-ovarica/ (50 casos)
│
├── 📁 TEMA5-SALUD-SEXUAL/ (200 casos)
│   ├── 01-anticonceptivos/ (50 casos)
│   ├── 02-metodos-barrera/ (50 casos)
│   ├── 03-its/ (50 casos)
│   └── 04-planificacion/ (50 casos)
│
└── 📁 TEMA6-NEONATOLOGIA/ (200 casos)
    ├── 01-atencion-inmediata/ (50 casos)
    ├── 02-prematuro/ (50 casos)
    ├── 03-patologia/ (50 casos)
    └── 04-cuidados/ (50 casos)
```

---

## 📝 Cada Subárea Contiene

- ✅ **50 casos** distribuidos:
  - 🟢 001-017: Nivel BAJA (17 casos - 34%)
  - 🟡 018-037: Nivel MEDIA (20 casos - 40%)
  - 🔴 038-050: Nivel ALTA (13 casos - 26%)

---

## 📈 Resumen Numérico

| TEMA | Subáreas | Casos | % |
|------|----------|-------|---|
| TEMA 1: Embarazo Prenatal | 4 | 200 | 17% |
| TEMA 2: Parto Intraparto | 4 | 200 | 17% |
| TEMA 3: Puerperio Lactancia | 4 | 200 | 17% |
| TEMA 4: Ginecología | 4 | 200 | 17% |
| TEMA 5: Salud Sexual | 4 | 200 | 17% |
| TEMA 6: Neonatología | 4 | 200 | 17% |
| **TOTAL** | **24** | **1200** | **100%** |

### Por Dificultad (Global)

| Dificultad | Casos por subárea | Total | % |
|------------|-------------------|-------|---|
| 🟢 BAJA | 17 | 408 | 34% |
| 🟡 MEDIA | 20 | 480 | 40% |
| 🔴 ALTA | 13 | 312 | 26% |
| **Total** | **50** | **1200** | **100%** |

---

## 🚀 Cómo Usar Esta Estructura

### 1. Navegar a una subárea
```bash
cd prisma/cases/TEMA1-EMBARAZO-PRENATAL/01-control-normal/
```

### 2. Crear un caso
```bash
# Copiar plantilla
cp ../../_PLANTILLA_CASO_2026.json5 caso-001.json5

# Editar caso
# ...

# Validar
npm run validate:case caso-001.json5
```

### 3. Ver progreso
```bash
ls *.json5 | wc -l  # Contar casos creados
```

---

## 🎯 Próximos Pasos

1. ✅ Estructura de carpetas creada
2. ✅ Configuración actualizada
3. ⏳ Comenzar creación de 1200 casos
4. ⏳ Validación continua
5. ⏳ Testing en base de datos

---

**🏗️ Arquitectura sólida lista para construcción de 1200 casos clínicos**

*Última actualización: 12 de enero de 2026*
