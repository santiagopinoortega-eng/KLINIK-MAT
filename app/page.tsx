// app/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { auth } from '@clerk/nextjs/server';

export default async function HomePage() {
  const { userId } = await auth();
  const forceRedirect = process.env.NODE_ENV === 'production' || process.env.FORCE_REDIRECT_TO_CASOS === 'true';
  if (forceRedirect && userId) redirect('/casos');

  // Hero image - use public asset. If you have a specific hero file, replace the path.
  const heroSrc = '/brand/logo-centro.png';

  return (
    <main className="min-h-screen">
      {/* Hero Section - Identidad Obstetricia Chilena */}
      <section className="relative overflow-hidden bg-gradient-km-hero text-white rounded-[2rem] shadow-km-xl mx-4 md:mx-6 my-6">
        {/* Patrón orgánico de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute top-1/2 right-10 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="container-app relative py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] items-center gap-8 md:gap-12">
            {/* Contenido principal - Solo título */}
            <div className="space-y-6">
              <div className="mb-6">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight whitespace-nowrap">
                  KLINIK-MAT
                </h1>
              </div>

              <p className="text-lg md:text-xl text-white/95 leading-relaxed max-w-xl">
                Simulador de casos clínicos para estudiantes de Obstetricia.
                <br />
                <span className="font-semibold text-km-blush">Practica con casos que simulan la realidad y domina tu profesión.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a href="/casos" className="btn btn-lg bg-white text-km-crimson hover:bg-km-blush hover:scale-105 shadow-km-xl transition-all">
                  Comenzar ahora →
                </a>
                <a href="#features" className="btn btn-lg bg-transparent border-2 border-white text-white hover:bg-white/10">
                  Conocer más
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-6">
                <div>
                  <div className="text-3xl font-bold text-km-blush">50+</div>
                  <div className="text-white/80 text-sm">Casos Clínicos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-km-blush">4</div>
                  <div className="text-white/80 text-sm">Módulos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-km-blush">100%</div>
                  <div className="text-white/80 text-sm">Gratis</div>
                </div>
              </div>
            </div>

            {/* Logo grande a la derecha */}
            <div className="flex justify-center md:justify-end">
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-3xl bg-white/10 backdrop-blur-sm p-8 border-2 border-white/20 shadow-km-xl overflow-hidden">
                <Image src={heroSrc} alt="KLINIK-MAT Logo" width={500} height={500} className="w-full h-full object-contain" priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Container para el resto del contenido */}
      <div className="container-app py-12 grid gap-16">

              {/* 1) HERO - removido (ya integrado arriba) */}

        {/* 2) ¿Qué es KLINIK-MAT? */}
        <section id="features" className="card shadow-km-md border-l-4 border-km-crimson bg-white/70 backdrop-blur-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-km-cardinal mb-4">
            ¿Qué es KLINIK‑MAT?
          </h2>
          <p className="text-km-text-700 text-base md:text-lg leading-relaxed max-w-3xl">
            KLINIK‑MAT es una plataforma diseñada para que estudiantes de Obstetricia practiquen con casos clínicos que simulan la realidad con <strong className="text-km-crimson">feedback inmediato</strong> y recursos relacionados. Cada caso está pensado para entrenar toma de decisiones, priorización y manejo clínico, reflejando la realidad de la <strong className="text-km-crimson">Matronería en Chile</strong>.
          </p>
        </section>

        {/* 3) ¿Qué puedes hacer? - Cards mejoradas */}
        <section>
          <h3 className="text-2xl md:text-3xl font-bold text-km-cardinal mb-8 text-center">
            ¿Qué puedes hacer en KLINIK‑MAT?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card group hover:border-km-rose transition-all">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🩺</div>
              <h4 className="font-bold text-lg text-km-navy mb-2">Practicar casos clínicos</h4>
              <p className="text-sm text-km-text-700 leading-relaxed">
                Simula la atención con decisiones interactivas y casos que reflejan la práctica obstétrica.
              </p>
            </div>

            <div className="card group hover:border-km-rose transition-all">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💬</div>
              <h4 className="font-bold text-lg text-km-navy mb-2">Feedback inmediato</h4>
              <p className="text-sm text-km-text-700 leading-relaxed">
                Explicaciones docentes para cada decisión tomada durante el caso clínico.
              </p>
            </div>

            <div className="card group hover:border-km-rose transition-all">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📚</div>
              <h4 className="font-bold text-lg text-km-navy mb-2">Preparar evaluaciones</h4>
              <p className="text-sm text-km-text-700 leading-relaxed">
                Rutas de práctica diseñadas para reforzar conocimientos clave para exámenes.
              </p>
            </div>

            <div className="card group hover:border-km-rose transition-all">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔎</div>
              <h4 className="font-bold text-lg text-km-navy mb-2">Analizar decisiones</h4>
              <p className="text-sm text-km-text-700 leading-relaxed">
                Revisa por qué una opción es la mejor y aprende el razonamiento clínico.
              </p>
            </div>
          </div>
        </section>

        {/* 5) CTA Final - Rediseñado con gradiente rojo */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-km-primary text-white p-8 md:p-12 shadow-km-xl backdrop-blur-xl bg-opacity-95">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-bold mb-3">
                ¿Listo para comenzar?
              </h3>
              <p className="text-lg text-white/90 max-w-xl">
                Regístrate o inicia sesión y comienza a practicar casos clínicos hoy mismo. <strong>Es 100% gratis.</strong>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/casos" className="btn btn-lg bg-white text-km-crimson hover:bg-km-blush hover:scale-105 shadow-km-lg transition-all">
                Comenzar ahora →
              </a>
              <a href="/recursos" className="btn btn-lg bg-transparent border-2 border-white text-white hover:bg-white/10">
                Ver recursos
              </a>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}