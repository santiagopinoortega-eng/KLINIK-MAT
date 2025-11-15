// app/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
// 💡 Importa la función 'auth' del motor V5
import { auth } from '@/auth'; 
// ✅ CORRECCIÓN DE RUTA: Usamos el alias estándar que funciona con tsconfig
import LoginScreenClient from 'app/components/LoginScreenClient'; 

export default async function HomePage() {
  
  // 1. Verificar la sesión en el servidor (Auth.js V5)
  //    Esta línea fallará si la cookie/DB está corrupta.
  const session = await auth(); 
  
  // 2. Lógica de Redirección (Si está logueado, va directo a /casos)
  if (session?.user) {
    // Redirección instantánea en el servidor
    redirect('/casos');
  }

  // 3. Si no está logueado, renderizar el muro de autenticación
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-blue-900 mb-8">
          KLINIK-MAT
        </h1>
        <p className="text-xl text-gray-700 mb-10 max-w-xl mx-auto">
          Plataforma educativa para fortalecer el razonamiento clínico.
        </p>
        
        {/* Renderiza el componente Cliente para la interacción del formulario */}
        <LoginScreenClient />
      </div>
    </div>
  );
}