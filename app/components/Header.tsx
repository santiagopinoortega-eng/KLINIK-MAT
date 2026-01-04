'use client';

import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import UsageLimitBadge from './UsageLimitBadge';
import Logo from './Logo';
import Link from 'next/link';

export default function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16">
      <nav className="h-full mx-auto max-w-7xl px-4 md:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Logo size="sm" priority className="transition-transform hover:scale-105" />

        {/* User Actions and Usage Badge */}
        <div className="flex items-center gap-3">
          {isSignedIn && (
            <>
              <div className="hidden sm:block">
                <UsageLimitBadge />
              </div>
              <Link 
                href="/mi-perfil" 
                className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 font-semibold transition-colors rounded-lg hover:bg-red-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi Perfil
              </Link>
            </>
          )}
          {isSignedIn ? (
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-11 h-11 ring-2 ring-red-500/30 hover:ring-red-600/50 transition-all shadow-md hover:shadow-lg'
                }
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                Iniciar sesión
              </button>
            </SignInButton>
          )}
        </div>
      </nav>
    </header>
  );
}