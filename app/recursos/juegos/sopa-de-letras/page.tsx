// app/recursos/juegos/sopa-de-letras/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import WordSearch from '@/app/components/WordSearch';

export default function SopaDeLetrasPage() {
  const [selectedCategory, setSelectedCategory] = useState<'obstetricia' | 'ginecologia' | 'lactancia' | 'neonatologia'>('obstetricia');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/areas?tab=recursos"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Recursos
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">🔤</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Sopa de Letras Médica
              </h1>
              <p className="text-lg text-gray-600">
                Encuentra términos ocultos y fortalece tu vocabulario clínico
              </p>
            </div>
          </div>

          {/* Selector de categorías */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('obstetricia')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                selectedCategory === 'obstetricia'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-blue-50 border-2 border-gray-200'
              }`}
            >
              🤰 Obstetricia
            </button>
            <button
              onClick={() => setSelectedCategory('ginecologia')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                selectedCategory === 'ginecologia'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-rose-50 border-2 border-gray-200'
              }`}
            >
              💗 Ginecología
            </button>
            <button
              onClick={() => setSelectedCategory('lactancia')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                selectedCategory === 'lactancia'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-pink-50 border-2 border-gray-200'
              }`}
            >
              🍼 Lactancia
            </button>
            <button
              onClick={() => setSelectedCategory('neonatologia')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                selectedCategory === 'neonatologia'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-teal-50 border-2 border-gray-200'
              }`}
            >
              👶 Neonatología
            </button>
          </div>
        </div>

        {/* Juego */}
        <WordSearch category={selectedCategory} />

        {/* Tips */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Consejos para jugar
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Arrastra el mouse sobre las letras para seleccionarlas (horizontal o vertical)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Las palabras pueden estar en cualquier dirección: izquierda-derecha o arriba-abajo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Puedes generar un nuevo tablero en cualquier momento</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Cambia de categoría para practicar diferentes áreas de la medicina</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
