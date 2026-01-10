'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  TagIcon,
  CalendarIcon,
  BuildingLibraryIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getResources, getResourceStats } from '@/lib/data/minsal-resources';
import { Resource, ResourceCategory, ResourceSource } from '@/lib/types/resources';

const CATEGORIES: (ResourceCategory | 'Todos')[] = [
  'Todos',
  'Adolescencia',
  'Anticoncepción',
  'ITS/VIH',
  'Embarazo y Parto',
  'Puerperio',
  'Climaterio',
  'Cáncer Ginecológico',
  'Salud Reproductiva',
];

const SOURCES: (ResourceSource | 'Todos')[] = [
  'Todos',
  'MINSAL',
  'OMS',
  'SOCHOG',
];

export default function MinsalResourcesPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'Todos'>('Todos');
  const [selectedSource, setSelectedSource] = useState<ResourceSource | 'Todos'>('Todos');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Obtener recursos y estadísticas
  const stats = getResourceStats();

  // Filtrar recursos
  const filteredResources = useMemo(() => {
    return getResources({
      category: selectedCategory !== 'Todos' ? selectedCategory : undefined,
      source: selectedSource !== 'Todos' ? selectedSource : undefined,
      search: search.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });
  }, [search, selectedCategory, selectedSource, selectedTags]);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('Todos');
    setSelectedSource('Todos');
    setSelectedTags([]);
  };

  const hasActiveFilters = search || selectedCategory !== 'Todos' || selectedSource !== 'Todos' || selectedTags.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/recursos/calculadoras" 
            className="inline-flex items-center text-red-600 hover:text-red-800 mb-4 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            Volver a Recursos
          </Link>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg">
                <BuildingLibraryIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  Centro de Recursos MINSAL
                </h1>
                <p className="text-gray-600 mt-2">
                  Normativas técnicas, guías clínicas y documentos oficiales actualizados
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-600">{stats.totalResources}</div>
                <div className="text-sm text-gray-600">Documentos</div>
              </div>
            </div>

            {/* Estadísticas por categoría */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(stats.byCategory).slice(0, 8).map(([category, count]) => (
                <div key={category} className="bg-red-50 rounded-lg p-3 border border-red-100">
                  <div className="text-xs text-gray-600">{category}</div>
                  <div className="text-xl font-bold text-red-700">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Búsqueda y filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título, descripción o etiquetas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              />
            </div>

            {/* Botón de filtros móvil */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              Filtros {hasActiveFilters && `(${[selectedCategory !== 'Todos', selectedSource !== 'Todos', selectedTags.length > 0].filter(Boolean).length})`}
            </button>
          </div>

          {/* Filtros */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block space-y-4`}>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ResourceCategory | 'Todos')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat} {cat !== 'Todos' && stats.byCategory[cat] ? `(${stats.byCategory[cat]})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fuente */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fuente
                </label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value as ResourceSource | 'Todos')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                >
                  {SOURCES.map(source => (
                    <option key={source} value={source}>
                      {source} {source !== 'Todos' && stats.bySource[source] ? `(${stats.bySource[source]})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags populares */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Etiquetas populares
              </label>
              <div className="flex flex-wrap gap-2">
                {stats.popularTags.slice(0, 12).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Limpiar filtros */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium"
              >
                <XMarkIcon className="w-5 h-5" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4 text-gray-700">
          Mostrando <span className="font-bold text-red-600">{filteredResources.length}</span> de {stats.totalResources} documentos
        </div>

        {/* Lista de recursos */}
        {filteredResources.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <DocumentArrowDownIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar tus filtros o búsqueda
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200 hover:border-red-200">
      <div className="flex items-start gap-4">
        {/* Icono */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-md">
            <DocumentArrowDownIcon className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-lg font-bold text-gray-900 hover:text-red-600 transition-colors">
              {resource.title}
            </h3>
            <span className="flex-shrink-0 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
              {resource.category}
            </span>
          </div>

          <p className="text-gray-600 mb-3 line-clamp-2">
            {resource.description}
          </p>

          {/* Metadatos */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <BuildingLibraryIcon className="w-4 h-4" />
              <span>{resource.source}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{resource.year}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {resource.tags.slice(0, 5).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                <TagIcon className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Botón de descarga */}
          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            Descargar PDF
          </a>
        </div>
      </div>
    </div>
  );
}
