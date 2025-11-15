// components/LoginScreenClient.tsx
'use client'; 

import React, { useState } from 'react';
import { signIn } from 'next-auth/react'; 
import { useRouter } from 'next/navigation';

export default function LoginScreenClient() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setLoading(true);
    setError(null);
    // Llama al backend de Auth.js (V5)
    const result = await signIn('email', {
      email,
      redirect: false,
      // Después de hacer clic en el email, redirige al usuario a la página de casos.
      callbackUrl: '/casos',
    });

    if (result?.error) {
      setError('Error al enviar el correo. ¿Credenciales SMTP correctas?');
    } else if (result?.ok) {
      // Éxito: Redirigimos al usuario a la página de "Verificar Email"
      router.push('/login/verificar');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-xl">
      <h1 className="text-3xl font-bold text-center text-blue-800">
        KLINIK-MAT
      </h1>
      <h2 className="text-xl text-center text-gray-700">
        Inicia Sesión o Regístrate
      </h2>
      <p className="text-sm text-center text-gray-500">
        Ingresa tu correo para acceder al catálogo de casos clínicos.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm"
          placeholder="tu@email.com"
        />

        {error && (
          <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Enviando Enlace...' : 'Acceder con Magic Link'}
        </button>
      </form>
    </div>
  );
}