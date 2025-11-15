// app/api/auth/[...nextauth]/route.ts
// VERSIÓN FINAL: PROXY ROBUSTO Y EXPLICITO

// Importa los handlers del motor Auth.js
import { handlers } from '@/auth'; 
import { NextRequest } from 'next/server'; // Importa el tipo NextRequest para claridad

// Force node runtime — NextAuth uses Node APIs (cookies, nodemailer, prisma)
export const runtime = 'nodejs';

// 1. Exporta la función GET
//    Esta función llama al handler GET real del motor Auth.js.
export async function GET(req: NextRequest) {
  // In development only: log request details to help debug token mismatches
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.debug('[route][debug] GET incoming url', req.url);
      const headers: Record<string, string> = {};
      req.headers.forEach((v, k) => (headers[k] = v));
      console.debug('[route][debug] GET headers', headers);
    } catch (e) {
      /* ignore logging errors */
    }
  }
  try {
    // @ts-ignore
    return await handlers.GET(req);
  } catch (err: any) {
    console.error('[route][error] GET handler failed', err?.stack || err?.message || err);
    return new Response(JSON.stringify({ error: 'internal_server_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// 2. Exporta la función POST
//    Esta función llama al handler POST real del motor Auth.js.
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.debug('[route][debug] POST incoming url', req.url);
      const headers: Record<string, string> = {};
      req.headers.forEach((v, k) => (headers[k] = v));
      console.debug('[route][debug] POST headers', headers);
    } catch (e) {}
  }
  try {
    // @ts-ignore
    return await handlers.POST(req);
  } catch (err: any) {
    console.error('[route][error] POST handler failed', err?.stack || err?.message || err);
    return new Response(JSON.stringify({ error: 'internal_server_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}