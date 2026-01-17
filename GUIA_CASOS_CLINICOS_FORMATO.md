# 📋 GUÍA COMPLETA: CÓMO CREAR CASOS CLÍNICOS EN KLINIK-MAT

## ✅ FORMATO EXACTO DEL ARCHIVO JSON

Tu archivo DEBE ser un **array** con estos campos EXACTOS:

```json
[
  {
    "id": "tema1-01-nombre-descriptivo-001",
    "titulo": "Título del Caso Clínico",
    "area": "Tema 1: Nombre del Área",
    "modulo": "1.1 Submódulo Específico",
    "dificultad": "1",
    
    "vignette": "Texto limpio de la viñeta clínica.\n\nMOTIVO: ...\n\nANAMNESIS: ...\n\nEXAMEN FÍSICO:\n• Item 1\n• Item 2",
    
    "pasos": [
      {
        "enunciado": "Pregunta 1?",
        "opciones": [
          {
            "texto": "Opción correcta",
            "esCorrecta": true,
            "explicacion": "Por qué es correcta..."
          },
          {
            "texto": "Opción incorrecta",
            "esCorrecta": false,
            "explicacion": "Por qué es incorrecta..."
          }
        ]
      }
    ],
    
    "objetivosAprendizaje": ["Objetivo 1", "Objetivo 2"],
    "competenciasEvaluadas": ["Competencia 1", "Competencia 2"],
    "referencias": ["Referencia 1", "Referencia 2"],
    "notasDocente": "Notas para el docente..."
  }
]
```

## 🚨 ERRORES COMUNES A EVITAR

### 1. ❌ ARCHIVO COMO OBJETO (INCORRECTO)
```json
{
  "id": "...",
  "titulo": "..."
}
```

### 2. ✅ ARCHIVO COMO ARRAY (CORRECTO)
```json
[
  {
    "id": "...",
    "titulo": "..."
  }
]
```

### 3. ❌ CAMPO `vignette` COMO OBJETO (INCORRECTO)
```json
"vignette": {
  "paciente": "...",
  "motivo": "..."
}
```

### 4. ✅ CAMPO `vignette` COMO STRING (CORRECTO)
```json
"vignette": "Paciente: M.J.P., 24 años...\n\nMOTIVO: Consulta por...\n\nEXAMEN: ..."
```

### 5. ❌ USAR `questions` (INCORRECTO)
```json
"questions": [...]
```

### 6. ✅ USAR `pasos` (CORRECTO)
```json
"pasos": [...]
```

### 7. ❌ USAR `options` (INCORRECTO)
```json
"options": [...]
```

### 8. ✅ USAR `opciones` (CORRECTO)
```json
"opciones": [...]
```

### 9. ❌ `dificultad` COMO NÚMERO (INCORRECTO)
```json
"dificultad": 1
```

### 10. ✅ `dificultad` COMO STRING (CORRECTO)
```json
"dificultad": "1"
```

### 11. ❌ KEYS SIN COMILLAS (INCORRECTO - JSON5)
```json
{
  id: "...",
  titulo: "..."
}
```

### 12. ✅ KEYS CON COMILLAS (CORRECTO - JSON)
```json
{
  "id": "...",
  "titulo": "..."
}
```

## 📂 ESTRUCTURA DE CARPETAS

```
prisma/cases/
├── TEMA1-EMBARAZO-PRENATAL/
│   ├── 01-control-normal/
│   │   └── cases.json  ← Aquí va tu archivo
│   ├── 02-patologia-embarazo/
│   ├── 03-diagnostico-prenatal/
│   └── 04-complicaciones/
├── TEMA2-PARTO-INTRAPARTO/
├── TEMA3-PUERPERIO-LACTANCIA/
├── TEMA4-GINECOLOGIA/
├── TEMA5-SALUD-SEXUAL/
└── TEMA6-NEONATOLOGIA/
```

## 🔄 CÓMO CARGAR TU CASO EN LA BASE DE DATOS

### Paso 1: Crear el archivo
Crea `cases.json` en la carpeta correspondiente con la estructura correcta

### Paso 2: Ejecutar el seed
```bash
CONFIRM_SEED_TO_PROD=1 npm run seed:cases
```

### Paso 3: Verificar que se cargó
Deberías ver:
```
📁 Tema: TEMA1-EMBARAZO-PRENATAL
   📚 Submódulo: 01-control-normal
      ✓ 1 casos cargados desde cases.json

✅ Importación finalizada.
   Creados: 1  (o Actualizados: 1)
```

## 📝 FORMATO DE LA VIÑETA CLÍNICA

### ❌ MAL (con markdown no procesado):
```
**Paciente:** M.J.P., 24 años
**Motivo:** Consulta por...
```

### ✅ BIEN (texto limpio con formato):
```
M.J.P., 24 años, primigesta, sin antecedentes mórbidos.

MOTIVO DE CONSULTA: Acude para confirmar embarazo.

ANAMNESIS: Relata FUR hace 8 semanas...

EXAMEN FÍSICO:
• PA: 110/70 mmHg
• Peso: 62 kg
• IMC: 24.2 kg/m²

EXÁMENES: Test de embarazo (+)

CONTEXTO: Vive con su pareja, red de apoyo presente.
```

## 🎯 CAMPOS OBLIGATORIOS

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| `id` | string | `"tema1-01-control-normal-001"` |
| `titulo` | string | `"Ingreso a Control Prenatal"` |
| `area` | string | `"Tema 1: Embarazo y Control Prenatal"` |
| `modulo` | string | `"1.1 Control Prenatal Normal"` |
| `dificultad` | string | `"1"` (opciones: "1", "2", "3") |
| `vignette` | string | Texto de la viñeta clínica |
| `pasos` | array | Array de preguntas |

## 🎯 CAMPOS OPCIONALES

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| `objetivosAprendizaje` | array | `["Objetivo 1", "Objetivo 2"]` |
| `competenciasEvaluadas` | array | `["Competencia 1"]` |
| `referencias` | array | `["Guía MINSAL 2015"]` |
| `notasDocente` | string | `"Enfatizar X concepto"` |

## 🔧 CAMBIOS REALIZADOS EN EL SISTEMA

### 1. Script `seed-cases.ts` modificado

Se agregaron las carpetas TEMA1-6 al array de áreas reconocidas:

```typescript
const areas = [
  'GINECOLOGIA', 'SSR', 'OBSTETRICIA', 'NEONATOLOGIA',
  'TEMA1-EMBARAZO-PRENATAL', 
  'TEMA2-PARTO-INTRAPARTO', 
  'TEMA3-PUERPERIO-LACTANCIA', 
  'TEMA4-GINECOLOGIA',
  'TEMA5-SALUD-SEXUAL', 
  'TEMA6-NEONATOLOGIA'
];
```

### 2. Procesamiento del campo `vignette`

El script ahora acepta `vignette` como:
- **String** (recomendado): Se usa directamente
- **Objeto** (legacy): Se convierte automáticamente a string

### 3. Generación automática de IDs

El script genera IDs únicos para:
- Preguntas (si no tienen `id`)
- Opciones (si no tienen `id`)

### 4. Conversión de dificultad

El campo `dificultad` se guarda como string:
- Entrada: `1`, `"1"`, `"baja"`, `"fácil"` → Salida: `"1"`
- Entrada: `2`, `"2"`, `"media"`, `"medio"` → Salida: `"2"`
- Entrada: `3`, `"3"`, `"alta"`, `"difícil"` → Salida: `"3"`

## 🌐 VER TU CASO EN LOCALHOST

1. **Ejecuta el seed** (arriba explicado)
2. **Inicia el servidor**:
   ```bash
   npm run dev
   ```
3. **Abre el navegador**: `http://localhost:3000`
4. **Ve a "Casos Clínicos"**
5. **Busca tu caso** en la lista

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: "No se encontraron casos"
✅ Verifica que el archivo esté en formato array: `[{...}]` no `{...}`

### Problema: "Invalid JSON"
✅ Usa comillas dobles en todas las keys: `"id"` no `id`
✅ No uses comentarios `//` en el archivo JSON

### Problema: "La viñeta se ve con asteriscos"
✅ No uses markdown (`**bold**`, `*italic*`)
✅ Usa texto plano con formato de saltos de línea `\n`

### Problema: "Argument id is missing"
✅ El script genera IDs automáticamente, no te preocupes

### Problema: "dificultad must be String"
✅ Usa `"dificultad": "1"` con comillas, no `"dificultad": 1`

## 📋 CHECKLIST ANTES DE GUARDAR

- [ ] Archivo es un array `[{...}]`
- [ ] Todas las keys tienen comillas dobles
- [ ] Campo `vignette` es un string, no un objeto
- [ ] Campo `pasos` (no `questions`)
- [ ] Campo `opciones` (no `options`)
- [ ] Campo `dificultad` es string: `"1"`, `"2"` o `"3"`
- [ ] Cada opción tiene `esCorrecta` (no `isCorrect`)
- [ ] Cada opción tiene `explicacion` (no `feedback`)
- [ ] Sin comentarios `//` en el JSON
- [ ] Viñeta usa texto limpio (sin markdown)

## ✨ EJEMPLO COMPLETO Y CORRECTO

Ver: `/home/shago22/proyectos/KLINIK-MAT/prisma/cases/TEMA1-EMBARAZO-PRENATAL/01-control-normal/cases.json`

Este archivo es tu plantilla de referencia.
