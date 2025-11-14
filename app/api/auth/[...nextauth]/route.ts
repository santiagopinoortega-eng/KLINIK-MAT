// app/api/auth/[...nextauth]/route.ts
// VERSIÓN DEFINITIVA (V4 - Compatible con App Router)

import NextAuth, { NextAuthOptions } from 'next-auth';
// Importa el adaptador V4
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client'; // Importar tu Enum 'Role'

export const authOptions: NextAuthOptions = {
  // 1. Adaptador de Prisma (Conectado a tu DB vía el cliente Singleton)
  adapter: PrismaAdapter(prisma),

  // 2. Providers (Métodos de Login)
  providers: [
    EmailProvider({
      // Asegúrate de que estas variables estén en tu .env.local
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM, // Ej: "KLINIK-MAT <no-reply@tu-dominio.com>"
    }),
  ],
  
  // 3. Estrategia de Sesión
  // 'database' es requerida cuando se usa un Adapter
  session: {
    strategy: 'database',
  },

  // 4. Callbacks (para extender la sesión)
  // Aquí es donde inyectamos 'id' y 'role' en el objeto de sesión
  callbacks: {
    async session({ session, user }) {
      // 'user' es el objeto que viene de la base de datos (gracias al Adapter)
      if (session.user) {
        // TypeScript validará esto una vez que lea 'next-auth.d.ts'
        session.user.id = user.id;
        session.user.role = user.role as Role;
      }
      return session;
    },
  },
  
  // 5. Páginas personalizadas
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verificar',
    error: '/login/error', // Página para mostrar errores de login
  },
};

// 6. Exportar los handlers
// Así es como Next.js 14 (App Router) maneja la ruta catch-all
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };