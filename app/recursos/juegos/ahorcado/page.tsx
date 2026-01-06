// app/recursos/juegos/ahorcado/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Hangman from '@/app/components/Hangman';

export default function AhorcadoPage() {
  const [selectedCategory, setSelectedCategory] = useState<'obstetricia' | 'ginecologia' | 'lactancia' | 'neonatologia'>('obstetricia');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 py-8">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
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
            <div className="text-5xl">🎮</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Ahorcado Matronil
              </h1>
              <p className="text-lg text-gray-600">
                Adivina términos obstétricos con pistas clínicas
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
        <Hangman category={selectedCategory} />

        {/* Tips */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Consejos para jugar
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Lee la pista cuidadosamente - te dará contexto sobre el término médico</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Empieza con las vocales (A, E, I, O, U) - son las más comunes en español</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Luego prueba consonantes comunes: R, S, N, L, T</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Tienes 6 intentos - piensa estratégicamente antes de elegir una letra</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Si pierdes, aprenderás el término y su significado clínico</span>
            </li>
          </ul>
        </div>

        {/* Beneficios educativos */}
        <div className="mt-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-6 border-2 border-indigo-200">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            Beneficios del juego
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-lg">✅</span>
              <span>Mejora la retención de terminología médica</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">✅</span>
              <span>Aprende conceptos mientras juegas</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">✅</span>
              <span>Ideal para descansos entre estudio intenso</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">✅</span>
              <span>Refuerza tu vocabulario clínico</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
