'use client';

import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import UsageLimitBadge from './UsageLimitBadge';
import Logo from './Logo';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  BookOpenIcon,
  CalculatorIcon,
  SparklesIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { 
      href: '/areas', 
      label: 'Casos Clínicos', 
      icon: BookOpenIcon,
      description: 'Biblioteca de casos'
    },
    { 
      href: '/recursos/calculadoras', 
      label: 'Recursos', 
      icon: CalculatorIcon,
      description: 'Herramientas clínicas'
    },
    { 
      href: '/pricing', 
      label: 'Planes', 
      icon: SparklesIcon,
      description: 'Suscripciones'
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      <nav className="h-16 mx-auto max-w-7xl px-4 md:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Logo variant="red" size="md" priority className="transition-all hover:scale-105" />

        {/* Navegación Desktop - Solo para usuarios autenticados */}
        {isSignedIn && (
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition-all rounded-lg hover:bg-gray-50"
                >
                  <IconComponent className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span className="text-sm">{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {isSignedIn && (
            <>
              <div className="hidden sm:block">
                <UsageLimitBadge />
              </div>
              <Link 
                href="/mi-perfil" 
                className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition-all rounded-lg hover:bg-gray-50"
              >
                <UserCircleIcon className="w-5 h-5" />
                <span className="text-sm">Mi Perfil</span>
              </Link>
            </>
          )}
          
          {isSignedIn ? (
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10 ring-2 ring-gray-200 hover:ring-red-500 transition-all'
                }
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <button className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-sm hover:shadow-md">
                Iniciar sesión
              </button>
            </SignInButton>
          )}

          {/* Mobile Menu Button - Solo si está autenticado */}
          {isSignedIn && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-50"
              aria-label="Menú"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu - Solo si está autenticado */}
      {isSignedIn && mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-red-600 font-medium transition-all rounded-lg hover:bg-gray-50"
                >
                  <IconComponent className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{link.label}</div>
                    <div className="text-xs text-gray-500">{link.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}