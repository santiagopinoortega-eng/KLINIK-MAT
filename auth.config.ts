// auth.config.ts
// 🚨 ÚLTIMA CORRECCIÓN DE CÓDIGO NECESARIA PARA NODEMAILER 🚨

import type { AuthConfig } from '@auth/core/types';
import { Role } from '@prisma/client';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';
// 💡 IMPORTACIÓN CRÍTICA: Necesitamos importar nodemailer para usarlo.
import nodemailer from 'nodemailer'; 


// --- FUNCIÓN DE TRANSPORTE PERSONALIZADA (WORKAROUND) ---
function createCustomTransporter() {
  // Creamos el transporter DE FORMA EXPLÍCITA.
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    // Añadido 'secure' para compatibilidad con el puerto 465 (si se usa)
    secure: process.env.EMAIL_SERVER_PORT === "465", 
  });
}
// -----------------------------------------------------------


export const authConfig: AuthConfig = {
  
  // 1. MOVIMIENTO CRÍTICO: 'authorized' va a la raíz de la configuración.
  authorized({ auth, request: { nextUrl } }) {
    const isLoggedIn = !!auth?.user;
    const pathname = nextUrl.pathname;

    if (pathname.startsWith('/admin') || pathname.startsWith('/casos')) {
        if (!isLoggedIn) return false; 
        if (pathname.startsWith('/admin') && auth.user.role !== Role.ADMIN) {
            return false; 
        }
    }
    return true; 
  },
  
  // 2. El objeto 'callbacks' solo contiene funciones de ciclo de vida
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = user.role as Role;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    verifyRequest: '/login/verificar',
    error: '/login/error',
  },

  // 3. LA CORRECCIÓN CRÍTICA: Inyectamos nuestro transporter ya creado.
  providers: [
    EmailProvider({
      server: createCustomTransporter(), // 👈 LLAMAMOS A NUESTRA FUNCIÓN
      from: process.env.EMAIL_FROM,
    }),
  ],
};