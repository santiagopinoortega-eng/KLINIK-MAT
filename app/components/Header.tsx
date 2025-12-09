'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/areas', label: 'Áreas Clínicas' },
  { href: '/mi-progreso', label: 'Mi Progreso' },
  { href: '/recursos', label: 'Recursos' },
];

export default function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-km-crimson/10 shadow-sm transition-all">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-3 md:py-4 flex items-center justify-between gap-3 md:gap-4">
        {/* Logo reemplazado por texto KLINIK-MAT - Responsive */}
        <Link href="/" className="flex items-center group flex-shrink-0" aria-label="KLINIK-MAT - inicio">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-km-crimson group-hover:text-km-rose transition-colors" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            KLINIK-MAT
          </h2>
        </Link>

        {/* Navegación con nueva paleta - Responsive: Ocultar algunos links en mobile */}
        <ul className="flex items-center gap-1 sm:gap-2 flex-wrap md:flex-nowrap">
          {links.map((l) => {
            const active = pathname === l.href;
            // En mobile, mostrar solo los esenciales
            const isMobileHidden = (l.href === '/recursos' || l.href === '/mi-progreso');
            
            return (
              <li key={l.href} className={isMobileHidden ? 'hidden md:block' : ''}>
                <Link
                  href={l.href}
                  className={[
                    'px-2 sm:px-3 md:px-4 py-2 min-h-touch md:min-h-0 rounded-lg md:rounded-xl text-xs sm:text-sm md:text-base font-semibold transition-all hover-lift',
                    active 
                      ? 'bg-gradient-km-primary text-white shadow-km-md' 
                      : 'text-km-navy hover:bg-km-blush hover:text-km-crimson',
                  ].join(' ')}
                >
                  {/* Texto corto en mobile para algunos links */}
                  <span className="hidden sm:inline">{l.label}</span>
                  <span className="sm:hidden">
                    {l.href === '/' ? 'Inicio' : l.href === '/areas' ? 'Áreas' : l.label}
                  </span>
                </Link>
              </li>
            );
          })}
          
          {/* User button or Sign in - Responsive */}
          <li className="ml-1 sm:ml-2 md:ml-3">
            {isSignedIn ? (
              <div className="flex items-center gap-2">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9 md:w-10 md:h-10 ring-2 ring-km-crimson/20 hover:ring-km-rose/40 transition-all'
                    }
                  }}
                />
              </div>
            ) : (
              <SignInButton forceRedirectUrl="/areas">
                <button className="btn btn-primary text-xs sm:text-sm md:text-base px-3 sm:px-4 py-2 min-h-touch md:min-h-0">
                  <span className="hidden sm:inline">Iniciar sesión</span>
                  <span className="sm:hidden">Entrar</span>
                </button>
              </SignInButton>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}