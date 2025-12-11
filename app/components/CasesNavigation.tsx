// app/components/CasesNavigation.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star, BarChart3, BookOpen, Filter } from 'lucide-react';

type Tab = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
};

const tabs: Tab[] = [
  { href: '/casos', label: 'Todos los casos', icon: BookOpen },
  { href: '/favoritos', label: 'Favoritos', icon: Star },
  { href: '/mi-progreso', label: 'Mi Progreso', icon: BarChart3 },
];

type CasesNavigationProps = {
  showFilters?: boolean;
  onFilterChange?: (filters: any) => void;
  favoriteCount?: number;
};

export default function CasesNavigation({ 
  showFilters = false,
  onFilterChange,
  favoriteCount = 0
}: CasesNavigationProps) {
  const pathname = usePathname();
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);

  // Agregar badge a favoritos si hay
  const tabsWithBadges = tabs.map(tab => ({
    ...tab,
    badge: tab.href === '/favoritos' && favoriteCount > 0 ? favoriteCount : undefined
  }));

  return (
    <div className="space-y-4">
      {/* Tabs de navegación principal */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 sm:px-6">
          {/* Tabs */}
          <nav className="flex gap-1 sm:gap-2 -mb-px overflow-x-auto no-scrollbar">
            {tabsWithBadges.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');
              
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`
                    flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap
                    transition-colors min-h-touch md:min-h-0
                    ${isActive 
                      ? 'border-km-crimson text-km-crimson' 
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.href === '/casos' ? 'Casos' : 
                     tab.href === '/favoritos' ? 'Favoritos' : 
                     'Progreso'}
                  </span>
                  {tab.badge && (
                    <span className="ml-1 px-2 py-0.5 bg-km-crimson text-white text-xs font-bold rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Botón de filtros (solo si showFilters está habilitado) */}
          {showFilters && (
            <button
              onClick={() => setFiltersPanelOpen(!filtersPanelOpen)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                min-h-touch md:min-h-0 ml-2
                ${filtersPanelOpen 
                  ? 'bg-km-crimson text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
              {filtersPanelOpen ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Panel de filtros colapsable */}
      {showFilters && filtersPanelOpen && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-km-cardinal">Filtros Avanzados</h3>
            <button
              onClick={() => setFiltersPanelOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar filtros"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Área */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                📚 Área
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-km-crimson focus:border-km-crimson">
                <option value="all">Todas las áreas</option>
                <option value="ginecologia">Ginecología</option>
                <option value="ssr">SSR</option>
                <option value="obstetricia">Obstetricia</option>
                <option value="neonatologia">Neonatología</option>
              </select>
            </div>

            {/* Dificultad */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                🎯 Dificultad
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-km-crimson focus:border-km-crimson">
                <option value="all">Todas</option>
                <option value="1">🟢 Baja</option>
                <option value="2">🟡 Media</option>
                <option value="3">🔴 Alta</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                📊 Estado
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-km-crimson focus:border-km-crimson">
                <option value="all">Todos</option>
                <option value="not-attempted">📝 Nuevos</option>
                <option value="failed">❌ Fallé</option>
                <option value="passed">🔄 Repasar</option>
                <option value="mastered">✅ Dominados</option>
              </select>
            </div>

            {/* Módulo */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                🏷️ Módulo
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-km-crimson focus:border-km-crimson">
                <option value="all">Todos</option>
                <option value="ITS">ITS</option>
                <option value="Anticoncepción">Anticoncepción</option>
                <option value="Consejería">Consejería</option>
                <option value="Climaterio y Menopausia">Climaterio</option>
              </select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
            <button className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
              Limpiar filtros
            </button>
            <button className="btn btn-sm bg-km-crimson text-white hover:bg-km-cardinal">
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
