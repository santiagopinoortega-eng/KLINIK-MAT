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
      {/* Hero Section - Diseño moderno clínico */}
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

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 relative">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Logo de la plataforma - Hero */}
            <div className="mb-8 flex justify-center">
              <div className="transform hover:scale-105 transition-transform bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <Logo size="xl" href={null} priority />
              </div>
            </div>

            {/* Badge superior */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-white">Plataforma de simulación clínica</span>
            </div>

            {/* Título principal */}
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                Practica casos clínicos<br />
                <span className="text-red-200">antes de la realidad</span>
              </h2>
              <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                Mejora tu razonamiento clínico con casos reales de Obstetricia. Feedback inmediato en cada decisión.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
              {!isSignedIn ? (
                <>
                  <Link href="/login?redirect_url=/areas" className="px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-center">
                    Comenzar ahora →
                  </Link>
                  <Link href="/login?redirect_url=/areas" className="px-6 py-3 bg-white/10 backdrop-blur-md text-white font-semibold rounded-lg border-2 border-white/30 hover:bg-white/20 transition-all text-center">
                    Registrarse gratis
                  </Link>
                </>
              ) : (
                <Link href="/areas" className="px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-center">
                  Ir a mis áreas →
                </Link>
              )}
            </div>

            {/* Stats - Glassmorphism cards */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 pt-8 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all hover:scale-105 hover:shadow-xl">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">54</div>
                <div className="text-xs md:text-sm text-white/90 font-medium">Casos clínicos</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all hover:scale-105 hover:shadow-xl">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">4</div>
                <div className="text-xs md:text-sm text-white/90 font-medium">Áreas</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all hover:scale-105 hover:shadow-xl">
                <div className="text-3xl md:text-4xl font-bold text-emerald-300 mb-1">100%</div>
                <div className="text-xs md:text-sm text-white/90 font-medium">Gratuito</div>
              </div>
            </div>

            {/* Trust badges - Enhanced */}
            <div className="flex flex-wrap gap-3 justify-center pt-6">
              <div className="group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 hover:shadow-lg">
                <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-semibold text-white">Validado por expertos</span>
              </div>
              <div className="group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 hover:shadow-lg">
                <div className="w-6 h-6 bg-red-300/20 rounded-full flex items-center justify-center group-hover:bg-red-300/30 transition-colors">
                  <span className="text-lg">🎓</span>
                </div>
                <span className="text-xs md:text-sm font-semibold text-white">Basado en MINSAL</span>
              </div>
              <div className="group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 hover:shadow-lg">
                <div className="w-6 h-6 bg-blue-400/20 rounded-full flex items-center justify-center group-hover:bg-blue-400/30 transition-colors">
                  <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-semibold text-white">Datos protegidos</span>
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
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">Casos clínicos reales</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Practica con escenarios basados en situaciones reales de Obstetricia en Chile, validados por profesionales.
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
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Feedback inmediato</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Aprende por qué cada decisión es correcta o incorrecta con explicaciones detalladas al instante.
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
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Sigue tu progreso</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Visualiza tu avance y áreas de mejora con estadísticas detalladas y personalizadas.
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

              <p className="text-lg md:text-xl font-extrabold text-white text-center pt-4">
                Úsala para fallar aquí, aprender, y no fallar allá afuera.
              </p>
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
              Practica en las 4 áreas fundamentales de la Obstetricia con casos reales
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="group relative bg-white rounded-2xl p-6 border-2 border-red-100 hover:border-red-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🩺</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">Ginecología</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">ITS, Climaterio y patología ginecológica</p>
                <div className="inline-flex items-center text-red-600 font-bold text-sm group-hover:gap-3 gap-2 transition-all">
                  <span>Ver casos</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-pink-50 to-white rounded-2xl p-6 border-2 border-pink-200 hover:border-pink-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🤰</span>
                  </div>
                  <div className="px-2 py-1 bg-pink-600 rounded-md shadow-sm">
                    <span className="text-[10px] font-bold text-white tracking-wide">54 CASOS</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">Obstetricia</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">Embarazo, parto y puerperio</p>
                <div className="inline-flex items-center text-pink-600 font-bold text-sm group-hover:gap-3 gap-2 transition-all">
                  <span>Ver casos</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-6 border-2 border-blue-100 hover:border-blue-300 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden opacity-75 hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <span className="text-2xl">👶</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Neonatología</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">Atención del recién nacido</p>
                <div className="inline-flex items-center text-blue-500 font-bold text-xs group-hover:gap-2 gap-1 transition-all">
                  <span>Próximamente</span>
                  <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-6 border-2 border-purple-100 hover:border-purple-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Salud Sexual y Reproductiva</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">Anticoncepción y consejería</p>
                <div className="inline-flex items-center text-purple-600 font-bold text-sm group-hover:gap-3 gap-2 transition-all">
                  <span>Ver casos</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mini Blog - Recursos y Artículos */}
      <section className="relative bg-gradient-to-b from-white via-gray-50 to-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1.5 bg-blue-100 rounded-full border border-blue-200 mb-3">
              <span className="text-xs font-semibold text-blue-700">📚 Recursos educativos</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
              Blog y Guías Clínicas
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Artículos, protocolos y recursos actualizados para tu práctica clínica
            </p>
          </div>          {/* Grid de artículos */}
          <div className="grid md:grid-cols-3 gap-6">
          {/* Artículo 1 */}
          <article className="group bg-white rounded-3xl border-2 border-gray-100 hover:border-red-300 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1">
            <div className="bg-gradient-to-br from-red-500 to-red-700 h-48 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <span className="text-7xl relative z-10">🤰</span>
            </div>
            <div className="p-7">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">Obstetricia</span>
                <span className="text-xs text-gray-500">• 5 min lectura</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                Protocolos MINSAL 2025: Manejo del Trabajo de Parto
              </h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Actualización de las guías clínicas para la atención del trabajo de parto según normativa vigente.
              </p>
              <a href="#" className="inline-flex items-center text-red-600 font-semibold text-sm group-hover:gap-3 gap-2 transition-all">
                <span>Leer más</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </article>

          {/* Artículo 2 */}
          <article className="group bg-white rounded-3xl border-2 border-gray-100 hover:border-blue-300 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 h-48 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <span className="text-7xl relative z-10">👶</span>
            </div>
            <div className="p-7">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Neonatología</span>
                <span className="text-xs text-gray-500">• 7 min lectura</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Reanimación Neonatal: Algoritmo Actualizado
              </h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Guía paso a paso para la reanimación del recién nacido en sala de partos según estándares internacionales.
              </p>
              <a href="#" className="inline-flex items-center text-blue-600 font-semibold text-sm group-hover:gap-3 gap-2 transition-all">
                <span>Leer más</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </article>

          {/* Artículo 3 */}
          <article className="group bg-white rounded-3xl border-2 border-gray-100 hover:border-purple-300 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 h-48 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <span className="text-7xl relative z-10">💊</span>
            </div>
            <div className="p-7">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">SSR</span>
                <span className="text-xs text-gray-500">• 4 min lectura</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                Anticoncepción de Emergencia: Actualización 2025
              </h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Métodos disponibles, indicaciones y consejería según las últimas evidencias científicas.
              </p>
              <a href="#" className="inline-flex items-center text-purple-600 font-semibold text-sm group-hover:gap-3 gap-2 transition-all">
                <span>Leer más</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </article>
        </div>

          {/* CTA al blog completo */}
          <div className="text-center mt-12">
            <a 
              href="#" 
              className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-blue-500"
            >
              <span>Ver todos los artículos</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </a>
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