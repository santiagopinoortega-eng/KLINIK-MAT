'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { searchPubMed, PRESET_SEARCHES, PubMedArticle } from '@/lib/pubmed-api';

export default function PubMedSearchPage() {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    
    if (!finalQuery.trim()) {
      setError('Por favor ingresa un término de búsqueda');
      return;
    }

    setLoading(true);
    setError('');
    setSearchPerformed(true);

    try {
      const filters: { yearFrom?: number; yearTo?: number } = {};
      
      // Validación de años
      if (yearFrom) {
        const year = parseInt(yearFrom);
        if (year >= 1900 && year <= new Date().getFullYear()) {
          filters.yearFrom = year;
        }
      }
      if (yearTo) {
        const year = parseInt(yearTo);
        if (year >= 1900 && year <= new Date().getFullYear()) {
          filters.yearTo = year;
        }
      }

      const result = await searchPubMed(finalQuery, 15, filters);
      setArticles(result.articles);
      setTotal(result.total);
      
      if (searchQuery) {
        setQuery(searchQuery);
      }
    } catch (err: any) {
      setError(err.message || 'Error al realizar la búsqueda');
      setArticles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSearch = (presetQuery: string) => {
    handleSearch(presetQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Header con botón de retorno */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link 
            href="/areas"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">Volver a Áreas</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Búsqueda PubMed
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Acceso directo a 35+ millones de artículos científicos
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">


        {/* Búsquedas Predefinidas */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-gray-900">Búsquedas Rápidas</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_SEARCHES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetSearch(preset.query)}
                disabled={loading}
                className="px-4 py-2 bg-white border-2 border-red-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all font-semibold text-sm text-gray-700 hover:text-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{preset.icon}</span>
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            {/* Campo de búsqueda principal */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Términos de búsqueda
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleSearch()}
                  placeholder="Ej: gestational diabetes, preeclampsia, preterm birth..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-gray-900"
                  disabled={loading}
                />
                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </div>

            {/* Filtros de año */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Año desde
                </label>
                <input
                  type="number"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  placeholder="2015"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-gray-900"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Año hasta
                </label>
                <input
                  type="number"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  placeholder={new Date().getFullYear().toString()}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-gray-900"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>


        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 mb-6">
            <p className="text-red-800 font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* Resultados */}
        {searchPerformed && !loading && (
          <div>
            {/* Header de resultados */}
            {total > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {total.toLocaleString()} resultados encontrados
                  </h2>
                </div>
                <span className="text-sm text-gray-600">
                  Mostrando {articles.length} artículos
                </span>
              </div>
            )}

            {/* Lista de artículos */}
            {articles.length > 0 ? (
              <div className="space-y-4">
                {articles.map((article) => (
                  <a
                    key={article.pmid}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all"
                  >
                    {/* Título */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors leading-tight flex-1">
                        {article.title}
                      </h3>
                      <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400 group-hover:text-red-600 flex-shrink-0 transition-colors" />
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 mb-4">
                      {/* Autores */}
                      {article.authors.length > 0 && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <UserGroupIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            {article.authors.slice(0, 3).join(', ')}
                            {article.authors.length > 3 && ' et al.'}
                          </span>
                        </div>
                      )}

                      {/* Journal y fecha */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <BookOpenIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{article.journal}</span>
                        </div>
                        {article.pubDate && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span>{article.pubDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg">
                          PMID: {article.pmid}
                        </span>
                        {article.pmc && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
                            PMC: {article.pmc}
                          </span>
                        )}
                        {article.doi && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg">
                            DOI
                          </span>
                        )}
                      </div>
                      <span className="text-red-600 font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                        <span className="hidden sm:inline">Ver en PubMed</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                <AcademicCapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-gray-600">
                  Intenta con otros términos de búsqueda o usa las búsquedas rápidas sugeridas
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info inicial */}
        {!searchPerformed && !loading && (
          <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm border border-gray-200">
            <div className="text-center">
              <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-6 text-red-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Explora la Literatura Médica
              </h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                Busca en más de 35 millones de artículos científicos de PubMed. 
                Usa las búsquedas rápidas o ingresa tus propios términos.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200">
                  <span>💡</span>
                  <span>Usa términos en inglés para mejores resultados</span>
                </div>
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200">
                  <span>🔍</span>
                  <span>Combina términos con AND, OR, NOT</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
