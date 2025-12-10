// app/api/csrf/route.ts
// Endpoint para obtener y establecer el token CSRF

import { NextResponse } from 'next/server';
import { getCsrfToken } from '@/lib/csrf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/csrf
 * Retorna un token CSRF y lo establece en una cookie httpOnly
 * El cliente NO necesita leer este token - se envía automáticamente en cookies
 * Este endpoint solo existe para establecer la cookie inicialmente
 */
export async function GET() {
  try {
    const token = await getCsrfToken();
    
    const response = NextResponse.json(
      { ok: true, message: 'CSRF token set', token }, // Incluir token en el body
      { status: 200 }
    );

    // Establecer cookie httpOnly con el token (para validación en servidor)
    response.cookies.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
