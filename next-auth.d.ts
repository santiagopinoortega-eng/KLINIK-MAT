// next-auth.d.ts
// VERSIÓN CORRECTA PARA AUTH.JS (V5)

import { Role } from '@prisma/client';
// 1. Importa los tipos desde '@auth/core' (V5)
import type { DefaultSession } from '@auth/core/types';

/**
 * Extiende los tipos de V5
 */
declare module '@auth/core/types' {
  
  /**
   * Extiende la interfaz 'Session'
   * Esto es lo que `auth()` (en V5) devolverá.
   */
  interface Session {
    user: {
      id: string;   // Añade nuestro ID de la DB
      role: Role;   // Añade nuestro Rol de la DB
    } & DefaultSession['user']; // Mantiene name, email, image
  }

  /**
   * Extiende la interfaz 'User'
   * Esto representa el modelo 'User' de tu base de datos (Prisma).
   */
  interface User {
    role: Role;
  }
}

/**
 * Extiende el tipo JWT de V5 (aunque usemos 'database', es buena práctica)
 */
declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: Role;
  }
}
