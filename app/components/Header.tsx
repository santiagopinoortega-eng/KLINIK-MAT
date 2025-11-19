'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/recursos', label: 'Recursos' },
  { href: '/casos', label: 'Casos Clínicos' },
];

export default function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-neutral-100">
      <nav className="mx-auto max-w-7xl px-6 lg:px-10 py-3 flex items-center justify-between">
        {/* Logo - tamaño visible pero contenido */}
        <Link href="/" className="flex items-center gap-3" aria-label="KLINIK-MAT - inicio">
          <div className="relative w-[160px] h-10 md:h-10 md:w-[200px] flex items-center">
            <Image src="/brand/logo-centro.png" alt="KLINIK-MAT" fill style={{ objectFit: 'contain' }} priority />
          </div>
        </Link>

        {/* Navegación alineada a la derecha */}
        <ul className="flex items-center gap-2">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={[
                    'px-3 py-2 rounded-lg text-sm sm:text-[0.95rem] font-medium transition-colors',
                    active ? 'bg-[var(--km-blush)] text-[var(--km-deep)]' : 'text-[var(--km-text-700)] hover:bg-[var(--km-blush)]',
                  ].join(' ')}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
          
          {/* User button or Sign in */}
          <li className="ml-2">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--km-primary)] hover:bg-[var(--km-primary-dark)] transition-colors">
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