import { addDays, subMonths, addYears, format, differenceInDays, differenceInWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

export type CalculationResult = {
  fpp: Date;
  metodo: string;
  egSemanas: number;
  egDias: number;
  egTexto: string;
  trimestre: number;
  diasRestantes: number;
  porcentajeGestacion: number;
};

export type IMCResult = {
  imc: number;
  categoria: string;
  gananciaRecomendada: string;
  riesgo: string;
};

/**
 * Calcula FPP y EG con estándares profesionales
 * Basado en Normas MINSAL Chile
 */
export const calculateObstetricData = (
  fur: Date, 
  metodo: 'naegele' | 'wahl' = 'naegele'
): CalculationResult => {
  // Validación de entrada
  if (!fur || isNaN(fur.getTime())) {
    throw new Error('Fecha inválida');
  }

  const hoy = new Date();
  if (fur > hoy) {
    throw new Error('La FUR no puede ser una fecha futura');
  }

  // 1. Calcular FPP según método
  const diasASumar = metodo === 'naegele' ? 7 : 10;
  const fpp = addYears(subMonths(addDays(fur, diasASumar), 3), 1);

  // 2. Calcular Edad Gestacional (EG) a la fecha actual
  const totalDias = differenceInDays(hoy, fur);
  
  // Validación de rango razonable
  if (totalDias < 0 || totalDias > 320) {
    throw new Error('Fecha fuera del rango gestacional válido');
  }

  const semanas = Math.floor(totalDias / 7);
  const diasRestantes = totalDias % 7;

  // 3. Determinar trimestre
  let trimestre = 1;
  if (semanas >= 28) trimestre = 3;
  else if (semanas >= 14) trimestre = 2;

  // 4. Días hasta el parto
  const diasHastaFPP = differenceInDays(fpp, hoy);

  // 5. Porcentaje de gestación (280 días = 40 semanas)
  const porcentaje = Math.min(100, Math.max(0, Math.round((totalDias / 280) * 100)));

  return {
    fpp,
    metodo: metodo === 'naegele' ? 'Regla de Naegele (FUR + 7 días - 3 meses)' : 'Regla de Wahl (FUR + 10 días - 3 meses)',
    egSemanas: semanas,
    egDias: diasRestantes,
    egTexto: `${semanas} semanas + ${diasRestantes} días`,
    trimestre,
    diasRestantes: diasHastaFPP > 0 ? diasHastaFPP : 0,
    porcentajeGestacion: porcentaje,
  };
};

/**
 * Calcula IMC pregestacional y ganancia de peso recomendada
 * Basado en IOM (Institute of Medicine) y Normas MINSAL
 */
export const calculateIMC = (peso: number, altura: number): IMCResult => {
  // Validaciones de entrada
  if (!peso || !altura || peso <= 0 || altura <= 0) {
    throw new Error('Peso y altura deben ser valores positivos');
  }

  if (peso < 30 || peso > 200) {
    throw new Error('Peso fuera del rango válido (30-200 kg)');
  }

  if (altura < 120 || altura > 220) {
    throw new Error('Altura fuera del rango válido (120-220 cm)');
  }

  const imc = peso / Math.pow(altura / 100, 2);
  
  let categoria = '';
  let gananciaRecomendada = '';
  let riesgo = '';

  if (imc < 18.5) {
    categoria = 'Bajo peso';
    gananciaRecomendada = '12.5 - 18 kg';
    riesgo = 'Mayor riesgo de RN bajo peso al nacer. Se recomienda seguimiento nutricional.';
  } else if (imc >= 18.5 && imc < 25) {
    categoria = 'Peso normal';
    gananciaRecomendada = '11.5 - 16 kg';
    riesgo = 'Riesgo bajo. Mantener alimentación saludable y actividad física.';
  } else if (imc >= 25 && imc < 30) {
    categoria = 'Sobrepeso';
    gananciaRecomendada = '7 - 11.5 kg';
    riesgo = 'Mayor riesgo de diabetes gestacional e hipertensión. Control nutricional recomendado.';
  } else {
    categoria = 'Obesidad';
    gananciaRecomendada = '5 - 9 kg';
    riesgo = 'Alto riesgo de complicaciones (DMG, preeclampsia, cesárea). Seguimiento multidisciplinario.';
  }

  return {
    imc: parseFloat(imc.toFixed(1)),
    categoria,
    gananciaRecomendada,
    riesgo,
  };
};

/**
 * Formatea fecha para visualización
 */
export const formatDate = (date: Date): string => {
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
};

/**
 * Calcula edad gestacional por ecografía
 * Fórmula de Robinson y Fleming para LCC (1975)
 */
export const calculateEGByUSG = (lcc: number): { semanas: number; dias: number } => {
  // Validaciones de entrada
  if (!lcc || lcc <= 0) {
    throw new Error('LCC debe ser un valor positivo');
  }

  if (lcc < 5 || lcc > 100) {
    throw new Error('LCC fuera del rango válido para primer trimestre (5-100 mm)');
  }

  // Fórmula de Robinson y Fleming para LCC
  const diasGestacion = Math.round(8.052 * Math.pow(lcc, 0.5) + 23.73);
  const semanas = Math.floor(diasGestacion / 7);
  const dias = diasGestacion % 7;
  
  return { semanas, dias };
};
