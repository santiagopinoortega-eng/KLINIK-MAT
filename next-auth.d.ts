// next-auth.d.ts
// IMPORTANTE: Asegúrate de que este archivo esté en la raíz del proyecto o en src/

import { Role } from '@prisma/client'; // Importa tu Enum Role desde Prisma
import 'next-auth'; // Importante: importa el módulo original para extenderlo

/**
 * Aumenta (extiende) los tipos por defecto de NextAuth
 */
declare module 'next-auth' {
  
  /**
   * Extiende la interfaz 'Session'
   * Esto es lo que `useSession` y `getServerSession` devolverán.
   * Estamos añadiendo 'id' y 'role' al objeto 'user' dentro de 'session'.
   */
  interface Session {
    user: {
      id: string;   // Añade nuestro ID de la DB
      role: Role;   // Añade nuestro Rol de la DB
    } & DefaultSession['user']; // Mantiene las propiedades por defecto (name, email, image)
  }

  /**
   * Extiende la interfaz 'User'
   * Esto representa el objeto 'User' que viene de la DB (vía el PrismaAdapter)
   * y se pasa al callback de 'session'.
   */
  interface User {
    // Asegúrate de que el objeto User que pasa el Adapter tenga el rol
    role: Role; 
  }
}