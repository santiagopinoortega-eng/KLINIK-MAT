'use client';

import { CasoListItem } from '@/services/caso.service';
import { useMemo, useState, useEffect } from 'react';
import CaseCard from '@/app/components/CaseCard';
import Badge from '@/app/components/ui/Badge';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Mapeo de áreas a módulos
const AREA_TO_MODULES: Record<string, string[]> = {
  'ginecologia': ['ITS', 'Climaterio y Menopausia'],
  'ssr': ['Anticoncepción', 'Consejería'],
  'obstetricia': ['Embarazo', 'Parto', 'Puerperio'],
  'neonatologia': ['RN']
};

const AREA_NAMES: Record<string, string> = {
  'ginecologia': 'Ginecología y Salud de la Mujer',
  'ssr': 'Salud Sexual y Reproductiva',
  'obstetricia': 'Obstetricia y Puerperio',
  'neonatologia': 'Neonatología'
};

export default function CasosPageClient({ 
  data, 
  selectedArea 
}: { 
  data: CasoListItem[];
  selectedArea?: string;
}) {

  const [q, setQ] = useState('');
  const [modulo, setModulo] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  // Filtrar casos por área seleccionada
  const areaFilteredData = useMemo(() => {
    if (!selectedArea || selectedArea === 'all') return data;
    
    const allowedModules = AREA_TO_MODULES[selectedArea] || [];
    return data.filter(caso => {
      const casoModulo = (caso as any).modulo || caso.area;
      return allowedModules.includes(casoModulo);
    });
  }, [data, selectedArea]);

  // Extraer módulos únicos (soportando tanto 'area' como 'modulo')
  const modulos = useMemo(() => {
    const uniqueModulos = new Set<string>();
    areaFilteredData.forEach(d => {
      const mod = (d as any).modulo || d.area;
      if (mod) uniqueModulos.add(mod);
    });
    return ['all', ...Array.from(uniqueModulos)];
  }, [areaFilteredData]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return areaFilteredData.filter(d => {
      const moduloActual = (d as any).modulo || d.area;
      const dificultadActual = String((d as any).dificultad || d.difficulty);
      
      return (
        (modulo === 'all' || moduloActual === modulo) &&
        (difficulty === 'all' || dificultadActual === difficulty || 
         (difficulty === 'Baja' && (dificultadActual === '1' || dificultadActual === 'Baja')) ||
         (difficulty === 'Media' && (dificultadActual === '2' || dificultadActual === 'Media')) ||
         (difficulty === 'Alta' && (dificultadActual === '3' || dificultadActual === 'Alta'))
        ) &&
        (!s || d.title.toLowerCase().includes(s) || (d.summary ?? '').toLowerCase().includes(s))
      );
    });
  }, [areaFilteredData, q, modulo, difficulty]);

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <div className="container mx-auto max-w-6xl py-6 px-4 md:px-6">
        {/* Back button si hay área seleccionada */}
        {selectedArea && (
          <div className="mb-4">
            <Link 
              href="/areas"
              className="inline-flex items-center gap-2 text-sm text-km-crimson hover:text-km-cardinal font-medium transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Volver a Áreas Clínicas
            </Link>
          </div>
        )}

        {/* Header con título - MÁS COMPACTO */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{color: 'var(--km-navy)'}}>
            {selectedArea ? AREA_NAMES[selectedArea] || 'Casos Clínicos' : 'Casos Clínicos'}
          </h1>
          <p className="text-sm text-neutral-600">
            {selectedArea 
              ? `${areaFilteredData.length} casos disponibles`
              : 'Selecciona un caso para comenzar'
            }
        </p>
      </div>

      {/* Filtros mejorados con diseño de cards */}
      <div className="mb-8">
        <div className="bg-white rounded-xl border border-[rgba(196,30,58,0.1)] p-6 shadow-[var(--km-shadow-sm)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Buscador */}
            <div className="md:col-span-3">
              <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{color: 'var(--km-text-700)'}}>
                <span className="text-lg">🔍</span>
                Buscar casos
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5" style={{color: 'var(--km-text-500)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  value={q}
                  onChange={(e)=>setQ(e.target.value)}
                  placeholder="Buscar por título o resumen…"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-2 text-sm outline-none transition-all"
                  style={{
                    borderColor: 'rgba(196,30,58,0.15)',
                    backgroundColor: 'var(--km-blush)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--km-crimson)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(196,30,58,0.15)'}
                  aria-label="Buscar casos"
                />
              </div>
            </div>

            {/* Filtro módulo */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{color: 'var(--km-text-700)'}}>
                <span className="text-lg">📚</span>
                Módulo
              </label>
              <select
                value={modulo}
                onChange={(e)=>setModulo(e.target.value)}
                className="w-full rounded-lg px-4 py-3 text-sm font-medium outline-none cursor-pointer transition-all border-2"
                style={{
                  borderColor: 'rgba(196,30,58,0.15)',
                  backgroundColor: 'var(--km-blush)',
                  color: 'var(--km-text-900)'
                }}
                aria-label="Filtrar por módulo"
              >
                {modulos.map(m => <option key={m} value={m}>{m === 'all' ? 'Todos los módulos' : m}</option>)}
              </select>
            </div>

            {/* Filtro dificultad */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{color: 'var(--km-text-700)'}}>
                <span className="text-lg">🎯</span>
                Dificultad
              </label>
              <select
                value={difficulty}
                onChange={(e)=>setDifficulty(e.target.value)}
                className="w-full rounded-lg px-4 py-3 text-sm font-medium outline-none cursor-pointer transition-all border-2"
                style={{
                  borderColor: 'rgba(196,30,58,0.15)',
                  backgroundColor: 'var(--km-blush)',
                  color: 'var(--km-text-900)'
                }}
                aria-label="Filtrar por dificultad"
              >
                <option value="all">Todas las dificultades</option>
                <option value="Baja">🟢 Baja</option>
                <option value="Media">🟡 Media</option>
                <option value="Alta">🔴 Alta</option>
              </select>
            </div>

            {/* Contador de resultados */}
            <div className="flex flex-col justify-center items-center bg-gradient-to-br from-[var(--km-blush)] to-white rounded-lg border-2 p-4" style={{borderColor: 'var(--km-rose)'}}>
              <div className="text-3xl font-bold" style={{color: 'var(--km-crimson)'}}>
                {filtered.length}
              </div>
              <div className="text-xs font-medium" style={{color: 'var(--km-text-600)'}}>
                {filtered.length === 1 ? 'caso encontrado' : 'casos encontrados'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados - GRID OPTIMIZADO */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-neutral-700 font-medium mb-1">
            No se encontraron casos
          </p>
          <p className="text-neutral-500 text-sm">
            Intenta ajustar los filtros
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <CaseCard key={c.id} {...c} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}