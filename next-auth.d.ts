// types/next-auth.d.ts o en la raíz del proyecto

import { Role } from '@prisma/client';
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

// Extiende el tipo User para incluir 'id' y 'role'
declare module 'next-auth' {
  /**
   * El objeto User que se devuelve en los callbacks (jwt, session)
   * y que se pasa al adaptador.
   */
  interface User extends DefaultUser {
    role: Role;
    id: string; // Asegúrate que el tipo coincida con tu base de datos
  }

  /**
   * El objeto Session que se devuelve desde `useSession` o `getSession`.
   */
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user']; // Mantiene las propiedades por defecto (name, email, image)
  }
}
