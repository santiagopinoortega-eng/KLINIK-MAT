// auth.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config'; // Importa la config

// Aquí es donde V5 separa los handlers
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);