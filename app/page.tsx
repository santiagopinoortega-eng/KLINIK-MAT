
// app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Stethoscope, BookOpen, Award, Heart, ArrowRight } from 'lucide-react';
import RecommendedCases from './components/RecommendedCases';
import Logo from './components/Logo';
import type { CasoClient } from '@/lib/types';

export default function HomePage() {
  const { isSignedIn, user } = useUser();
  const [allCases, setAllCases] = useState<CasoClient[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);

  // Cargar casos para mostrar recomendaciones
  useEffect(() => {
    if (isSignedIn) {
      fetch('/api/cases')
        .then(res => res.json())
        .then(data => {
          setAllCases(data.cases || []);
          setLoadingCases(false);
        })
        .catch(err => {
          console.error('Error loading cases:', err);
          setLoadingCases(false);
        });
    }
  }, [isSignedIn]);
  
  // Hero image - use public asset. If you have a specific hero file, replace the path.
  const heroSrc = '/brand/logo-centro.png';

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section - Diseño centrado y moderno */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        {/* Patrón de fondo sutil médico */}
        <div className="absolute inset-0 opacity-[0.07]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="medical-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="white" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#medical-pattern)" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16 relative">
          {/* Contenido centrado y vertical */}
          <div className="flex flex-col items-center text-center space-y-6">
            
            {/* Logo con animación */}
            <div className="transform hover:scale-105 transition-all duration-500 ease-out filter drop-shadow-2xl">
              <Logo size="hero" href={null} priority />
            </div>

            {/* Badge superior */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-white tracking-wide">
                1ª Plataforma de Entrenamiento Clínico en Chile
              </span>
            </div>

            {/* Título principal con slogan */}
            <div className="space-y-6 max-w-4xl">
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                Del aula al hospital: <br className="hidden md:block" />
                Domina la Obstetricia con
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-white">
                  Casos Clínicos Reales
                </span>
              </h1>
              
              {/* Slogan poderoso */}
              <div className="px-6 py-4 bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-white/30 shadow-2xl max-w-3xl mx-auto">
                <p className="text-xl md:text-2xl font-bold text-white italic leading-tight">
                  &quot;Falla aquí con nosotros, para no fallar allá afuera con ellas.&quot;
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {!isSignedIn ? (
                <>
                  <Link href="/sign-up" className="group px-8 py-4 bg-white text-red-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 text-center text-lg flex items-center justify-center gap-2">
                    Comenzar gratis
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link href="/pricing" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border-2 border-white/40 hover:bg-white/20 transition-all text-center text-lg hover:scale-105">
                    Ver planes
                  </Link>
                </>
              ) : (
                <Link href="/areas" className="group px-8 py-4 bg-white text-red-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 text-center text-lg flex items-center justify-center gap-2">
                  Ir a mis áreas
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Stats - Social proof */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto pt-8">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all hover:scale-105 hover:shadow-2xl group">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">320+</div>
                <div className="text-sm md:text-base text-white/95 font-medium">Casos clínicos</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all hover:scale-105 hover:shadow-2xl group">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">1000+</div>
                <div className="text-sm md:text-base text-white/95 font-medium">Estudiantes</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all hover:scale-105 hover:shadow-2xl group">
                <div className="text-4xl md:text-5xl font-bold text-emerald-300 mb-2 group-hover:scale-110 transition-transform">100%</div>
                <div className="text-sm md:text-base text-white/95 font-medium">Validado</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recomendaciones personalizadas para usuarios autenticados */}
      {isSignedIn && !loadingCases && allCases.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <RecommendedCases allCases={allCases} showOnboarding={true} />
          </div>
        </section>
      )}

      {/* Sección de características - Enhanced with glassmorphism */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            ¿Por qué KLINIK-MAT?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            La forma más efectiva de prepararte para la práctica clínica real
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="group relative bg-gradient-to-br from-white to-red-50/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100/50 hover:scale-105 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                <Stethoscope className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">Casos Reales (No Ficción)</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Escenarios basados en prevalencia real y Ley de Transparencia. No inventamos pacientes, replicamos Chile.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100/50 hover:scale-105 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                <BookOpen className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Corrección al Instante</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                No esperes al examen. Entiende el &apos;porqué&apos; clínico de cada error con fundamentos de las normas técnicas vigentes.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative bg-gradient-to-br from-white to-green-50/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50 hover:scale-105 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                <Award className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Mide tu Competencia</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Detecta tus lagunas de conocimiento antes de llegar al campo clínico. Estadísticas personalizadas por área.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: Realidad Clínica Chilena */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-12 md:py-16 overflow-hidden">
        {/* Patrón de fondo médico */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="clinical-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="2" fill="white" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#clinical-pattern)" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-8 relative">
          <div className="bg-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 md:p-10 border-2 border-white/20 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/30 backdrop-blur-md rounded-full border border-blue-300/50 mb-4 shadow-lg">
                <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></span>
                <span className="text-xs font-bold text-white">Acerca de KLINIK-MAT</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
                Realidad Clínica Chilena,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400">no Ficción.</span>
              </h2>
            </div>

            {/* Contenido principal */}
            <div className="space-y-5">
              <p className="text-lg md:text-xl font-bold text-white leading-relaxed">
                En KLINIK-MAT, no inventamos pacientes.
              </p>
              
              <p className="text-base md:text-lg text-gray-100 leading-relaxed">
                Nuestra ingeniería de casos se alimenta de <span className="font-bold text-cyan-300">datos reales obtenidos vía Ley de Transparencia y DATA.GOB.CL</span>. Esto significa que la prevalencia de patologías, los factores de riesgo y los perfiles epidemiológicos que enfrentarás aquí son un reflejo fiel de la realidad obstétrica de Chile.
              </p>

              <div className="my-6">
                <p className="text-base md:text-lg font-semibold text-white mb-4">
                  Cada decisión clínica que tomas es validada contra un estándar riguroso:
                </p>
              </div>

              {/* Lista de validaciones */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-white/10 backdrop-blur-md rounded-xl p-5 border-2 border-emerald-500/30 hover:bg-white/15 hover:border-emerald-400/50 transition-all hover:scale-[1.02] shadow-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-white text-base mb-1">Normativa Chilena</p>
                    <p className="text-sm text-gray-200">Normas Técnicas y Guías Clínicas (MINSAL) vigentes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white/10 backdrop-blur-md rounded-xl p-5 border-2 border-blue-500/30 hover:bg-white/15 hover:border-blue-400/50 transition-all hover:scale-[1.02] shadow-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-white text-base mb-1">Estándar Internacional</p>
                    <p className="text-sm text-gray-200">Protocolos de la OMS y OPS.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white/10 backdrop-blur-md rounded-xl p-5 border-2 border-purple-500/30 hover:bg-white/15 hover:border-purple-400/50 transition-all hover:scale-[1.02] shadow-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-white text-base mb-1">Bibliografía Gold Standard</p>
                    <p className="text-sm text-gray-200">Manuales de Obstetricia de referencia académica (Williams, Schwarcz, Manuales UC/UChile).</p>
                  </div>
                </div>
              </div>

              {/* CTA final */}
              <div className="mt-8 pt-8 border-t-2 border-white/20">
                <p className="text-lg md:text-xl font-extrabold text-center text-white leading-tight">
                  Entrena con la certeza de que lo que aprendes hoy,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300">es lo que aplicarás mañana.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aviso de Seguridad y Uso Educativo */}
      <section className="bg-gradient-to-br from-red-700 via-red-800 to-red-900 py-12 md:py-16 relative overflow-hidden">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-[0.08]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="warning-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="white" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#warning-pattern)" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-8 relative">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 md:p-10 shadow-2xl border-2 border-white/20">
            {/* Icono y título */}
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🚨</span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">
                  Entrenamiento Clínico para la Obstetricia Real
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full border border-white/30">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg"></span>
                  <span className="text-xs font-bold text-white">Aviso Público</span>
                </div>
              </div>
            </div>

            {/* Contenido del aviso */}
            <div className="space-y-5 leading-relaxed">
              <p className="text-base md:text-lg">
                <span className="font-extrabold text-white">KLINIK-MAT es un simulador académico de alto estándar.</span>
              </p>
              
              <p className="text-sm md:text-base text-white/90">
                Entrena tu criterio profesional con casos construidos sobre una base sólida: <span className="font-bold text-white">datos demográficos reales de Chile (datos.gob.cl)</span>, normativas del MINSAL, estándares internacionales (OMS/OPS) y literatura fundamental de la obstetricia.
              </p>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border-2 border-white/30 shadow-lg">
                <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span>Nota de Seguridad</span>
                </p>
                <p className="text-sm md:text-base text-white/90 leading-relaxed">
                  Aunque nuestros algoritmos reflejan la mejor evidencia disponible, esta plataforma es una herramienta de aprendizaje. <span className="font-bold text-white">No sustituye la supervisión clínica docente ni debe usarse como única fuente para decisiones con pacientes reales.</span> La matronería requiere ciencia, pero también un juicio humano que ninguna web puede replicar.
                </p>
              </div>

              {/* Punchline con énfasis dramático */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xl md:text-2xl font-bold text-white text-center italic opacity-90">
                  &quot;Falla aquí con nosotros, para no fallar allá afuera con ellas.&quot;
                </p>
              </div>
            </div>

            {/* Badges informativos */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t-2 border-white/20">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/30 shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-bold text-white">Datos reales Chile</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/30 shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xs font-bold text-white">MINSAL + OMS/OPS</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/30 shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-xs font-bold text-white">Literatura fundamental</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de áreas clínicas - Enhanced */}
      <section className="bg-gradient-to-b from-white via-gray-50 to-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-block px-3 py-1.5 bg-red-100 rounded-full border border-red-200 mb-3">
              <span className="text-xs font-semibold text-red-700">🏥 Especialidades disponibles</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">Áreas clínicas disponibles</h2>
            <p className="text-base md:text-lg text-gray-600">
              Practica en las 8 áreas fundamentales de la Obstetricia y Ginecología con casos reales
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* EMBARAZO Y CONTROL PRENATAL */}
            <div className="group relative bg-white rounded-2xl p-5 border-2 border-blue-100 hover:border-blue-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden opacity-75 hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Embarazo y Control Prenatal</h3>
                <p className="text-gray-600 text-xs leading-relaxed mb-3">Control prenatal, ecografía, patología del embarazo</p>
                <div className="inline-flex items-center text-blue-500 font-bold text-xs group-hover:gap-2 gap-1 transition-all">
                  <span>Próximamente</span>
                  <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* PARTO Y ATENCIÓN INTRAPARTO */}
            <div className="group relative bg-white rounded-2xl p-5 border-2 border-indigo-100 hover:border-indigo-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden opacity-75 hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">Parto y Atención Intraparto</h3>
                <p className="text-gray-600 text-xs leading-relaxed mb-3">Trabajo de parto, monitoreo fetal, atención del parto</p>
                <div className="inline-flex items-center text-indigo-500 font-bold text-xs group-hover:gap-2 gap-1 transition-all">
                  <span>Próximamente</span>
                  <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* PUERPERIO Y LACTANCIA */}
            <div className="group relative bg-white rounded-2xl p-5 border-2 border-pink-100 hover:border-pink-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden opacity-75 hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">Puerperio y Lactancia</h3>
                <p className="text-gray-600 text-xs leading-relaxed mb-3">Puerperio normal y patológico, lactancia materna</p>
                <div className="inline-flex items-center text-pink-500 font-bold text-xs group-hover:gap-2 gap-1 transition-all">
                  <span>Próximamente</span>
                  <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* URGENCIAS OBSTÉTRICAS - DISPONIBLE */}
            <div className="group relative bg-gradient-to-br from-red-50 to-white rounded-2xl p-5 border-2 border-red-200 hover:border-red-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="px-2 py-0.5 bg-red-600 rounded-md shadow-sm">
                    <span className="text-[9px] font-bold text-white tracking-wide">1 CASO</span>
                  </div>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">Urgencias Obstétricas</h3>
                <p className="text-gray-600 text-xs leading-relaxed mb-3">Hemorragias, preeclampsia, emergencias maternas</p>
                <div className="inline-flex items-center text-red-600 font-bold text-xs group-hover:gap-2 gap-1 transition-all">
                  <span>Ver casos</span>
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* GINECOLOGÍA */}
            <div className="group relative bg-white rounded-2xl p-5 border-2 border-rose-100 hover:border-rose-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden opacity-75 hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors">Ginecología</h3>
                <p className="text-gray-600 text-xs leading-relaxed mb-3">Patología ginecológica, climaterio, endocrinología</p>
                <div className="inline-flex items-center text-rose-500 font-bold text-xs group-hover:gap-2 gap-1 transition-all">
                  <span>Próximamente</span>
                  <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* SALUD SEXUAL Y ANTICONCEPCIÓN */}
            <div className="group relative bg-white rounded-2xl p-5 border-2 border-purple-100 hover:border-purple-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden opacity-75 hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Salud Sexual y Anticoncepción</h3>
                <p className="text-gray-600 text-xs leading-relaxed mb-3">Regulación de fertilidad, métodos anticonceptivos</p>
                <div className="inline-flex items-center text-purple-500 font-bold text-xs group-hover:gap-2 gap-1 transition-all">
                  <span>Próximamente</span>
                  <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* ITS (INFECCIONES DE TRANSMISIÓN SEXUAL) */}
            <div className="group relative bg-white rounded-2xl p-5 border-2 border-orange-100 hover:border-orange-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden opacity-75 hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">ITS</h3>
                <p className="text-gray-600 text-xs leading-relaxed mb-3">Diagnóstico y manejo de infecciones de transmisión sexual</p>
                <div className="inline-flex items-center text-orange-500 font-bold text-xs group-hover:gap-2 gap-1 transition-all">
                  <span>Próximamente</span>
                  <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* NEONATOLOGÍA / RECIÉN NACIDO */}
            <div className="group relative bg-white rounded-2xl p-5 border-2 border-teal-100 hover:border-teal-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden opacity-75 hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">Neonatología / Recién Nacido</h3>
                <p className="text-gray-600 text-xs leading-relaxed mb-3">Atención inmediata, patología neonatal, reanimación</p>
                <div className="inline-flex items-center text-teal-500 font-bold text-xs group-hover:gap-2 gap-1 transition-all">
                  <span>Próximamente</span>
                  <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Sponsores - Enhanced with glassmorphism */}
      <section className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-red-950 py-12 md:py-16 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.08]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="sponsor-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="white" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#sponsor-pattern)" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-8 relative">
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1.5 bg-white/15 backdrop-blur-md rounded-full border border-white/30 mb-4 shadow-lg">
              <span className="text-xs font-bold text-white">✨ Nuestros aliados</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3">
              Apoyado por instituciones líderes
            </h2>
            <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto">
              Organizaciones comprometidas con la excelencia en educación clínica
            </p>
          </div>

          {/* Grid de Sponsores - Enhanced glassmorphism */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            <div className="group bg-white/[0.12] backdrop-blur-xl rounded-3xl p-8 border-2 border-white/30 hover:bg-white/[0.18] hover:border-white/50 transition-all duration-300 hover:scale-110 hover:shadow-2xl shadow-xl flex items-center justify-center min-h-[140px]">
              <div className="text-center">
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">🏥</div>
                <p className="text-sm font-bold text-white">Sponsor 1</p>
              </div>
            </div>
            <div className="group bg-white/[0.12] backdrop-blur-xl rounded-3xl p-8 border-2 border-white/30 hover:bg-white/[0.18] hover:border-white/50 transition-all duration-300 hover:scale-110 hover:shadow-2xl shadow-xl flex items-center justify-center min-h-[140px]">
              <div className="text-center">
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">🎓</div>
                <p className="text-sm font-bold text-white">Sponsor 2</p>
              </div>
            </div>
            <div className="group bg-white/[0.12] backdrop-blur-xl rounded-3xl p-8 border-2 border-white/30 hover:bg-white/[0.18] hover:border-white/50 transition-all duration-300 hover:scale-110 hover:shadow-2xl shadow-xl flex items-center justify-center min-h-[140px]">
              <div className="text-center">
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">🏛️</div>
                <p className="text-sm font-bold text-white">Sponsor 3</p>
              </div>
            </div>
            <div className="group bg-white/[0.12] backdrop-blur-xl rounded-3xl p-8 border-2 border-white/30 hover:bg-white/[0.18] hover:border-white/50 transition-all duration-300 hover:scale-110 hover:shadow-2xl shadow-xl flex items-center justify-center min-h-[140px]">
              <div className="text-center">
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">🤝</div>
                <p className="text-sm font-bold text-white">Sponsor 4</p>
              </div>
            </div>
          </div>

          {/* CTA para sponsorships */}
          <div className="text-center mt-12">
            <div className="inline-block bg-white/[0.12] backdrop-blur-xl rounded-2xl p-8 border-2 border-white/30 shadow-2xl">
              <p className="text-white mb-4 text-lg font-semibold">
                ¿Interesado en apoyar la educación clínica?
              </p>
              <a 
                href="mailto:contacto@klinik-mat.cl" 
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-base"
              >
                <span>Contáctanos</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}