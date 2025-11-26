# 📚 Casos Clínicos de KLINIK-MAT

Esta carpeta contiene los casos clínicos organizados por **Área Clínica** y **Módulo**.

## 📁 Estructura de Archivos (Actualizada - Nov 2025)

```
cases/
├── GINECOLOGIA/              # Área 1: Ginecología y Salud de la Mujer (25 casos)
│   ├── ITS.json5            # 16 casos de ITS e Infectología
│   └── CLIMATERIO.json5     # 9 casos de Climaterio y Menopausia
│
├── SSR/                      # Área 2: Salud Sexual y Reproductiva (28 casos)
│   ├── ANTICONCEPCION.json5 # 19 casos de Anticoncepción
│   └── CONSEJERIA.json5     # 10 casos de Consejería
│
├── OBSTETRICIA/              # Área 3: Obstetricia y Puerperio (próximamente)
│   ├── EMBARAZO.json5       # Control prenatal, patología obstétrica
│   ├── PARTO.json5          # Trabajo de parto, atención del parto
│   └── PUERPERIO.json5      # Puerperio normal y patológico
│
└── NEONATOLOGIA/             # Área 4: Neonatología (próximamente)
    └── RN.json5             # Recién nacido sano y patológico

```

**Total actual: 53 casos** (54 al incluir 1 caso adicional)

---

## 📊 Distribución de Casos

| Área | Módulo | Casos | Alta | Media | Baja |
|------|--------|-------|------|-------|------|
| **GINECOLOGIA** | ITS | 16 | • | • | • |
| **GINECOLOGIA** | Climaterio | 9 | • | • | • |
| **SSR** | Anticoncepción | 19 | • | • | • |
| **SSR** | Consejería | 10 | • | • | • |
| **OBSTETRICIA** | Embarazo | 0 | - | - | - |
| **OBSTETRICIA** | Parto | 0 | - | - | - |
| **OBSTETRICIA** | Puerperio | 0 | - | - | - |
| **NEONATOLOGIA** | RN | 0 | - | - | - |

--- 📝 Formato de Casos

Cada archivo debe contener un array de casos con la siguiente estructura:

```json5
[
  {
    "id": "modulo-tema-numero",        // ej: "rn-ictericia-01"
    "modulo": "Recién Nacido",         // Nombre del módulo
    "dificultad": "Baja",              // "Baja" | "Media" | "Alta"
    "titulo": "Título descriptivo",
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
          // ... opciones C y D
        ]
      },
      // ... más pasos
    ],
    
    "feedback_dinamico": {
      "bajo": "Mensaje para 0-30% de respuestas correctas",
      "medio": "Mensaje para 31-60% de respuestas correctas",
      "alto": "Mensaje para 61-100% de respuestas correctas"
    },
    
    "referencias": [
      "MINSAL — Norma Técnica...",
      "OMS — Guía..."
    ]
  }
]
```

## 🔄 Carga de Casos

El script `npm run seed:cases` carga automáticamente:
1. Los casos del archivo principal `prisma/cases.json5` (legacy)
2. Todos los archivos `*.json5` de esta carpeta

```bash
npm run seed:cases
```

## 📊 Niveles de Dificultad

| Nivel | Pasos | Uso |
|-------|-------|-----|
| Baja  | 5     | Casos introductorios, conceptos básicos |
| Media | 6     | Casos intermedios, diagnóstico diferencial |
| Alta  | 7     | Casos complejos, manejo avanzado |

## ✅ Checklist para Nuevos Casos

- [ ] ID único y descriptivo
- [ ] Módulo claramente definido
- [ ] Dificultad apropiada (5/6/7 pasos)
- [ ] Viñeta clínica realista y completa
- [ ] 4 opciones por pregunta (A, B, C, D)
- [ ] Explicación de por qué cada opción es correcta/incorrecta
- [ ] Feedback adaptativo (bajo/medio/alto)
- [ ] Referencias bibliográficas (MINSAL, OMS, etc.)
