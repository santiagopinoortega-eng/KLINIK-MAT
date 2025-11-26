# 📚 Casos Clínicos por Módulo

Esta carpeta contiene los casos clínicos organizados por **área clínica** y **módulo**.

## 📁 Estructura de Archivos (Nueva Organización)

```
prisma/cases/
├── GINECOLOGIA/                    # Área 1: Ginecología y Salud de la Mujer
│   ├── ITS.json5                   # 16 casos - ITS e Infectología
│   └── CLIMATERIO.json5            # 9 casos - Climaterio y Menopausia
├── SSR/                            # Área 2: Salud Sexual y Reproductiva
│   ├── ANTICONCEPCION.json5        # 19 casos - Anticoncepción
│   └── CONSEJERIA.json5            # 10 casos - Consejería en Salud Integral
├── OBSTETRICIA/                    # Área 3: Obstetricia y Puerperio (Próximamente)
│   ├── EMBARAZO.json5              # Casos de embarazo
│   ├── PARTO.json5                 # Casos de parto
│   └── PUERPERIO.json5             # Casos de puerperio
└── NEONATOLOGIA/                   # Área 4: Neonatología (Próximamente)
    └── RN.json5                    # Casos de recién nacido
```

## 📊 Resumen de Casos

| Área | Módulo | Casos | Estado |
|------|--------|-------|--------|
| **GINECOLOGIA** | ITS | 16 | ✅ Disponible |
| **GINECOLOGIA** | Climaterio y Menopausia | 9 | ✅ Disponible |
| **SSR** | Anticoncepción | 19 | ✅ Disponible |
| **SSR** | Consejería | 10 | ✅ Disponible |
| **OBSTETRICIA** | Embarazo | 0 | 🚧 Próximamente |
| **OBSTETRICIA** | Parto | 0 | 🚧 Próximamente |
| **OBSTETRICIA** | Puerperio | 0 | 🚧 Próximamente |
| **NEONATOLOGIA** | Recién Nacido | 0 | 🚧 Próximamente |

**Total:** 54 casos disponibles

## 📝 Formato de Casos

Cada archivo `.json5` debe contener un array de casos con la siguiente estructura:

```json5
[
  {
    "id": "modulo-tema-numero",        // ej: "its-cervicitis-01"
    "modulo": "ITS",                   // Nombre del módulo
    "dificultad": "Baja",              // "Baja" | "Media" | "Alta"
    "titulo": "Título descriptivo del caso",
    "vigneta": "Historia clínica completa del caso...",
    
    "pasos": [
      // Baja = 5 pasos, Media = 6 pasos, Alta = 7 pasos
      {
        "id": "p1",
        "tipo": "mcq",                 // Pregunta de opción múltiple
        "enunciado": "Pregunta clínica...",
        "opciones": [
          {
            "id": "a",
            "texto": "Opción A",
            "esCorrecta": true,
            "explicacion": "Razón por la que ES correcta..."
          },
          {
            "id": "b",
            "texto": "Opción B",
            "esCorrecta": false,
            "explicacion": "Razón por la que NO es correcta..."
          },
          // ... opciones C y D (4 opciones en total)
        ]
      },
      // ... más pasos
    ],
    
    "feedback_dinamico": {
      "bajo": "Feedback para 0-30% de respuestas correctas...",
      "medio": "Feedback para 31-60% de respuestas correctas...",
      "alto": "Feedback para 61-100% de respuestas correctas..."
    },
    
    "referencias": [
      "MINSAL — Norma Técnica...",
      "OMS — Guía..."
    ]
  }
]
```

## 🔄 Migración desde archivo único

Si anteriormente usabas `prisma/cases.json5` (archivo único), ejecuta:

```bash
node scripts/reorganizar-casos.mjs
```

Este script automáticamente:
- ✅ Separa los casos por módulo
- ✅ Los ordena por dificultad (Alta → Media → Baja)
- ✅ Crea la estructura de carpetas
- ✅ Genera archivos placeholder para áreas futuras

## 🚀 Cargar casos en la base de datos

```bash
npm run seed:cases
```

El script `seed-cases.ts` carga automáticamente:
1. **Prioridad:** Casos desde `GINECOLOGIA/`, `SSR/`, `OBSTETRICIA/`, `NEONATOLOGIA/`
2. **Fallback:** Si no encuentra casos en la nueva estructura, carga desde `cases.json5`

## ✨ Ventajas de la nueva estructura

- ✅ **Más organizado:** Cada área y módulo en su propio archivo
- ✅ **Fácil mantenimiento:** Archivos más pequeños (~80-160 KB cada uno)
- ✅ **Trabajo en paralelo:** Diferentes personas pueden trabajar en diferentes módulos
- ✅ **Mejor control de versiones:** Git diff más claro al editar casos
- ✅ **Escalable:** Fácil agregar nuevas áreas y módulos

## 📋 Convenciones de nombres

### IDs de casos
- Formato: `{modulo}-{tema}-{numero}`
- Ejemplos:
  - `its-cervicitis-01`
  - `ac-baja-ae-adolescente`
  - `clim-terapia-th-contraindicada`

### Dificultad
- **Baja:** 5 pasos (casos introductorios)
- **Media:** 6 pasos (casos intermedios)
- **Alta:** 7 pasos (casos complejos)

### Módulos actuales
- `ITS` - Infecciones de Transmisión Sexual
- `Climaterio y Menopausia` - Endocrinología ginecológica
- `Anticoncepción` - Regulación de fertilidad
- `Consejería` - Consejería en salud integral

## 🆕 Agregar nuevos casos

1. Abre el archivo del módulo correspondiente
2. Agrega el nuevo caso al final del array
3. Asegúrate de que tenga todos los campos requeridos
4. Ejecuta `npm run seed:cases` para cargar en la BD

## 🔍 Validación de casos

Para validar la estructura de los casos:

```bash
node scripts/validate-cases.mjs
```
