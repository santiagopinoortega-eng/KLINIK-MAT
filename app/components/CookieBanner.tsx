'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // Solo mostrar en la página principal
    if (pathname !== '/') {
      return;
    }

    // Esperar a que Clerk cargue para saber si el usuario está autenticado
    if (!isLoaded) {
      return;
    }

    // NO mostrar si el usuario está autenticado (ya aceptó términos al registrarse)
    if (isSignedIn) {
      return;
    }

    // Verificar si el visitante anónimo ya aceptó las cookies
    const cookiesAccepted = localStorage.getItem('klinikmat-cookies-accepted');
    
    if (!cookiesAccepted) {
      // Mostrar el banner después de 1.5 segundos (dar tiempo a leer el hero)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, isSignedIn, isLoaded]);

  const handleAccept = () => {
    // Guardar la preferencia en localStorage
    localStorage.setItem('klinikmat-cookies-accepted', 'true');
    
    // Establecer una cookie de sesión (opcional, para el servidor)
    document.cookie = `klinikmat_cookies_accepted=true; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    
    // Ocultar el banner con animación
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 border-t-4 border-blue-400 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Contenido */}
            <div className="flex-1 flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <span className="text-4xl">🍪</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-base sm:text-lg mb-1">
                  Privacidad y Aprendizaje
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Usamos <span className="font-semibold">cookies esenciales</span> para mantener tu sesión segura y guardar tu progreso en los casos clínicos. 
                  Al continuar entrenando en KLINIK-MAT, aceptas nuestra{' '}
                  <Link 
                    href="/privacidad" 
                    className="underline font-semibold hover:text-blue-300 transition-colors"
                  >
                    Política de Privacidad
                  </Link>
                  {' '}y{' '}
                  <Link 
                    href="/terminos" 
                    className="underline font-semibold hover:text-blue-300 transition-colors"
                  >
                    Términos de Uso
                  </Link>.
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                Entendido
              </button>
              <button
                onClick={handleAccept}
                className="flex-shrink-0 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
