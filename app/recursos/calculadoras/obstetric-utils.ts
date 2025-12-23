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
  // 1. Calcular FPP según método
  const diasASumar = metodo === 'naegele' ? 7 : 10;
  const fpp = addYears(subMonths(addDays(fur, diasASumar), 3), 1);

  // 2. Calcular Edad Gestacional (EG) a la fecha actual
  const hoy = new Date();
  const totalDias = differenceInDays(hoy, fur);
  
  const semanas = Math.floor(totalDias / 7);
  const diasRestantes = totalDias % 7;

  // 3. Determinar trimestre
  let trimestre = 1;
  if (semanas >= 28) trimestre = 3;
  else if (semanas >= 14) trimestre = 2;

  // 4. Días hasta el parto
  const diasHastaFPP = differenceInDays(fpp, hoy);

  // 5. Porcentaje de gestación (280 días = 40 semanas)
  const porcentaje = Math.min(100, Math.round((totalDias / 280) * 100));

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
  const imc = peso / Math.pow(altura / 100, 2);
  
  let categoria = '';
  let gananciaRecomendada = '';
  let riesgo = '';

  if (imc < 18.5) {
    categoria = 'Bajo peso';
    gananciaRecomendada = '12.5 - 18 kg';
    riesgo = 'Mayor riesgo de RN bajo peso';
  } else if (imc >= 18.5 && imc < 25) {
    categoria = 'Peso normal';
    gananciaRecomendada = '11.5 - 16 kg';
    riesgo = 'Riesgo bajo';
  } else if (imc >= 25 && imc < 30) {
    categoria = 'Sobrepeso';
    gananciaRecomendada = '7 - 11.5 kg';
    riesgo = 'Mayor riesgo de diabetes gestacional';
  } else {
    categoria = 'Obesidad';
    gananciaRecomendada = '5 - 9 kg';
    riesgo = 'Alto riesgo de complicaciones';
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
 */
export const calculateEGByUSG = (lcc: number): { semanas: number; dias: number } => {
  // Fórmula de Robinson y Fleming para LCC
  const diasGestacion = Math.round(8.052 * Math.pow(lcc, 0.5) + 23.73);
  const semanas = Math.floor(diasGestacion / 7);
  const dias = diasGestacion % 7;
  
  return { semanas, dias };
};
