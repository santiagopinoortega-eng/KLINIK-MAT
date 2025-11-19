// components/LoginScreenClient.tsx
// Este componente ya no es necesario con Clerk
// Clerk provee sus propios componentes de UI (SignIn, SignUp)
// Mantenemos este archivo por compatibilidad pero redirigimos a /login

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginScreenClient() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-xl">
      <p className="text-center">Redirigiendo al login...</p>
    </div>
  );
}