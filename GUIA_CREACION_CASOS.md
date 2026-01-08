# 📚 Guía Completa para Crear 300+ Casos Clínicos de Obstetricia

## 🎯 Resumen Ejecutivo

**Meta:** 300+ casos clínicos de obstetricia para estudiantes chilenos
**Formato:** JSON5 (permite comentarios y sintaxis más flexible)
**Ubicación:** `prisma/cases/OBSTETRICIA/`
**Dificultad:** 3 niveles (1=Baja, 2=Media, 3=Alta)

---

## 📋 Estructura Actual

```
prisma/cases/
├── OBSTETRICIA/          # 👈 AQUÍ CREAR TUS CASOS
│   ├── embarazo/
│   ├── trabajo-parto/
│   ├── hemorragias/
│   ├── hipertension/
│   └── emergencias/
├── GINECOLOGIA/
├── NEONATOLOGIA/
└── hpp-atonia-v2.json5   # 👈 CASO MODELO (revisar como ejemplo)
```

---

## ✅ Mejores Prácticas (Elite Engineering)

### 1. **Organización por Carpetas**

```bash
OBSTETRICIA/
├── 01-control-prenatal/
│   ├── cpn-primer-trimestre-001.json5
│   ├── cpn-diabetes-gestacional-002.json5
│   └── cpn-ecografia-genetica-003.json5
│
├── 02-hemorragias/
│   ├── hpp-atonia-001.json5          # ✅ Ya existe
│   ├── hpp-desgarros-002.json5
│   ├── dppni-003.json5               # Desprendimiento placentario
│   └── placenta-previa-004.json5
│
├── 03-hipertension/
│   ├── preeclampsia-grave-001.json5
│   ├── eclampsia-002.json5
│   └── hellp-syndrome-003.json5
│
├── 04-trabajo-parto/
│   ├── distocia-hombros-001.json5
│   ├── cesarea-emergencia-002.json5
│   └── parto-pretermino-003.json5
│
└── 05-emergencias/
    ├── sepsis-obstetrica-001.json5
    ├── embolia-liquido-amniotico-002.json5
    └── ruptura-uterina-003.json5
```

**Ventajas:**
- ✅ Fácil navegación
- ✅ Escalable a 300+ casos
- ✅ Fácil encontrar casos similares
- ✅ Git diffs más claros

---

## 📝 Plantilla de Caso (Copiá y Pegá)

### **Opción 1: Caso Simple (6 MCQ - Dificultad Baja)**

```json5
{
  // ===== METADATOS =====
  id: "control-prenatal-primera-consulta-001",  // ⚠️ ÚNICO, sin espacios
  version: 1,                                    // Versionado para actualizaciones
  
  // Clasificación académica
  areaPrincipal: "Control prenatal",             // Área general
  modulo: "Primer trimestre",                    // Submódulo específico
  dificultad: 1,                                 // 1=Baja, 2=Media, 3=Alta
  titulo: "Primera consulta prenatal: evaluación de riesgo obstétrico",
  
  // Objetivos de aprendizaje (3-4 objetivos SMART)
  objetivosAprendizaje: [
    "Calcular edad gestacional por fecha de última menstruación",
    "Identificar factores de riesgo obstétrico en anamnesis",
    "Solicitar exámenes de laboratorio según protocolo MINSAL",
    "Determinar necesidad de derivación a alto riesgo obstétrico"
  ],
  
  // ===== VIGNETA CLÍNICA =====
  vigneta: "Mujer de 28 años, G2P1, acude a consulta prenatal. FUM: hace 8 semanas. Embarazo espontáneo. Antecedente de cesárea hace 3 años por presentación podálica. No comorbilidades. Última PAP hace 2 años: negativo. No fuma, no consume alcohol.",
  
  // ===== PREGUNTAS =====
  preguntas: [
    {
      id: "q1",
      orden: 1,
      tipo: "mcq",
      enunciado: "Según FUM, ¿cuál es la edad gestacional actual de la paciente?",
      
      opciones: [
        {
          id: "a",
          texto: "6 semanas",
          esCorrecta: false,
          explicacion: "Incorrecto. 8 semanas desde FUM corresponde a 8 semanas de gestación por regla de Nagele."
        },
        {
          id: "b",
          texto: "8 semanas",
          esCorrecta: true,
          explicacion: "✅ Correcto. Edad gestacional = tiempo desde FUM. FUM hace 8 semanas = 8 semanas de gestación."
        },
        {
          id: "c",
          texto: "10 semanas",
          esCorrecta: false,
          explicacion: "Incorrecto. No se suman 2 semanas extra al cálculo por FUM."
        },
        {
          id: "d",
          texto: "12 semanas",
          esCorrecta: false,
          explicacion: "Incorrecto. 12 semanas marcaría el fin del primer trimestre, pero estamos en semana 8."
        }
      ],
      
      feedbackDocente: "Este caso evalúa cálculo básico de edad gestacional por FUM (Regla de Nagele). Recordar: EG = días desde FUM / 7."
    },
    
    {
      id: "q2",
      orden: 2,
      tipo: "mcq",
      enunciado: "¿Qué factor de riesgo obstétrico tiene esta paciente?",
      
      opciones: [
        {
          id: "a",
          texto: "Edad materna avanzada (>35 años)",
          esCorrecta: false,
          explicacion: "Incorrecto. Paciente tiene 28 años, bajo riesgo por edad."
        },
        {
          id: "b",
          texto: "Antecedente de cesárea previa",
          esCorrecta: true,
          explicacion: "✅ Correcto. Cesárea previa es factor de riesgo para: ruptura uterina (0.5-1%), placenta acreta, dehiscencia de cicatriz."
        },
        {
          id: "c",
          texto: "Multiparidad (4 o más partos)",
          esCorrecta: false,
          explicacion: "Incorrecto. Paciente es G2P1 (no multípara). Multiparidad se define como ≥4 partos."
        },
        {
          id: "d",
          texto: "Ninguno, es embarazo de bajo riesgo",
          esCorrecta: false,
          explicacion: "Incorrecto. El antecedente de cesárea previa eleva el riesgo y requiere seguimiento especial."
        }
      ],
      
      feedbackDocente: "Identificar factores de riesgo es esencial para estratificar embarazo. Cesárea previa requiere vigilancia de cicatriz uterina en tercer trimestre."
    },
    
    {
      id: "q3",
      orden: 3,
      tipo: "mcq",
      enunciado: "Según protocolo MINSAL, ¿qué exámenes debe solicitar en esta primera consulta?",
      
      opciones: [
        {
          id: "a",
          texto: "Hemograma, glicemia, VDRL, VIH, grupo-Rh, urocultivo",
          esCorrecta: true,
          explicacion: "✅ Correcto. Batería básica MINSAL para primera consulta prenatal. Detecta anemia, diabetes gestacional, ITS, incompatibilidad Rh, ITU asintomática."
        },
        {
          id: "b",
          texto: "Solo hemograma y ecografía",
          esCorrecta: false,
          explicacion: "Incorrecto. Faltan exámenes críticos: VDRL (sífilis), VIH, grupo-Rh (incompatibilidad), urocultivo (bacteriuria asintomática 2-10%)."
        },
        {
          id: "c",
          texto: "Perfil tiroideo, eco doppler, amniocentesis",
          esCorrecta: false,
          explicacion: "Incorrecto. Estos no son de rutina. Tiroides solo si sospecha clínica. Doppler/amniocentesis son para alto riesgo."
        },
        {
          id: "d",
          texto: "Ninguno, esperar segundo trimestre",
          esCorrecta: false,
          explicacion: "Incorrecto. Primera consulta requiere screening basal urgente (anemia, ITS, Rh). No se debe postergar."
        }
      ],
      
      feedbackDocente: "Protocolo MINSAL: 6 exámenes básicos en primera consulta. Urocultivo detecta bacteriuria asintomática (2-10% embarazadas) que puede causar parto prematuro."
    },
    
    // ... agregar 3 preguntas más para completar 6 MCQ
  ],
  
  // ===== RECURSOS PEDAGÓGICOS =====
  normasMinsal: [
    {
      nombre: "Guía Perinatal MINSAL 2015",
      codigo: "MINSAL-PERINATAL-2015"
    }
  ],
  
  palabrasClave: ["control prenatal", "edad gestacional", "cesárea previa", "primer trimestre"],
  
  // ===== METADATOS TÉCNICOS =====
  esPublico: true,
  fechaCreacion: "2026-01-08",
  autor: "Equipo KLINIK-MAT"
}
```

---

### **Opción 2: Caso Complejo (7 MCQ + 1 SHORT - Dificultad Alta)**

```json5
{
  id: "emergencias-preeclampsia-grave-001",
  version: 1,
  areaPrincipal: "Urgencias obstétricas",
  modulo: "Hipertensión gestacional",
  dificultad: 3,  // ⚠️ Alta complejidad
  titulo: "Preeclampsia grave: manejo en servicio de urgencia",
  
  vigneta: "Mujer de 35 años, G1P0, 34 semanas, acude a urgencia por cefalea intensa y epigastralgia de 6 horas. TA 165/110 mmHg. Refiere visión borrosa y edema facial. Proteinuria: +++. Último control prenatal hace 2 semanas: TA 130/80.",
  
  preguntas: [
    // ... 7 MCQ complejas (manejo agudo, criterios severidad, laboratorio, etc.)
    
    // Pregunta 8: SHORT (respuesta abierta)
    {
      id: "q8",
      orden: 8,
      tipo: "short",
      enunciado: "Describa los 3 criterios de severidad de preeclampsia que cumple esta paciente y justifique la urgencia de hospitalización.",
      
      // Para evaluación automática con IA (Gemini)
      puntosMaximos: 15,
      criteriosEvaluacion: [
        "TA ≥160/110 mmHg",
        "cefalea persistente",
        "epigastralgia o dolor cuadrante superior",
        "alteraciones visuales",
        "proteinuria masiva",
        "riesgo eclampsia",
        "necesidad sulfato magnesio",
        "monitoreo fetal urgente"
      ],
      
      guia: "Evalúa: identificación correcta de 3 criterios de severidad, menciona riesgo de eclampsia/HELLP, justifica hospitalización con monitoreo materno-fetal."
    }
  ],
  
  objetivosAprendizaje: [
    "Reconocer criterios de preeclampsia con criterios de severidad",
    "Indicar manejo agudo con sulfato de magnesio",
    "Evaluar necesidad de terminación de embarazo",
    "Interpretar laboratorio de síndrome HELLP"
  ]
}
```

---

## 🚀 Flujo de Trabajo Recomendado

### **Paso 1: Planificación (1-2 días)**

1. **Mapea las 300 áreas:**
   ```
   Control prenatal:      50 casos
   Hemorragias:          40 casos
   Hipertensión:         35 casos
   Trabajo de parto:     45 casos
   Parto pretérmino:     30 casos
   Emergencias:          40 casos
   Infecciones:          25 casos
   Diabetes gestacional: 20 casos
   Otros:               15 casos
   ──────────────────────────────
   TOTAL:               300 casos
   ```

2. **Define dificultad:**
   - **Baja (100 casos):** 6 MCQ simples (diagnóstico básico)
   - **Media (120 casos):** 6 MCQ + 1 SHORT (razonamiento)
   - **Alta (80 casos):** 7 MCQ + 1 SHORT (casos complejos)

### **Paso 2: Creación de Casos (2-4 semanas)**

**Método Eficiente:**

```bash
# 1. Crear estructura de carpetas
mkdir -p prisma/cases/OBSTETRICIA/{01-control-prenatal,02-hemorragias,03-hipertension,04-trabajo-parto,05-emergencias}

# 2. Copiar plantilla
cp prisma/cases/hpp-atonia-v2.json5 prisma/cases/OBSTETRICIA/01-control-prenatal/cpn-001.json5

# 3. Editar caso (usar tu editor favorito)
code prisma/cases/OBSTETRICIA/01-control-prenatal/cpn-001.json5
```

**Tips de Productividad:**

- ✅ **Batch similar:** Crea 5-10 casos del mismo módulo juntos
- ✅ **Reutiliza estructura:** Copiar caso similar y modificar
- ✅ **IA para preguntas:** Usa ChatGPT/Claude para generar opciones
- ✅ **Revisa médicamente:** Valida con guías MINSAL actualizadas

### **Paso 3: Validación (5 minutos por caso)**

Ejecuta el script de validación:

```bash
npm run validate-cases
```

Esto verifica:
- ✅ ID único
- ✅ Estructura JSON válida
- ✅ Número de preguntas según dificultad
- ✅ Todas las preguntas tienen 4 opciones
- ✅ Solo 1 respuesta correcta por pregunta

### **Paso 4: Carga a Base de Datos**

```bash
# Opción 1: Cargar TODO (⚠️ borra casos existentes)
npm run seed:cases

# Opción 2: Cargar solo casos nuevos (recomendado)
npm run seed:cases:incremental

# Opción 3: Cargar carpeta específica
npm run seed:cases -- --folder=OBSTETRICIA/01-control-prenatal
```

### **Paso 5: Verificación en Producción**

```bash
# Iniciar servidor
npm run dev

# Probar endpoint
curl http://localhost:3000/api/cases | jq '.pagination.total'
# Debería mostrar: 300+
```

---

## 📊 Esquema de Base de Datos (Ya Configurado ✅)

Tu schema Prisma ya está listo:

```prisma
model Case {
  id         String   @id                    // ✅ Tu ID único
  title      String                          // ✅ Título del caso
  area       String                          // ✅ Área principal
  modulo     String?                         // ✅ Submódulo
  difficulty Int                             // ✅ 1, 2, 3
  vignette   String?  @db.Text              // ✅ Viñeta clínica
  isPublic   Boolean  @default(false)        // ✅ Público por defecto
  
  questions  Question[]                      // ✅ Relación con preguntas
  norms      MinsalNorm[] @relation("CaseNorms")  // ✅ Normas asociadas
}

model Question {
  id              String  @id
  order           Int                         // ✅ Orden (1-8)
  tipo            String  @default("mcq")     // ✅ "mcq" o "short"
  enunciado       String  @db.Text           // ✅ Texto pregunta
  caseId          String
  
  // Para SHORT answer
  puntosMaximos   Int?    @default(0)
  criteriosEval   String[] @default([])
  guia            String? @db.Text
  
  options         Option[]                    // ✅ Relación con opciones
  case            Case    @relation(...)
}

model Option {
  id          String   @id
  text        String   @db.Text              // ✅ Texto opción
  isCorrect   Boolean  @default(false)       // ✅ Correcta o no
  explicacion String?  @db.Text              // ✅ Explicación
  order       Int      @default(0)           // ✅ Orden (a,b,c,d)
  questionId  String
  question    Question @relation(...)
}
```

---

## 🎨 Convenciones de Nombrado

### **IDs de Casos:**

```
Formato: [area]-[modulo]-[tema]-[numero]
Ejemplo: control-prenatal-diabetes-gestacional-001

❌ MAL:  "Caso 1", "caso_diabetes", "DG-001"
✅ BIEN: "control-prenatal-diabetes-gestacional-001"
```

### **IDs de Preguntas:**

```
Formato: q[numero]
Ejemplo: q1, q2, q3, ..., q8

❌ MAL:  "pregunta-1", "question_one"
✅ BIEN: "q1", "q2", "q3"
```

### **IDs de Opciones:**

```
Formato: [letra]
Ejemplo: a, b, c, d

❌ MAL:  "opcion-a", "opt_1"
✅ BIEN: "a", "b", "c", "d"
```

---

## 🔥 Scripts de Automatización

### **1. Validar casos antes de subir**

```bash
node scripts/validate-cases.js
```

### **2. Generar reporte de casos**

```bash
node scripts/case-stats.js
# Output:
# ✅ 300 casos totales
# ✅ 100 casos baja dificultad
# ✅ 120 casos media dificultad
# ✅ 80 casos alta dificultad
# ✅ 2,400 preguntas MCQ
# ✅ 200 preguntas SHORT
```

### **3. Exportar casos a Excel (para revisión médica)**

```bash
node scripts/export-cases-excel.js
# Genera: casos-obstetricia-revision.xlsx
```

---

## ⚡ Tips Pro

### **1. Usa Snippets de VSCode**

Crea snippet para caso nuevo:

```json
// .vscode/snippets.code-snippets
{
  "Caso Clínico": {
    "prefix": "caso-base",
    "body": [
      "{",
      "  id: \"${1:area}-${2:modulo}-${3:tema}-001\",",
      "  version: 1,",
      "  areaPrincipal: \"${4:Control prenatal}\",",
      "  modulo: \"${5:Primer trimestre}\",",
      "  dificultad: ${6|1,2,3|},",
      "  titulo: \"${7:Título del caso}\",",
      "  vigneta: \"${8:Viñeta clínica...}\",",
      "  preguntas: [$0]",
      "}"
    ]
  }
}
```

Luego escribe `caso-base` + Tab = plantilla lista ⚡

### **2. Git Workflow**

```bash
# Crear branch por módulo
git checkout -b feature/casos-hemorragias

# Hacer commits frecuentes
git add prisma/cases/OBSTETRICIA/02-hemorragias/
git commit -m "feat: Add 10 casos hemorragias postparto"

# Push al remoto
git push origin feature/casos-hemorragias
```

### **3. Control de Calidad**

```bash
# Ejecutar tests cada 10 casos
npm run test:cases

# Revisar en navegador
npm run dev
# Navegar a: http://localhost:3000/casos
```

---

## 📚 Recursos Externos

### **Guías Clínicas:**
- [Guía Perinatal MINSAL 2015](https://www.minsal.cl)
- [ACOG Practice Bulletins](https://www.acog.org)
- [Protocolos SEGO](https://sego.es)

### **Banco de Preguntas:**
- EUNACOM (exámenes chilenos)
- ENARM (México)
- MIR (España)

---

## 🚨 Errores Comunes y Soluciones

### **Error 1: ID duplicado**

```bash
Error: Duplicate case ID: control-prenatal-diabetes-001
```

**Solución:** Verifica IDs únicos con:

```bash
grep -r "id:" prisma/cases/OBSTETRICIA/ | sort | uniq -d
```

### **Error 2: JSON inválido**

```bash
Error: Unexpected token } in caso-001.json5
```

**Solución:** Valida JSON5 con:

```bash
node -e "require('json5').parse(require('fs').readFileSync('caso-001.json5', 'utf8'))"
```

### **Error 3: Pregunta sin respuesta correcta**

```bash
Error: Question q3 has no correct answer
```

**Solución:** Asegura que exactamente 1 opción tiene `esCorrecta: true`

---

## ✅ Checklist de Calidad por Caso

- [ ] ID único y descriptivo
- [ ] Viñeta clínica realista (150-300 palabras)
- [ ] 3-4 objetivos de aprendizaje SMART
- [ ] Número correcto de preguntas (según dificultad)
- [ ] Todas las opciones tienen explicación
- [ ] Feedback docente presente
- [ ] Normas MINSAL citadas (si aplica)
- [ ] Palabras clave relevantes
- [ ] Revisado médicamente
- [ ] Testeado en plataforma

---

## 🎯 Meta Final

```
┌─────────────────────────────────────┐
│  🏁 300+ CASOS CLÍNICOS             │
│  📚 2,500+ preguntas                │
│  ⏱️ 4-6 semanas de desarrollo        │
│  🎓 Listos para estudiantes chilenos│
└─────────────────────────────────────┘
```

---

## 🤝 Siguientes Pasos

1. **HOY:** Crear 5 casos de prueba en `OBSTETRICIA/01-control-prenatal/`
2. **Esta semana:** Completar módulo de hemorragias (40 casos)
3. **Próximas 3 semanas:** 85-100 casos por semana
4. **Revisión final:** Control de calidad médica

---

**¿Dudas?** Lee el caso ejemplo completo: `prisma/cases/hpp-atonia-v2.json5`

**¿Problemas técnicos?** Revisa los logs del seed: `npm run seed:cases 2>&1 | tee seed.log`

**¡Éxito con los 300 casos! 🚀**
