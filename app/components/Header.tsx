'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/recursos', label: 'Recursos' },
  { href: '/casos', label: 'Casos Clínicos' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-secondary-200">
      <nav className="mx-auto max-w-7xl px-6 lg:px-10 py-3 flex items-center justify-between">
        {/* Wordmark en texto (sin logo mini) */}
        <Link
          href="/"
          className="text-xl sm:text-2xl font-extrabold tracking-wide text-primary-700 hover:text-primary-800 transition"
          aria-label="KLINIK-MAT - inicio"
        >
          KLINIK-MAT
        </Link>

        {/* Navegación */}
        <ul className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={[
                    'px-3 py-2 rounded-lg text-sm sm:text-[0.95rem] font-medium transition-colors',
                    'hover:bg-primary-50 hover:text-primary-700',
                    active ? 'bg-primary-100 text-primary-800' : 'text-secondary-600',
                  ].join(' ')}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}