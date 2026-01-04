// lib/calculadoras/obstetricia.ts

export interface ResultadoCalculo {
  resultado: string | number;
  unidad: string;
  alertas: string[];
  preparacion?: string;
  interpretacion?: string;
}

export const calcularDosisObstetricas = {
  // 1. SULFATO DE MAGNESIO (Esquema Zuspan - Protocolo MINSAL)
  // Ampolla: 5g en 10ml (50%) o 1.25g en 5ml (25%)
  mgso4: (pesoPaciente: number, concentracionAmpolla: number): ResultadoCalculo => {
    // Protocolo MINSAL: Carga 4-5g EV en 20-30 min / Mantención 1-2g/hr
    const cargaGramos = 5; 
    const mantencionGramosPorHora = 1;
    
    // Si preparamos 20g en 500ml de SF (Esquema estándar Hospitalario)
    const concentracionTotal = 20 / 500; // 0.04 g/ml
    const goteoMantencion = mantencionGramosPorHora / concentracionTotal; // 25 ml/hr

    return {
      resultado: goteoMantencion,
      unidad: "ml/hr",
      preparacion: "Diluir 20g de MgSO4 en 500ml de Suero Fisiológico (SF 0.9%)",
      alertas: [
        "⚠️ Monitorear reflejos osteotendinosos (ROT) cada 1 hora",
        "⚠️ Diuresis debe ser > 30ml/hr (riesgo de toxicidad)",
        "⚠️ Frecuencia respiratoria > 12-14 rpm",
        "⚠️ Antídoto: Gluconato de Calcio 10% (1g EV lento)",
        "🔴 Suspender si: Ausencia de ROT, FR<12, diuresis<30ml/hr"
      ],
      interpretacion: `Dosis de carga: 5g EV en 20 minutos (200ml de la solución)\nDosis de mantención: ${goteoMantencion} ml/hr`
    };
  },

  // 2. OXITOCINA (Inducción/Conducción del Trabajo de Parto)
  // Ampolla: 5 UI en 1ml o 10 UI en 1ml
  oxitocina: (dosisMiliUnidadesMin: number): ResultadoCalculo => {
    // Dilución estándar MINSAL: 10 UI en 500ml SF
    const concentracion = 10 / 500; // 0.02 UI/ml o 20 mUI/ml
    const mlPorHora = (dosisMiliUnidadesMin * 60) / 20;

    let interpretacion = "";
    if (dosisMiliUnidadesMin < 4) {
      interpretacion = "Dosis inicial (inicio de inducción)";
    } else if (dosisMiliUnidadesMin <= 12) {
      interpretacion = "Dosis en rango terapéutico habitual";
    } else if (dosisMiliUnidadesMin <= 20) {
      interpretacion = "Dosis alta - Monitoreo estricto";
    } else {
      interpretacion = "⚠️ Dosis máxima alcanzada - No aumentar más";
    }

    return {
      resultado: mlPorHora,
      unidad: "ml/hr",
      preparacion: "Diluir 10 UI de Oxitocina en 500ml de SF 0.9%",
      alertas: [
        "⚠️ Riesgo de taquisistolia (>5 contracciones en 10 min)",
        "⚠️ Riesgo de hiperdinamia uterina (contracciones >100 seg)",
        "🔴 Monitoreo fetal continuo (NST) OBLIGATORIO",
        "📊 Aumentar 1-2 mUI/min cada 20-30 min según dinámica",
        "🛑 Suspender si: Alteraciones de FCF, hiperdinamia"
      ],
      interpretacion
    };
  },

  // 3. MISOPROSTOL (Maduración cervical e inducción)
  // Comprimidos: 200 mcg (uso off-label en obstetricia)
  misoprostol: (via: "vaginal" | "sublingual", dosis: number): ResultadoCalculo => {
    const maxDosisVaginal = 25; // mcg
    const maxDosisSublingual = 50; // mcg
    const intervaloVaginal = 4; // horas
    const intervaloSublingual = 4; // horas

    let alertas: string[] = [];
    let interpretacion = "";

    if (via === "vaginal") {
      alertas = [
        "⚠️ Contraindicado en cesárea previa (riesgo de rotura uterina)",
        "⚠️ Dosis máxima: 25 mcg cada 4-6 horas",
        "🔴 Suspender si hay dinámica uterina regular",
        "📊 Máximo 4-6 dosis en 24 horas",
        "🛑 No usar con oxitocina simultánea"
      ];
      interpretacion = dosis <= maxDosisVaginal 
        ? `Dosis segura para vía vaginal (${dosis} mcg cada ${intervaloVaginal}hrs)`
        : `⚠️ Dosis excesiva - Reducir a máximo ${maxDosisVaginal} mcg`;
    } else {
      alertas = [
        "⚠️ Vía sublingual tiene absorción más rápida",
        "⚠️ Mayor riesgo de efectos adversos (fiebre, escalofríos)",
        "🔴 Monitoreo fetal y dinámica cada 30 min",
        "📊 Alternativa cuando vía vaginal contraindicada",
        "🛑 No exceder 50 mcg por dosis"
      ];
      interpretacion = dosis <= maxDosisSublingual
        ? `Dosis segura para vía sublingual (${dosis} mcg cada ${intervaloSublingual}hrs)`
        : `⚠️ Dosis excesiva - Reducir a máximo ${maxDosisSublingual} mcg`;
    }

    return {
      resultado: dosis,
      unidad: "mcg",
      preparacion: `Administrar ${dosis} mcg vía ${via} cada ${via === "vaginal" ? intervaloVaginal : intervaloSublingual} horas`,
      alertas,
      interpretacion
    };
  },

  // 4. DOSIS DE ANTIBIÓTICOS PROFILÁCTICOS (Cesárea)
  // Según protocolo MINSAL
  profilaxisQuirurgica: (antibiotico: "cefazolina" | "clindamicina" | "gentamicina", pesoPaciente: number): ResultadoCalculo => {
    let dosis = 0;
    let alertas: string[] = [];
    let preparacion = "";

    switch (antibiotico) {
      case "cefazolina":
        dosis = pesoPaciente < 80 ? 2 : 3; // gramos
        preparacion = `${dosis}g EV en bolo lento (3-5 min), 30-60 min antes de incisión`;
        alertas = [
          "✅ Primera elección en profilaxis de cesárea",
          "⏱️ Administrar idealmente 30-60 min pre-incisión",
          "🔄 Redosificar si cirugía >4 horas o sangrado >1500ml",
          "⚠️ Contraindicada en alergia a betalactámicos"
        ];
        break;
      
      case "clindamicina":
        dosis = 900; // mg
        preparacion = "900mg EV en 20-30 min";
        alertas = [
          "🔄 Alternativa en alergia a penicilinas",
          "⚠️ Asociar con Gentamicina para cobertura gram negativo",
          "⏱️ Infusión más lenta (20-30 min)",
          "🔴 Riesgo de colitis pseudomembranosa"
        ];
        break;
      
      case "gentamicina":
        dosis = 240; // mg (5mg/kg, aprox 240mg para 48kg promedio)
        const dosisPorKg = Math.round(pesoPaciente * 5);
        dosis = dosisPorKg;
        preparacion = `${dosis}mg (5mg/kg) EV en 30 min`;
        alertas = [
          "⚠️ Uso en combinación con Clindamicina",
          "🔴 Monitoreo de función renal",
          "⚠️ Ototoxicidad y nefrotoxicidad potencial",
          "📊 Dosis única prequirúrgica"
        ];
        break;
    }

    return {
      resultado: dosis,
      unidad: antibiotico === "gentamicina" ? "mg" : "g",
      preparacion,
      alertas,
      interpretacion: `Profilaxis antibiótica estándar para cesárea (${antibiotico})`
    };
  },

  // 5. EDAD GESTACIONAL POR FECHA DE ÚLTIMA MENSTRUACIÓN (FUM)
  edadGestacional: (fechaUltimaMenstruacion: Date): ResultadoCalculo => {
    const hoy = new Date();
    const diferenciaDias = Math.floor((hoy.getTime() - fechaUltimaMenstruacion.getTime()) / (1000 * 60 * 60 * 24));
    const semanas = Math.floor(diferenciaDias / 7);
    const dias = diferenciaDias % 7;

    // Fecha probable de parto (FPP): FUM + 280 días (40 semanas)
    const fpp = new Date(fechaUltimaMenstruacion);
    fpp.setDate(fpp.getDate() + 280);

    let interpretacion = "";
    if (semanas < 20) {
      interpretacion = "Primer/Segundo trimestre - Confirmar con ecografía precoz";
    } else if (semanas < 37) {
      interpretacion = "Embarazo pretérmino";
    } else if (semanas <= 41) {
      interpretacion = "Embarazo de término";
    } else {
      interpretacion = "⚠️ Embarazo prolongado - Considerar inducción";
    }

    return {
      resultado: `${semanas} semanas y ${dias} días`,
      unidad: "",
      preparacion: `Fecha Probable de Parto (FPP): ${fpp.toLocaleDateString('es-CL')}`,
      alertas: [
        "📅 Cálculo basado en ciclos regulares de 28 días",
        "⚠️ Debe confirmarse con ecografía del primer trimestre",
        "📊 Variabilidad de ±7 días es normal",
        "🔴 Si discrepancia >7 días con eco, ajustar por ecografía"
      ],
      interpretacion
    };
  },

  // 6. ÍNDICE DE MASA CORPORAL (IMC) EN EMBARAZO
  imcEmbarazo: (pesoKg: number, tallaMetros: number): ResultadoCalculo => {
    const imc = pesoKg / (tallaMetros * tallaMetros);
    let categoria = "";
    let gananciaPesoRecomendada = "";
    let alertas: string[] = [];

    if (imc < 18.5) {
      categoria = "Bajo peso";
      gananciaPesoRecomendada = "12.5 - 18 kg";
      alertas = [
        "⚠️ Riesgo de recién nacido bajo peso",
        "📊 Requiere suplementación nutricional",
        "🔄 Control nutricional mensual"
      ];
    } else if (imc < 25) {
      categoria = "Normal";
      gananciaPesoRecomendada = "11.5 - 16 kg";
      alertas = [
        "✅ Rango de peso saludable",
        "📊 Mantener alimentación balanceada",
        "🔄 Control estándar"
      ];
    } else if (imc < 30) {
      categoria = "Sobrepeso";
      gananciaPesoRecomendada = "7 - 11.5 kg";
      alertas = [
        "⚠️ Mayor riesgo de diabetes gestacional",
        "⚠️ Mayor riesgo de hipertensión",
        "📊 Control nutricional estricto",
        "🔄 Tamizaje temprano de diabetes"
      ];
    } else {
      categoria = "Obesidad";
      gananciaPesoRecomendada = "5 - 9 kg";
      alertas = [
        "🔴 Alto riesgo de complicaciones",
        "⚠️ Diabetes gestacional, preeclampsia, macrosomía",
        "📊 Derivar a alto riesgo obstétrico",
        "🔄 Control conjunto con nutricionista"
      ];
    }

    return {
      resultado: imc.toFixed(1),
      unidad: "kg/m²",
      preparacion: `Categoría: ${categoria}`,
      alertas,
      interpretacion: `Ganancia de peso recomendada durante el embarazo: ${gananciaPesoRecomendada}`
    };
  }
};

// Utilidad adicional: Convertir gotas/min a ml/hr
export const convertirGotasAMililitros = (gotasPorMinuto: number): number => {
  // 1 ml = 20 gotas (estándar macrogotero)
  // 1 ml = 60 microgotas (microgotero)
  const mlPorHora = (gotasPorMinuto * 60) / 20;
  return Math.round(mlPorHora);
};

// Utilidad: Calcular goteo en gotas/min desde ml/hr
export const calcularGoteo = (mililitrosPorHora: number, tipoGotero: "macro" | "micro" = "macro"): number => {
  const gotasPorMl = tipoGotero === "macro" ? 20 : 60;
  const gotasPorMin = (mililitrosPorHora * gotasPorMl) / 60;
  return Math.round(gotasPorMin);
};
