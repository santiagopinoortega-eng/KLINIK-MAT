'use client';

import { CasoListItem } from '@/services/caso.service';
import { useMemo, useState } from 'react';
import CaseCard from '@/app/components/CaseCard';
import Badge from '@/app/components/ui/Badge';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useUserProgress } from '@/app/hooks/useUserProgress';

// Nombres legibles de áreas (normalizado desde DB)
const AREA_NAMES: Record<string, string> = {
  'embarazo': 'Embarazo y Control Prenatal',
  'parto': 'Parto y Atención Intraparto',
  'puerperio': 'Puerperio y Lactancia',
  'ginecologia': 'Ginecología',
  'salud-sexual': 'Salud Sexual y Anticoncepción',
  'neonatologia': 'Neonatología / Recién Nacido'
};

// Normalización de nombres de área desde DB
function normalizeAreaName(area: string): string {
  const normalized = area.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normalized.includes('embarazo') || normalized.includes('prenatal')) return 'embarazo';
  if (normalized.includes('parto') && normalized.includes('intra')) return 'parto';
  if (normalized.includes('puerperio') || normalized.includes('lactancia')) return 'puerperio';
  if (normalized.includes('urgencias') && normalized.includes('obstetr')) return 'urgencias-obstetricas';
  if (normalized.includes('ginecol')) return 'ginecologia';
  if (normalized.includes('salud sexual') || normalized.includes('anticoncep')) return 'salud-sexual';
  if (normalized.includes('its') || normalized.includes('infecciones de transmision')) return 'its';
  if (normalized.includes('neonat') || normalized.includes('recien nacido')) return 'neonatologia';
  return normalized;
}

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
  const [progressFilter, setProgressFilter] = useState('all'); // Nuevo filtro
  const { progress, loading: progressLoading, getCaseStatus } = useUserProgress();

  // Filtrar casos por área seleccionada (escalable - usa campo 'area' de DB)
  const areaFilteredData = useMemo(() => {
    if (!selectedArea || selectedArea === 'all') return data;
    
    return data.filter(caso => {
      const casoArea = normalizeAreaName(caso.area);
      return casoArea === selectedArea;
    });
  }, [data, selectedArea]);

  // Extraer módulos únicos dinámicamente desde los casos filtrados
  const modulos = useMemo(() => {
    const uniqueModulos = new Set<string>();
    areaFilteredData.forEach(d => {
      // Usar campo 'modulo' si existe, si no usar 'area'
      const mod = (d as any).modulo || d.area;
      if (mod) uniqueModulos.add(mod);
    });
    return ['all', ...Array.from(uniqueModulos).sort()];
  }, [areaFilteredData]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return areaFilteredData.filter(d => {
      const moduloActual = (d as any).modulo || d.area;
      const dificultadActual = String((d as any).dificultad || d.difficulty);
      const caseStatus = getCaseStatus(d.id);
      
      // Filtro de búsqueda
      const matchesSearch = !s || 
        d.title.toLowerCase().includes(s) || 
        (d.summary ?? '').toLowerCase().includes(s);
      
      // Filtro de módulo
      const matchesModule = modulo === 'all' || moduloActual === modulo;
      
      // Filtro de dificultad
      const matchesDifficulty = difficulty === 'all' || 
        dificultadActual === difficulty || 
        (difficulty === 'Baja' && (dificultadActual === '1' || dificultadActual === 'Baja')) ||
        (difficulty === 'Media' && (dificultadActual === '2' || dificultadActual === 'Media')) ||
        (difficulty === 'Alta' && (dificultadActual === '3' || dificultadActual === 'Alta'));
      
      // Filtro de progreso
      const matchesProgress = progressFilter === 'all' ||
        (progressFilter === 'not-attempted' && caseStatus === 'not-attempted') ||
        (progressFilter === 'failed' && caseStatus === 'failed') ||
        (progressFilter === 'passed' && caseStatus === 'passed') ||
        (progressFilter === 'mastered' && caseStatus === 'mastered') ||
        (progressFilter === 'attempted' && caseStatus !== 'not-attempted');
      
      return matchesSearch && matchesModule && matchesDifficulty && matchesProgress;
    });
  }, [areaFilteredData, q, modulo, difficulty, progressFilter, getCaseStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-gray-50 pb-20">
      {/* Header profesional con gradiente */}
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white shadow-xl">
        <div className="container mx-auto max-w-6xl px-6 md:px-12 lg:px-16 py-8 md:py-12">
          {/* Back button */}
          {selectedArea && (
            <div className="mb-4">
              <Link 
                href="/areas"
                className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white font-medium transition-all hover:translate-x-[-4px] duration-200 group"
              >
                <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:translate-x-[-2px]" />
                <span>Volver a Áreas Clínicas</span>
              </Link>
            </div>
          )}

          {/* Título y descripción */}
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Biblioteca de Casos Clínicos
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
              {selectedArea ? AREA_NAMES[selectedArea] || 'Casos Clínicos' : 'Casos Clínicos de Obstetricia'}
            </h1>
            
            <p className="text-lg md:text-xl text-red-50 leading-relaxed">
              {selectedArea 
                ? `${areaFilteredData.length} casos clínicos profesionales basados en protocolos MINSAL y evidencia actualizada`
                : 'Practica con casos reales y desarrolla tus competencias clínicas'
              }
            </p>

            {/* Estadísticas visuales */}
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold">{areaFilteredData.length}</div>
                  <div className="text-sm text-red-100">Casos Activos</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold">{modulos.length - 1}</div>
                  <div className="text-sm text-red-100">Módulos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6 md:px-12 lg:px-16 py-8 md:py-10">
        {/* Panel de filtros moderno */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-white via-red-50/20 to-white rounded-2xl border-2 border-red-100 shadow-lg shadow-red-200/30">
            {/* Header del panel */}
            <div className="border-b border-red-100 px-6 py-4 bg-gradient-to-r from-red-50/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Filtros de Búsqueda</h2>
                  <p className="text-sm text-gray-500">Encuentra el caso perfecto para tu aprendizaje</p>
                </div>
              </div>
            </div>

            {/* Contenido del panel */}
            <div className="p-6 space-y-6">
              {/* Buscador destacado */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-700">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Búsqueda por palabras clave</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    value={q}
                    onChange={(e)=>setQ(e.target.value)}
                    placeholder="Ejemplo: diabetes gestacional, parto prematuro, preeclampsia..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 text-base outline-none transition-all focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-gray-50 focus:bg-white hover:border-gray-300"
                    aria-label="Buscar casos"
                  />
                </div>
              </div>

              {/* Filtros en grid profesional */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro módulo */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    <span>Módulo</span>
                  </label>
                  <select
                    value={modulo}
                    onChange={(e)=>setModulo(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none cursor-pointer transition-all border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-white hover:border-gray-300"
                    aria-label="Filtrar por módulo"
                  >
                    {modulos.map(m => <option key={m} value={m}>{m === 'all' ? 'Todos los módulos' : m}</option>)}
                  </select>
                </div>

                {/* Filtro dificultad */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Nivel de Complejidad</span>
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e)=>setDifficulty(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none cursor-pointer transition-all border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-white hover:border-gray-300"
                    aria-label="Filtrar por dificultad"
                  >
                    <option value="all">Todas las complejidades</option>
                    <option value="Baja">🟢 Baja - Casos básicos</option>
                    <option value="Media">🟡 Media - Casos intermedios</option>
                    <option value="Alta">🔴 Alta - Casos complejos</option>
                  </select>
                </div>

                {/* Filtro progreso */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <span>Mi Progreso</span>
                  </label>
                  <select
                    value={progressFilter}
                    onChange={(e)=>setProgressFilter(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none cursor-pointer transition-all border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-white hover:border-gray-300"
                    aria-label="Filtrar por progreso"
                    disabled={progressLoading}
                  >
                    <option value="all">Todo mi progreso</option>
                    <option value="not-attempted">📝 Casos nuevos</option>
                    <option value="failed">❌ Necesito mejorar</option>
                    <option value="passed">🔄 Para repasar</option>
                    <option value="mastered">✅ Ya dominados</option>
                    <option value="attempted">📊 Ya intentados</option>
                  </select>
                </div>

                {/* Panel de resultados */}
                <div className="flex flex-col justify-center bg-gradient-to-br from-red-50 via-rose-50 to-red-50 rounded-xl border-2 border-red-200 p-4 shadow-lg shadow-red-100/50">
                  <div className="text-center">
                    <div className="text-4xl font-black bg-gradient-to-br from-red-600 to-red-800 bg-clip-text text-transparent">
                      {filtered.length}
                    </div>
                    <div className="text-sm font-bold text-red-700 uppercase tracking-wide mt-1">
                      {filtered.length === 1 ? 'Caso' : 'Casos'}
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      {filtered.length === areaFilteredData.length ? 'Total' : 'Filtrados'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados - GRID PROFESIONAL */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No se encontraron casos
              </h3>
              <p className="text-gray-600 mb-6">
                Intenta ajustar los filtros o prueba con otros términos de búsqueda
              </p>
              <button
                onClick={() => {
                  setQ('');
                  setModulo('all');
                  setDifficulty('all');
                  setProgressFilter('all');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Limpiar todos los filtros
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header de resultados */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Casos Disponibles
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Mostrando {filtered.length} de {areaFilteredData.length} casos
                </p>
              </div>

              {/* Indicadores de orden */}
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span>Ordenados por relevancia</span>
              </div>
            </div>

            {/* Grid de casos */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(c => (
                <CaseCard key={c.id} {...c} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}