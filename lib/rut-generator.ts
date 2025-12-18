/**
 * Genera un RUT chileno válido (Módulo 11)
 */
export function generateValidRut(): string {
  // Generar número aleatorio entre 10.000.000 y 25.000.000
  const number = Math.floor(Math.random() * 15000000) + 10000000;
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  const numberStr = number.toString();
  for (let i = numberStr.length - 1; i >= 0; i--) {
    sum += parseInt(numberStr[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const dv = 11 - remainder;
  
  let dvStr: string;
  if (dv === 11) {
    dvStr = '0';
  } else if (dv === 10) {
    dvStr = 'K';
  } else {
    dvStr = dv.toString();
  }
  
  return `${number}-${dvStr}`;
}

/**
 * RUT genérico válido para testing
 */
export const TEST_RUT = '11111111-1';
