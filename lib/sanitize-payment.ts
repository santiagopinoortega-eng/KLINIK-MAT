// lib/sanitize-payment.ts
/**
 * Input Sanitization for Payment Data
 * 
 * Sanitiza y valida todos los inputs relacionados con pagos antes de:
 * - Enviarlos a MercadoPago API
 * - Guardarlos en base de datos
 * - Mostrarlos al usuario
 * 
 * Previene:
 * - XSS attacks
 * - SQL injection (complementa Prisma)
 * - Data corruption
 * - Invalid API calls
 */

import { sanitizeString, sanitizeEmail, sanitizeNumber } from './sanitize';
import { ValidationError } from './errors/app-errors';

/**
 * Sanitiza datos de pago antes de enviar a MercadoPago
 */
export interface PaymentDataInput {
  planDisplayName: string;
  payerEmail: string;
  payerName?: string;
  externalReference: string;
  paymentMethodId?: string;
  issuerId?: string;
  token?: string;
  installments?: number;
  amount: number;
}

export interface SanitizedPaymentData {
  description: string;
  payerEmail: string;
  payerFirstName: string;
  payerLastName: string;
  externalReference: string;
  paymentMethodId?: string;
  issuerId?: string;
  token?: string;
  installments: number;
  amount: number;
}

/**
 * Sanitiza todos los datos de un pago
 */
export function sanitizePaymentData(
  input: PaymentDataInput
): SanitizedPaymentData {
  // 1. Sanitizar descripción del plan
  const description = sanitizeString(input.planDisplayName, 200);
  if (!description || description.length === 0) {
    throw new ValidationError('Plan name cannot be empty');
  }

  // 2. Validar y sanitizar email
  let payerEmail: string;
  try {
    payerEmail = sanitizeEmail(input.payerEmail);
  } catch (error) {
    throw new ValidationError('Invalid payer email format');
  }

  // 3. Sanitizar nombre del pagador
  const payerName = input.payerName
    ? sanitizeString(input.payerName, 100)
    : 'Usuario KlinikMat';

  const [firstName, ...lastNames] = payerName.split(' ');
  const payerFirstName = firstName || 'Usuario';
  const payerLastName = lastNames.join(' ') || 'KlinikMat';

  // 4. Sanitizar referencia externa
  const externalReference = sanitizeString(input.externalReference, 100);
  if (!externalReference.startsWith('KMAT_')) {
    throw new ValidationError('Invalid external reference format');
  }

  // 5. Sanitizar IDs opcionales
  const paymentMethodId = input.paymentMethodId
    ? sanitizeString(input.paymentMethodId, 50)
    : undefined;

  const issuerId = input.issuerId
    ? sanitizeString(input.issuerId, 50)
    : undefined;

  const token = input.token ? sanitizeString(input.token, 200) : undefined;

  // 6. Validar monto
  const amount = sanitizeNumber(input.amount, 0, 10_000_000); // Máx $10M CLP
  if (amount <= 0) {
    throw new ValidationError('Payment amount must be positive');
  }

  // 7. Validar cuotas
  const installments = input.installments
    ? sanitizeNumber(input.installments, 1, 12)
    : 1;

  return {
    description,
    payerEmail,
    payerFirstName,
    payerLastName,
    externalReference,
    paymentMethodId,
    issuerId,
    token,
    installments,
    amount,
  };
}

/**
 * Sanitiza RUT chileno
 */
export function sanitizeRUT(rut: string): string {
  if (typeof rut !== 'string') {
    return '11111111-1'; // RUT de prueba por defecto
  }

  // Limpiar formato
  let cleaned = rut.trim().replace(/[.\s]/g, '');

  // Validar formato básico XX-X o XXXXXXXX-X
  if (!/^\d{7,8}-[\dkK]$/.test(cleaned)) {
    // Si no tiene guión, intentar agregar
    if (/^\d{8,9}$/.test(cleaned)) {
      cleaned = cleaned.slice(0, -1) + '-' + cleaned.slice(-1);
    } else {
      return '11111111-1'; // RUT de prueba si es inválido
    }
  }

  // Convertir K a minúscula para consistencia
  cleaned = cleaned.replace(/K/g, 'k');

  return cleaned;
}

/**
 * Sanitiza metadata de MercadoPago
 */
export function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(metadata)) {
    const sanitizedKey = sanitizeString(key, 50).replace(/[^a-zA-Z0-9_]/g, '_');

    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeString(value, 500);
    } else if (typeof value === 'number') {
      sanitized[sanitizedKey] = value;
    } else if (typeof value === 'boolean') {
      sanitized[sanitizedKey] = value;
    } else if (value === null || value === undefined) {
      sanitized[sanitizedKey] = null;
    } else {
      // Para objetos complejos, convertir a string y sanitizar
      sanitized[sanitizedKey] = sanitizeString(JSON.stringify(value), 1000);
    }
  }

  return sanitized;
}

/**
 * Valida que un amount sea un precio válido en CLP
 */
export function validateCLPAmount(amount: number): boolean {
  // CLP no tiene decimales
  if (!Number.isInteger(amount)) {
    return false;
  }

  // Rango razonable: $100 - $10M CLP
  if (amount < 100 || amount > 10_000_000) {
    return false;
  }

  return true;
}

/**
 * Sanitiza phone number chileno
 */
export function sanitizeChileanPhone(phone: string): string {
  if (typeof phone !== 'string') {
    return '';
  }

  // Limpiar formato
  const cleaned = phone.trim().replace(/[^\d+]/g, '');

  // Validar formato básico
  if (!/^\+?56\d{9}$/.test(cleaned)) {
    return ''; // Vacío si es inválido
  }

  // Retornar sin +56
  return cleaned.replace(/^\+?56/, '');
}

/**
 * Máscara de datos sensibles para logging
 */
export function maskSensitivePaymentData(data: any): any {
  const masked = { ...data };

  // Enmascarar email (mostrar solo primeros 2 chars y dominio)
  if (masked.email || masked.payerEmail) {
    const email = masked.email || masked.payerEmail;
    masked.email = email.replace(/(.{2}).*(@.*)/, '$1***$2');
    if (masked.payerEmail) {
      masked.payerEmail = masked.email;
    }
  }

  // Enmascarar tokens
  if (masked.token) {
    masked.token = masked.token.substring(0, 8) + '***';
  }

  // Enmascarar RUT (mostrar solo últimos 4)
  if (masked.rut) {
    masked.rut = '****' + masked.rut.slice(-4);
  }

  // Enmascarar card numbers (si están presentes)
  if (masked.cardNumber) {
    masked.cardNumber = '**** **** **** ' + masked.cardNumber.slice(-4);
  }

  // No enmascarar amounts (necesarios para debugging)
  // No enmascarar IDs (necesarios para rastreo)

  return masked;
}
