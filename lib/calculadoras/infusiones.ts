/**
 * Calculadora de infusiones para medicamentos
 * Realiza cálculos matemáticos reales basados en parámetros del usuario
 * 
 * Basado en fórmulas estándar de enfermería y farmacología clínica
 */

export interface ParametrosInfusion {
  // Medicamento
  dosisDeseada: number;           // Ej: 10 mg, 500 mcg, etc.
  unidadDosis: 'mg' | 'mcg' | 'g' | 'UI' | 'mEq';
  
  // Presentación del medicamento
  concentracionAmpolla: number;   // Ej: 500 mg en una ampolla
  unidadConcentracion: 'mg' | 'mcg' | 'g' | 'UI' | 'mEq';
  volumenAmpolla: number;         // Ej: 10 ml
  
  // Dilución (opcional)
  volumenDilucion?: number;       // Ej: diluir en 100 ml de SF
  
  // Velocidad de infusión
  tipoVelocidad: 'boloUnico' | 'infusionContinua' | 'dosisPorPeso';
  
  // Para infusión continua
  duracionInfusion?: number;      // En minutos
  
  // Para dosis por peso
  pesoKg?: number;
  dosisPorKg?: number;            // Ej: 0.5 mg/kg
}

export interface ResultadoInfusion {
  // Dosis calculada
  dosisTotal: string;
  
  // Volumen a administrar
  volumenAdministrar: string;
  
  // Velocidad de infusión
  velocidadMlHora?: string;
  velocidadMlMin?: string;
  velocidadGotasMin?: string;     // Usando factor 20 gotas/ml
  velocidadMicroGotasMin?: string; // Usando factor 60 microgotas/ml
  
  // Tiempo de administración
  tiempoAdministracion?: string;
  
  // Concentración final
  concentracionFinal?: string;
  
  // Detalles del cálculo
  explicacion: string[];
  
  // Alertas de seguridad
  alertas?: string[];
}

/**
 * Convierte unidades a mg para estandarizar cálculos
 */
function convertirAMg(valor: number, unidad: string): number {
  switch (unidad) {
    case 'g': return valor * 1000;
    case 'mcg': return valor / 1000;
    case 'mg': return valor;
    case 'UI': return valor; // UI se mantiene sin conversión
    case 'mEq': return valor; // mEq se mantiene sin conversión
    default: return valor;
  }
}

/**
 * Valida los parámetros de entrada
 */
function validarParametros(params: ParametrosInfusion): void {
  if (params.dosisDeseada <= 0) {
    throw new Error('La dosis debe ser mayor a 0');
  }
  
  if (params.concentracionAmpolla <= 0) {
    throw new Error('La concentración de la ampolla debe ser mayor a 0');
  }
  
  if (params.volumenAmpolla <= 0) {
    throw new Error('El volumen de la ampolla debe ser mayor a 0');
  }
  
  if (params.volumenDilucion && params.volumenDilucion < 0) {
    throw new Error('El volumen de dilución no puede ser negativo');
  }
  
  if (params.duracionInfusion && params.duracionInfusion <= 0) {
    throw new Error('La duración de infusión debe ser mayor a 0');
  }
  
  if (params.tipoVelocidad === 'dosisPorPeso') {
    if (!params.pesoKg || params.pesoKg <= 0) {
      throw new Error('Debe ingresar el peso del paciente');
    }
    if (!params.dosisPorKg || params.dosisPorKg <= 0) {
      throw new Error('Debe ingresar la dosis por kg');
    }
    if (params.pesoKg < 0.5 || params.pesoKg > 300) {
      throw new Error('Peso fuera del rango válido (0.5-300 kg)');
    }
  }
}

/**
 * Calculadora principal de infusiones
 */
export function calcularInfusion(params: ParametrosInfusion): ResultadoInfusion {
  // 1. Validar parámetros
  validarParametros(params);
  
  const explicacion: string[] = [];
  const alertas: string[] = [];
  
  // 2. Calcular dosis total (considerar dosis por peso si aplica)
  let dosisTotal = params.dosisDeseada;
  
  if (params.tipoVelocidad === 'dosisPorPeso' && params.pesoKg && params.dosisPorKg) {
    dosisTotal = params.dosisPorKg * params.pesoKg;
    explicacion.push(
      `Dosis calculada: ${params.dosisPorKg} ${params.unidadDosis}/kg × ${params.pesoKg} kg = ${dosisTotal.toFixed(2)} ${params.unidadDosis}`
    );
  } else {
    explicacion.push(`Dosis prescrita: ${dosisTotal} ${params.unidadDosis}`);
  }
  
  // 3. Calcular concentración de la ampolla (mg/ml)
  const concentracionPorMl = params.concentracionAmpolla / params.volumenAmpolla;
  explicacion.push(
    `Concentración de la ampolla: ${params.concentracionAmpolla} ${params.unidadConcentracion} en ${params.volumenAmpolla} ml = ${concentracionPorMl.toFixed(2)} ${params.unidadConcentracion}/ml`
  );
  
  // 4. Calcular volumen necesario de la ampolla
  const volumenNecesario = dosisTotal / concentracionPorMl;
  
  if (volumenNecesario > params.volumenAmpolla * 10) {
    alertas.push('⚠️ El volumen calculado es muy alto. Verifique la dosis y concentración.');
  }
  
  // 5. Calcular según tipo de administración
  let volumenTotal = volumenNecesario;
  let concentracionFinal = concentracionPorMl;
  
  if (params.volumenDilucion && params.volumenDilucion > 0) {
    volumenTotal = volumenNecesario + params.volumenDilucion;
    concentracionFinal = dosisTotal / volumenTotal;
    explicacion.push(
      `Preparación: Tomar ${volumenNecesario.toFixed(2)} ml del medicamento y diluir en ${params.volumenDilucion} ml de solución`
    );
    explicacion.push(
      `Volumen total a administrar: ${volumenTotal.toFixed(2)} ml`
    );
    explicacion.push(
      `Concentración final: ${concentracionFinal.toFixed(4)} ${params.unidadDosis}/ml`
    );
  } else {
    explicacion.push(
      `Volumen a administrar: ${volumenNecesario.toFixed(2)} ml (sin dilución)`
    );
  }
  
  // 6. Calcular velocidades de infusión
  let velocidadMlHora: number | undefined;
  let velocidadMlMin: number | undefined;
  let velocidadGotasMin: number | undefined;
  let velocidadMicroGotasMin: number | undefined;
  let tiempoAdministracion: string | undefined;
  
  if (params.tipoVelocidad === 'infusionContinua' && params.duracionInfusion) {
    // Convertir duración a horas
    const duracionHoras = params.duracionInfusion / 60;
    
    velocidadMlHora = volumenTotal / duracionHoras;
    velocidadMlMin = velocidadMlHora / 60;
    velocidadGotasMin = velocidadMlMin * 20; // Factor de goteo estándar
    velocidadMicroGotasMin = velocidadMlMin * 60; // Microgotero
    
    tiempoAdministracion = params.duracionInfusion >= 60 
      ? `${(params.duracionInfusion / 60).toFixed(1)} horas`
      : `${params.duracionInfusion} minutos`;
    
    explicacion.push(
      `Velocidad de infusión: ${velocidadMlHora.toFixed(1)} ml/hora durante ${tiempoAdministracion}`
    );
    explicacion.push(
      `Equivalente a: ${velocidadGotasMin.toFixed(0)} gotas/min (equipo macrogotero 20 gotas/ml)`
    );
    explicacion.push(
      `O bien: ${velocidadMicroGotasMin.toFixed(0)} microgotas/min (equipo microgotero)`
    );
  } else if (params.tipoVelocidad === 'boloUnico') {
    tiempoAdministracion = 'Administración en bolo único';
    explicacion.push(`Administrar ${volumenTotal.toFixed(2)} ml en bolo único (según indicación médica)`);
    
    if (volumenTotal > 20) {
      alertas.push('⚠️ Volumen elevado para bolo único. Considere administración lenta o dilución adicional.');
    }
  }
  
  // 7. Alertas de seguridad adicionales
  if (dosisTotal > 10000 && params.unidadDosis === 'mg') {
    alertas.push('⚠️ Dosis muy alta. Verifique la prescripción médica.');
  }
  
  if (velocidadMlHora && velocidadMlHora > 999) {
    alertas.push('⚠️ Velocidad de infusión muy alta. Verifique los cálculos y la prescripción.');
  }
  
  if (volumenTotal < 1) {
    alertas.push('💡 Volumen muy pequeño. Considere usar jeringa de tuberculina (1 ml) para mayor precisión.');
  }
  
  // 8. Construir resultado
  const resultado: ResultadoInfusion = {
    dosisTotal: `${dosisTotal.toFixed(2)} ${params.unidadDosis}`,
    volumenAdministrar: `${volumenTotal.toFixed(2)} ml`,
    explicacion,
  };
  
  if (velocidadMlHora) resultado.velocidadMlHora = `${velocidadMlHora.toFixed(1)} ml/hora`;
  if (velocidadMlMin) resultado.velocidadMlMin = `${velocidadMlMin.toFixed(2)} ml/min`;
  if (velocidadGotasMin) resultado.velocidadGotasMin = `${velocidadGotasMin.toFixed(0)} gotas/min`;
  if (velocidadMicroGotasMin) resultado.velocidadMicroGotasMin = `${velocidadMicroGotasMin.toFixed(0)} microgotas/min`;
  if (tiempoAdministracion) resultado.tiempoAdministracion = tiempoAdministracion;
  if (params.volumenDilucion) {
    resultado.concentracionFinal = `${concentracionFinal.toFixed(4)} ${params.unidadDosis}/ml`;
  }
  if (alertas.length > 0) resultado.alertas = alertas;
  
  return resultado;
}

/**
 * Ejemplos predefinidos comunes
 */
export const ejemplosComunes = [
  {
    nombre: 'Oxitocina en inducción',
    params: {
      dosisDeseada: 10,
      unidadDosis: 'UI' as const,
      concentracionAmpolla: 10,
      unidadConcentracion: 'UI' as const,
      volumenAmpolla: 1,
      volumenDilucion: 500,
      tipoVelocidad: 'infusionContinua' as const,
      duracionInfusion: 480, // 8 horas
    }
  },
  {
    nombre: 'Omeprazol EV',
    params: {
      dosisDeseada: 40,
      unidadDosis: 'mg' as const,
      concentracionAmpolla: 40,
      unidadConcentracion: 'mg' as const,
      volumenAmpolla: 10,
      volumenDilucion: 0,
      tipoVelocidad: 'boloUnico' as const,
    }
  },
  {
    nombre: 'Fentanyl por peso',
    params: {
      dosisDeseada: 0,
      unidadDosis: 'mcg' as const,
      concentracionAmpolla: 500,
      unidadConcentracion: 'mcg' as const,
      volumenAmpolla: 10,
      volumenDilucion: 0,
      tipoVelocidad: 'dosisPorPeso' as const,
      pesoKg: 70,
      dosisPorKg: 1,
    }
  },
];
