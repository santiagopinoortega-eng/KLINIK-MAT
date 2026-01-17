# 🏷️ Nomenclatura y Convenciones de IDs - Casos Clínicos KLINIK-MAT

**Versión:** 2.0  
**Fecha:** Enero 2026

---

## 📋 ESTRUCTURA DE IDs

### Formato General
```
[area]-[subarea]-[tema]-[numero]

Ejemplo: emb-cpn-calculo-eg-001
```

### Componentes

**1. Área (3-4 caracteres)**
```
emb  = Embarazo y Control Prenatal
par  = Parto y Atención Intraparto
pue  = Puerperio y Lactancia
gin  = Ginecología
sex  = Salud Sexual y Anticoncepción
neo  = Neonatología / Recién Nacido
```

**2. Subárea (3-4 caracteres)**
```
EMBARAZO Y CONTROL PRENATAL:
cpn  = Control Prenatal Normal
pat  = Patología del Embarazo
dpn  = Diagnóstico Prenatal
com  = Complicaciones Materno-Fetales

PARTO Y ATENCIÓN INTRAPARTO:
pnm  = Parto Normal y Mecánica
mfi  = Monitoreo Fetal Intraparto
pin  = Parto Instrumental
urg  = Urgencias Obstétricas Intraparto

PUERPERIO Y LACTANCIA:
pno  = Puerperio Normal
cmp  = Complicaciones del Puerperio
lac  = Lactancia Materna
crn  = Cuidados del RN

GINECOLOGÍA:
trm  = Trastornos Menstruales
inf  = Infecciones Genitales
mam  = Patología de Mamas
ova  = Patología Ovárica/Endometrial

SALUD SEXUAL Y ANTICONCEPCIÓN:
act  = Métodos Anticonceptivos
bar  = Métodos Barrera y Naturales
its  = Infecciones de Transmisión Sexual
pla  = Planificación Familiar

NEONATOLOGÍA:
ain  = Atención Inmediata del RN
pre  = Recién Nacido Prematuro
pat  = Patología Neonatal
cui  = Cuidados Neonatales
```

**3. Tema (descriptivo, kebab-case)**
- Usa palabras clave del caso
- Máximo 3-4 palabras
- Separadas por guiones
- Solo minúsculas

**4. Número (3 dígitos)**
- Siempre 3 dígitos con ceros a la izquierda
- Rango: 001-020 por subárea
- Distribuidos según dificultad:
  - 001-007: Baja (7 casos)
  - 008-015: Media (8 casos)
  - 016-020: Alta (5 casos)

---

## 📚 EJEMPLOS POR ÁREA

### Embarazo y Control Prenatal

```
emb-cpn-primera-consulta-001       (Baja)
emb-cpn-calculo-eg-002             (Baja)
emb-cpn-presion-arterial-003       (Baja)
emb-cpn-ganancia-peso-004          (Baja)
emb-cpn-cambios-fisiologicos-005   (Baja)
emb-cpn-solicitud-examenes-006     (Baja)
emb-cpn-calendario-controles-007   (Baja)
emb-cpn-interpretacion-labs-008    (Media)
emb-cpn-ecografia-segundo-trim-009 (Media)
...
emb-cpn-caso-complejo-016          (Alta)
```

```
emb-pat-preeclampsia-leve-001      (Baja)
emb-pat-preeclampsia-grave-002     (Baja)
emb-pat-diabetes-gestacional-003   (Baja)
emb-pat-itu-embarazo-004           (Baja)
emb-pat-vaginosis-005              (Baja)
emb-pat-anemia-ferropenica-006     (Baja)
emb-pat-hipotiroidismo-007         (Baja)
emb-pat-hellp-sindrome-008         (Media)
emb-pat-diabetes-complicada-009    (Media)
...
```

```
emb-dpn-eco-11-14-semanas-001      (Baja)
emb-dpn-screening-primer-trim-002  (Baja)
emb-dpn-medidas-fetales-003        (Baja)
emb-dpn-translucencia-nucal-004    (Baja)
...
```

```
emb-com-rciu-001                   (Baja)
emb-com-polihidramnios-002         (Baja)
emb-com-oligoamnios-003            (Baja)
emb-com-placenta-previa-004        (Baja)
...
```

### Parto y Atención Intraparto

```
par-pnm-trabajo-parto-fases-001    (Baja)
par-pnm-dilatacion-cervical-002    (Baja)
par-pnm-conduccion-oxitocina-003   (Baja)
par-pnm-curva-friedman-004         (Baja)
...
```

```
par-mfi-ctg-normal-001             (Baja)
par-mfi-taquicardia-fetal-002      (Baja)
par-mfi-bradicardia-fetal-003      (Baja)
par-mfi-deceleraciones-tardias-004 (Baja)
...
```

```
par-pin-forceps-indicaciones-001   (Baja)
par-pin-vacuum-aplicacion-002      (Baja)
par-pin-cesarea-urgencia-003       (Baja)
...
```

```
par-urg-prolapso-cordon-001        (Baja)
par-urg-embolia-amniotica-002      (Baja)
par-urg-distocia-hombro-003        (Baja)
par-urg-ruptura-uterina-004        (Baja)
...
```

### Puerperio y Lactancia

```
pue-pno-involucion-uterina-001     (Baja)
pue-pno-loquios-normal-002         (Baja)
pue-pno-recuperacion-postparto-003 (Baja)
...
```

```
pue-cmp-endometritis-001           (Baja)
pue-cmp-hemorragia-tardia-002      (Baja)
pue-cmp-tvp-postparto-003          (Baja)
pue-cmp-depresion-postparto-004    (Baja)
...
```

```
pue-lac-fisiologia-lactancia-001   (Baja)
pue-lac-tecnica-agarre-002         (Baja)
pue-lac-mastitis-003               (Baja)
pue-lac-grietas-pezon-004          (Baja)
...
```

```
pue-crn-cordon-umbilical-001       (Baja)
pue-crn-bano-rn-002                (Baja)
pue-crn-signos-alarma-003          (Baja)
pue-crn-screening-neonatal-004     (Baja)
...
```

### Ginecología

```
gin-trm-amenorrea-primaria-001     (Baja)
gin-trm-amenorrea-secundaria-002   (Baja)
gin-trm-menorragia-003             (Baja)
gin-trm-dismenorrea-004            (Baja)
...
```

```
gin-inf-vaginitis-candidiasica-001 (Baja)
gin-inf-vaginosis-bacteriana-002   (Baja)
gin-inf-eip-003                    (Baja)
gin-inf-hpv-004                    (Baja)
...
```

```
gin-mam-mastodinia-001             (Baja)
gin-mam-fibroadenoma-002           (Baja)
gin-mam-mastopatia-fibroquistica-003 (Baja)
...
```

```
gin-ova-sop-001                    (Baja)
gin-ova-endometriosis-002          (Baja)
gin-ova-quiste-ovarico-003         (Baja)
gin-ova-hiperplasia-endometrial-004 (Baja)
...
```

### Salud Sexual y Anticoncepción

```
sex-act-pildora-combinada-001      (Baja)
sex-act-diu-cobre-002              (Baja)
sex-act-diu-levonorgestrel-003     (Baja)
sex-act-implante-subdermico-004    (Baja)
...
```

```
sex-bar-preservativo-uso-001       (Baja)
sex-bar-diafragma-002              (Baja)
sex-bar-metodo-ogino-003           (Baja)
...
```

```
sex-its-gonorrea-001               (Baja)
sex-its-sifilis-002                (Baja)
sex-its-vih-003                    (Baja)
sex-its-herpes-genital-004         (Baja)
...
```

```
sex-pla-estudio-infertilidad-001   (Baja)
sex-pla-consejeria-reproductiva-002 (Baja)
sex-pla-fertilizacion-in-vitro-003 (Baja)
...
```

### Neonatología

```
neo-ain-apgar-evaluacion-001       (Baja)
neo-ain-reanimacion-neonatal-002   (Baja)
neo-ain-examen-fisico-rn-003       (Baja)
neo-ain-reflejos-primitivos-004    (Baja)
...
```

```
neo-pre-sdr-prematuro-001          (Baja)
neo-pre-edad-gestacional-002       (Baja)
neo-pre-nec-003                    (Baja)
neo-pre-rop-004                    (Baja)
...
```

```
neo-pat-ictericia-neonatal-001     (Baja)
neo-pat-hipoglucemia-002           (Baja)
neo-pat-sepsis-neonatal-003        (Baja)
neo-pat-cardiopatia-congenita-004  (Baja)
...
```

```
neo-cui-temperatura-rn-001         (Baja)
neo-cui-alimentacion-rn-002        (Baja)
neo-cui-cordon-umbilical-003       (Baja)
neo-cui-vacunacion-004             (Baja)
...
```

---

## 📝 REGLAS DE NOMENCLATURA

### DO (Hacer)

✅ **Usar solo minúsculas**
```
✓ emb-cpn-calculo-eg-001
✗ Emb-CPN-Calculo-EG-001
```

✅ **Separar con guiones**
```
✓ emb-pat-diabetes-gestacional-001
✗ emb_pat_diabetes_gestacional_001
✗ embPatDiabetesGestacional001
```

✅ **Ser descriptivo pero conciso**
```
✓ emb-pat-preeclampsia-grave-002
✗ emb-pat-px-pe-g-002 (muy abreviado)
✗ emb-pat-paciente-con-preeclampsia-grave-dos-002 (muy largo)
```

✅ **Usar números con ceros a la izquierda**
```
✓ 001, 002, ..., 020
✗ 1, 2, ..., 20
```

✅ **Mantener consistencia**
```
Si usas "rciu" en un caso, usa "rciu" en todos
No mezcles "rciu", "cir", "restriccion-crecimiento"
```

### DON'T (No hacer)

❌ **Mayúsculas o espacios**
```
✗ EMB-CPN-001
✗ emb cpn 001
```

❌ **Caracteres especiales**
```
✗ emb/cpn/001
✗ emb.cpn.001
✗ emb_cpn_001 (usar guiones, no guiones bajos)
```

❌ **IDs demasiado largos**
```
✗ emb-cpn-primera-consulta-control-prenatal-gestante-001
```

❌ **Números sin ceros**
```
✗ emb-cpn-001 hasta emb-cpn-20
✓ emb-cpn-001 hasta emb-cpn-020
```

---

## 🗂️ ORGANIZACIÓN EN CARPETAS

### Ruta completa
```
prisma/cases/[CATEGORIA]/[area-id]/[subarea-id]/[caso-id].json5
```

### Ejemplos
```
prisma/cases/OBSTETRICIA/01-embarazo-prenatal/01-control-normal/emb-cpn-primera-consulta-001.json5
prisma/cases/OBSTETRICIA/01-embarazo-prenatal/02-patologia-embarazo/emb-pat-preeclampsia-001.json5
prisma/cases/GINECOLOGIA/01-trastornos-menstruales/gin-trm-amenorrea-001.json5
prisma/cases/NEONATOLOGIA/01-atencion-inmediata/neo-ain-apgar-001.json5
```

---

## 📊 DISTRIBUCIÓN DE NÚMEROS POR DIFICULTAD

### Por cada subárea (20 casos)

```
BAJA (7 casos):
001, 002, 003, 004, 005, 006, 007

MEDIA (8 casos):
008, 009, 010, 011, 012, 013, 014, 015

ALTA (5 casos):
016, 017, 018, 019, 020
```

### Ejemplo completo: Control Prenatal Normal

```
Baja (001-007):
emb-cpn-primera-consulta-001
emb-cpn-calculo-eg-002
emb-cpn-presion-arterial-003
emb-cpn-ganancia-peso-004
emb-cpn-cambios-fisiologicos-005
emb-cpn-solicitud-examenes-006
emb-cpn-calendario-controles-007

Media (008-015):
emb-cpn-interpretacion-labs-008
emb-cpn-ecografia-morfologica-009
emb-cpn-screening-aneuploidias-010
emb-cpn-diabetes-screening-011
emb-cpn-peso-imc-complejo-012
emb-cpn-hallazgos-limitrofes-013
emb-cpn-derivacion-especialista-014
emb-cpn-manejo-integral-015

Alta (016-020):
emb-cpn-comorbilidades-multiples-016
emb-cpn-caso-atipico-017
emb-cpn-manejo-complejo-018
emb-cpn-complicacion-intercurrente-019
emb-cpn-integracion-multidisciplinar-020
```

---

## 🔍 VALIDACIÓN DE IDs

El script de validación verifica:
- ✅ Solo minúsculas, números y guiones
- ✅ Formato correcto de área-subarea-tema-numero
- ✅ Número con 3 dígitos
- ✅ No hay IDs duplicados en la subárea

```bash
npm run validate:case prisma/cases/.../caso.json5
```

---

## 💡 TIPS PRÁCTICOS

### Al crear IDs

1. **Consulta constantes:**
   ```typescript
   // Ver lib/constants/clinical-cases.ts
   CLINICAL_AREAS.EMBARAZO_PRENATAL.subareas.CONTROL_NORMAL.id
   ```

2. **Revisa casos existentes:**
   - Ver estructura de carpetas
   - Mantener consistencia con casos previos
   - Seguir patrones establecidos

3. **Usa prefijos claros:**
   - Prefiere claridad sobre brevedad
   - "preeclampsia" mejor que "pe"
   - "diabetes-gestacional" mejor que "dg"

4. **Documenta abreviaciones:**
   - Si usas abreviaciones, mantenlas consistentes
   - Documenta su significado
   - Ejemplo: "rciu" siempre para restricción crecimiento

---

## 📋 CHECKLIST

Antes de finalizar un ID:

- [ ] Usa solo minúsculas
- [ ] Separado por guiones (no espacios ni otros)
- [ ] Formato: area-subarea-tema-numero
- [ ] Número con 3 dígitos (001-020)
- [ ] Número corresponde a dificultad correcta
- [ ] Descriptivo y conciso
- [ ] Consistente con otros casos de la subárea
- [ ] Sin caracteres especiales
- [ ] Validado con script

---

**¡IDs claros y consistentes facilitan la organización y mantenimiento!** 🎯
