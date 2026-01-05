'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSidebar } from '@/app/context/SidebarContext';
import Logo from './Logo';

type SidebarVariant = 'full' | 'compact' | 'mini' | 'none';

interface SidebarProps {
  variant?: SidebarVariant;
}

export default function Sidebar({ variant = 'full' }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const [expandedSection, setExpandedSection] = useState<string | null>('areas');

  if (variant === 'none') return null;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  // Full sidebar for /casos, /areas
  if (variant === 'full') {
    return (
      <aside
        className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-white border-r border-neutral-200 shadow-sm
                    transition-all duration-300 z-40 overflow-y-auto
                    ${isCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo en el sidebar con fondo rojo */}
          <div className="p-3 border-b border-gray-200 flex items-center justify-center bg-gray-50">
            {!isCollapsed && <Logo size="sm" withBackground />}
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                         ${isActive('/') && !isActive('/casos') && !isActive('/areas') 
                           ? 'bg-red-600 text-white shadow-sm' 
                           : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <span className="text-xl flex-shrink-0">🏠</span>
              {!isCollapsed && <span className="font-medium text-sm">Inicio</span>}
            </Link>

            <Link
              href="/casos"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                         ${isActive('/casos') 
                           ? 'bg-red-600 text-white shadow-sm' 
                           : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <span className="text-xl flex-shrink-0">📚</span>
              {!isCollapsed && <span className="font-medium text-sm">Casos Clínicos</span>}
            </Link>



            {/* Mi Zona Section */}
            {!isCollapsed && (
              <div className="mt-6 pt-4 border-t border-neutral-200">
                <div className="px-3 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Mi Zona
                </div>
                <div className="mt-2 space-y-1">
                  <Link
                    href="/favoritos"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                               ${isActive('/favoritos') 
                                 ? 'bg-red-50 text-red-600 font-medium' 
                                 : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span className="flex-shrink-0">⭐</span>
                    <span className="flex-1 text-sm">Favoritos</span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">5</span>
                  </Link>
                  <Link
                    href="/mi-progreso"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                               ${isActive('/mi-progreso') 
                                 ? 'bg-red-50 text-red-600 font-medium' 
                                 : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span className="flex-shrink-0">📈</span>
                    <span className="text-sm">Mi Progreso</span>
                  </Link>
                  <Link
                    href="/recursos"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                               ${isActive('/recursos') 
                                 ? 'bg-red-50 text-red-600 font-medium' 
                                 : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span className="flex-shrink-0">📖</span>
                    <span className="text-sm">Recursos</span>
                  </Link>
                </div>
              </div>
            )}
          </nav>

          {/* Collapse Toggle */}
          <div className="p-4 border-t border-neutral-200">
            <button
              onClick={toggleCollapsed}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all font-medium"
              title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              <span className="text-lg">{isCollapsed ? '→' : '←'}</span>
              {!isCollapsed && <span>Colapsar</span>}
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // Compact sidebar for /casos/[id]
  if (variant === 'compact') {
    return (
      <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-neutral-200 shadow-sm z-40 overflow-y-auto">
        <div className="p-4 space-y-3">
          <Link
            href="/casos"
            className="flex items-center gap-3 px-3 py-2.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all font-medium text-sm"
          >
            <span className="flex-shrink-0">🔙</span>
            <span>Volver a casos</span>
          </Link>

          <div className="pt-3 border-t border-neutral-200 space-y-1">
            <div className="px-3 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Acciones Rápidas
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-sm">
              <span className="flex-shrink-0">⭐</span>
              <span>Guardar favorito</span>
            </button>
            <Link
              href="/mi-progreso"
              className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-sm"
            >
              <span className="flex-shrink-0">📊</span>
              <span>Mi progreso</span>
            </Link>
            <Link
              href="/recursos"
              className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-sm"
            >
              <span className="flex-shrink-0">📖</span>
              <span>Recursos</span>
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  // Mini sidebar for /favoritos, /mi-progreso
  if (variant === 'mini') {
    return (
      <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-neutral-200 shadow-sm z-40 overflow-y-auto">
        <div className="p-4 space-y-2">
          <Link
            href="/casos"
            className="flex items-center gap-3 px-3 py-2.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all font-medium text-sm"
          >
            <span className="flex-shrink-0">🔙</span>
            <span>Casos Clínicos</span>
          </Link>
          
          <div className="pt-3 border-t border-neutral-200 space-y-1">
            {pathname !== '/favoritos' && (
              <Link
                href="/favoritos"
                className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-sm"
              >
                <span className="flex-shrink-0">⭐</span>
                <span>Favoritos</span>
              </Link>
            )}
            
            {pathname !== '/mi-progreso' && (
              <Link
                href="/mi-progreso"
                className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-sm"
              >
                <span className="flex-shrink-0">📊</span>
                <span>Mi Progreso</span>
              </Link>
            )}
            
            {pathname !== '/recursos' && (
              <Link
                href="/recursos"
                className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-sm"
              >
                <span className="flex-shrink-0">📖</span>
                <span>Recursos</span>
              </Link>
            )}
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
