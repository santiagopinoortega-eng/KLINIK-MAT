'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/areas', label: 'Áreas Clínicas' },
  { href: '/recursos', label: 'Recursos' },
];

export default function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-km-crimson/10 shadow-sm transition-all">
      <nav className="mx-auto max-w-7xl px-6 lg:px-10 py-4 flex items-center justify-between">
        {/* Logo reemplazado por texto KLINIK-MAT */}
        <Link href="/" className="flex items-center group" aria-label="KLINIK-MAT - inicio">
          <h2 className="text-2xl md:text-3xl font-bold text-km-crimson group-hover:text-km-rose transition-colors" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            KLINIK-MAT
          </h2>
        </Link>

        {/* Navegación con nueva paleta */}
        <ul className="flex items-center gap-2">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={[
                    'px-4 py-2 rounded-xl text-sm sm:text-base font-semibold transition-all hover-lift',
                    active 
                      ? 'bg-gradient-km-primary text-white shadow-km-md' 
                      : 'text-km-navy hover:bg-km-blush hover:text-km-crimson',
                  ].join(' ')}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
          
          {/* User button or Sign in */}
          <li className="ml-3">
            {isSignedIn ? (
              <div className="flex items-center gap-2">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10 ring-2 ring-km-crimson/20 hover:ring-km-rose/40 transition-all'
                    }
                  }}
                />
              </div>
            ) : (
              <SignInButton forceRedirectUrl="/areas">
                <button className="btn btn-primary">
                  Iniciar sesión
                </button>
              </SignInButton>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}