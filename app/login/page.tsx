// app/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  
  useEffect(() => {
    if (!isLoaded) return;
    
    if (isSignedIn) {
      // Si ya está autenticado, redirigir al destino
      const redirectUrl = searchParams.get('redirect_url') || '/areas';
      router.push(redirectUrl);
    } else {
      // Si no está autenticado, redirigir a sign-in con el redirect_url
      const redirectUrl = searchParams.get('redirect_url');
      const signInUrl = redirectUrl 
        ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`
        : '/sign-in';
      router.push(signInUrl);
    }
  }, [isLoaded, isSignedIn, searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
    </div>
  );
}
