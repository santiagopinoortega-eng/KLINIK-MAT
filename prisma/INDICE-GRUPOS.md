# 📋 Índice de Casos Clínicos por Grupos

## Resumen de Organización

Total de casos: **32**  
Archivos creados: **7 grupos**  
Casos por grupo: **5 casos** (excepto grupo 7 con 2 casos)

---

## 📁 Grupo 1: `casos-grupo-1.json5` (Casos 1-5)
**Módulos:** Anticoncepción (Alta) + ITS (Alta)

1. `ac-migrana-aura` — **Alta** — Anticoncepción / Migraña con aura
2. `its-cervicitis-sindromico` — **Alta** — ITS / Cervicitis mucopurulenta
3. `its-epi-ambulatorio` — **Alta** — ITS / EPI ambulatorio
4. `its-varon-25-consejeria-postexposicion` — **Alta** — ITS / PEP VIH postexposición
5. `its-sifilis-gestacional` — **Alta** — ITS / Sífilis en embarazo

---

## 📁 Grupo 2: `casos-grupo-2.json5` (Casos 6-10)
**Módulos:** Anticoncepción (Alta/Media) + ITS (Media) + Consejería (Alta)

6. `ac-inductores-enzimaticos` — **Alta** — Anticoncepción / Carbamazepina
7. `ac-diu-lng-efectos` — **Media** — Anticoncepción / DIU-LNG sangrado
8. `ac-lamotrigina-estradiol` — **Media** — Anticoncepción / Lamotrigina
9. `its-coinfeccion-gc-ct` — **Media** — ITS / Coinfección GC/CT
10. `its-anticoncepcion-transexual` — **Alta** — Consejería / Varón trans

---

## 📁 Grupo 3: `casos-grupo-3.json5` (Casos 11-15)
**Módulos:** ITS (Alta) + Anticoncepción (Alta/Media) + Consejería (Media)

11. `its-vaginitis-candidiasis-lngius` — **Alta** — ITS / Candidiasis con DIU-LNG
12. `ac-adolescente-implante` — **Media** — Anticoncepción / Quick Start implante
13. `ac-mayor35-fumadora-aco` — **Alta** — Anticoncepción / >35 fumadora
14. `consejeria-pareja-lesbiana-its` — **Media** — Consejería / Pareja lesbiana
15. `consejeria-adolescente-its` — **Media** — Consejería / Adolescente

---

## 📁 Grupo 4: `casos-grupo-4.json5` (Casos 16-20)
**Módulos:** Anticoncepción (Media) + Consejería (Alta/Media)

16. `ac-dmpa-amenorrea-peso` — **Media** — Anticoncepción / DMPA amenorrea
17. `cx-ae-ventana-fertil-consejeria` — **Media** — Consejería / AE ventana fértil
18. `ac-diu-cu-sin-hilos-aps` — **Media** — Anticoncepción / DIU sin hilos
19. `cx-post-ameu-larc-consejeria` — **Media** — Consejería / Post-AMEU
20. `cx-ae-amnesia-intoxicacion` — **Alta** — Consejería / AE y vulneración

---

## 📁 Grupo 5: `casos-grupo-5.json5` (Casos 21-25)
**Módulos:** Anticoncepción (Baja) + ITS (Baja) + Consejería (Baja)

21. `ac-metodo-inyectable-olvido` — **Baja** — Anticoncepción / Olvido inyectable
22. `its-flujo-vaginal-simple` — **Baja** — ITS / Vaginosis bacteriana
23. `its-ulcera-sifilis` — **Baja** — ITS / Chancro sifilítico
24. `its-candidiasis-vulvovaginal-simple` — **Baja** — ITS / Candidiasis
25. `cx-adolescente-primera-consejeria` — **Baja** — Consejería / Primera consulta

---

## 📁 Grupo 6: `casos-grupo-6.json5` (Casos 26-30)
**Módulos:** Consejería (Baja) + ITS (Baja) + Anticoncepción (Baja)

26. `cx-diversidad-trans-saludsexual` — **Baja** — Consejería / Mujer trans
27. `cx-climaterio-sexualidad` — **Baja** — Consejería / Climaterio sexualidad
28. `cx-climaterio-anticoncepcion` — **Baja** — Consejería / Climaterio AC
29. `its-adolescente-confidencialidad` — **Baja** — ITS / Confidencialidad
30. `ac-adolescente-inicio-mac` — **Baja** — Anticoncepción / Inicio MAC

---

## 📁 Grupo 7: `casos-grupo-7.json5` (Casos 31-32)
**Módulos:** PENDIENTE (revisar archivo original)

31. `caso-31-pendiente` — **Pendiente** — Por identificar
32. `caso-32-pendiente` — **Pendiente** — Por identificar

---

## ✅ Requisitos por Dificultad

| Dificultad | Preguntas MCQ | Feedback Adaptativo | Referencias |
|------------|--------------|---------------------|-------------|
| **Baja**   | 5 preguntas  | ✅ Obligatorio      | ✅ Mínimo 2 |
| **Media**  | 6 preguntas  | ✅ Obligatorio      | ✅ Mínimo 2 |
| **Alta**   | 7 preguntas  | ✅ Obligatorio      | ✅ Mínimo 2 |

---

## 🎯 Flujo de Trabajo Sugerido

1. **Toma un grupo** (ej. `casos-grupo-1.json5`)
2. **Completa los casos con tu IA especializada**:
   - Vignetas clínicas completas
   - Preguntas MCQ con 4 opciones (A-D)
   - Justificaciones educativas (`explicacion`)
   - FeedbackDinamico (bajo/medio/alto)
   - Referencias bibliográficas
3. **Valida con el script**:
   ```bash
   node scripts/validate-case-structure.mjs
   ```
4. **Repite con el siguiente grupo**
5. **Al terminar todos los grupos**, unifica en `cases.json`

---

**Última actualización:** Noviembre 2025  
**Estado:** Estructura lista para completar manualmente
