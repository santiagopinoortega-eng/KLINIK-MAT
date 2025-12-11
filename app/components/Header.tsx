'use client';

import Link from 'next/link';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';

export default function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-20">
      <nav className="h-full mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between">
        {/* Logo - Enhanced with medical icon */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="KLINIK-MAT">
          <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent group-hover:from-red-700 group-hover:to-red-800 transition-all" 
              style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            KLINIK-MAT
          </h1>
        </Link>

        {/* User Actions Only */}
        <div className="flex items-center gap-4">
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