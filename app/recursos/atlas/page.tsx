'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  FunnelIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { ATLAS_CATEGORIES, ATLAS_ITEMS, searchAtlas, type AtlasItem } from './data';

export default function AtlasPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<AtlasItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      const results = searchAtlas(query);
      setSearchResults(results);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const filteredItems = isSearching 
    ? searchResults 
    : selectedCategory === 'all' 
      ? ATLAS_ITEMS 
      : ATLAS_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/areas"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver a Recursos
          </Link>

          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <BookOpenIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Atlas de Anatomía Obstétrica
              </h1>
              <p className="text-lg text-gray-600">
                Imágenes y diagramas anatómicos con relevancia clínica
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-purple-600">{ATLAS_ITEMS.length}</div>
              <div className="text-sm text-gray-600">Imágenes Totales</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-pink-600">{ATLAS_CATEGORIES.length}</div>
              <div className="text-sm text-gray-600">Categorías</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 col-span-2 sm:col-span-1">
              <div className="text-2xl font-bold text-indigo-600">100%</div>
              <div className="text-sm text-gray-600">Dominio Público</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar por anatomía, estructura o término..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <FunnelIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <button
              onClick={() => {
                setSelectedCategory('all');
                setIsSearching(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedCategory === 'all' && !isSearching
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Todas
            </button>
            {ATLAS_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setIsSearching(false);
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category.id && !isSearching
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        {isSearching && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              Se encontraron <strong>{searchResults.length}</strong> resultados para "{searchQuery}"
            </p>
          </div>
        )}

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const category = ATLAS_CATEGORIES.find(c => c.id === item.category);
              
              return (
                <Link 
                  key={item.id} 
                  href={`/recursos/atlas/${item.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Category Badge */}
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${category?.color} shadow-lg`}>
                      {category?.icon} {category?.name}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Key Points Preview */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <AcademicCapIcon className="w-4 h-4" />
                      <span>{item.keyPoints.length} puntos clave</span>
                    </div>

                    {/* Measurements Preview */}
                    {item.measurements && item.measurements.length > 0 && (
                      <div className="mt-2 text-xs text-purple-600 font-medium">
                        📏 {item.measurements.length} medidas de referencia
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-500">
              Intenta con otros términos de búsqueda o categoría
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <BookOpenIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Sobre las Imágenes</h3>
              <p className="text-sm text-gray-600 mb-2">
                Todas las imágenes provienen de fuentes de dominio público verificadas (Wikimedia Commons, Gray's Anatomy) 
                y han sido seleccionadas por su valor educativo en obstetricia.
              </p>
              <p className="text-xs text-gray-500">
                Las medidas y descripciones están basadas en referencias estándar: Williams Obstetrics, Cunningham et al.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
