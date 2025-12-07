// app/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';
// CLERK TEMPORALMENTE DESHABILITADO
// import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { Stethoscope, BookOpen, Award, Heart } from 'lucide-react';

export default function HomePage() {
  // const { isSignedIn } = useUser();
  const isSignedIn = false; // Temporal: simular usuario no logueado
  
  // Hero image - use public asset. If you have a specific hero file, replace the path.
  const heroSrc = '/brand/logo-centro.png';

  return (
    <main className="min-h-screen">
      {/* Hero Section - MÁS COMPACTO */}
      <section className="relative overflow-hidden bg-gradient-km-hero text-white rounded-xl shadow-lg mx-4 md:mx-6 my-4">
        {/* Patrón orgánico de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute top-1/2 right-10 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] items-center gap-8 md:gap-12">
            {/* Contenido principal - Solo título */}
            <div className="space-y-6">
              <div className="mb-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  KLINIK-MAT
                </h1>
              </div>

              <p className="text-base md:text-lg text-white/95 leading-relaxed max-w-lg">
                Simulador de casos clínicos para estudiantes de Obstetricia.
                <br />
                <span className="font-semibold text-km-blush">Practica con casos que simulan la realidad y domina tu profesión.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {/* CLERK DESHABILITADO - Botones temporales */}
                <a href="/areas" className="btn btn-lg bg-white text-km-crimson hover:bg-km-blush hover:scale-105 shadow-km-xl transition-all">
                  📚 Elige el área que quieres practicar →
                </a>
                <a href="#features" className="btn btn-lg bg-transparent border-2 border-white text-white hover:bg-white/10">
                  Conocer más
                </a>
              </div>

              {/* Stats - MÁS COMPACTO Y UNIFORME */}
              <div className="flex gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-km-blush">54</div>
                    <div className="text-white/80 text-xs">Casos Clínicos</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-km-blush">4</div>
                    <div className="text-white/80 text-xs">Áreas Clínicas</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-km-blush">100%</div>
                    <div className="text-white/80 text-xs">Gratis</div>
                  </div>
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
      <div className="container-app py-8 grid gap-12">

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

        {/* 5) Colaboradores - Sección compacta */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-km-primary text-white p-6 md:p-10 shadow-km-xl backdrop-blur-xl bg-opacity-95">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Nuestros Colaboradores
            </h3>
            <p className="text-base text-white/90 max-w-2xl mx-auto mb-6">
              KLINIK-MAT es posible gracias al apoyo de instituciones y organizaciones comprometidas con la educación de los futuros Matrones/as de Chile.
            </p>
            
            {/* Grid de logos de colaboradores - Placeholder para futuro */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-center justify-items-center min-h-[100px]">
              {/* Placeholder para logos futuros */}
              <div className="w-full h-20 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <span className="text-white/50 text-sm">Logo 1</span>
              </div>
              <div className="w-full h-20 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <span className="text-white/50 text-sm">Logo 2</span>
              </div>
              <div className="w-full h-20 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <span className="text-white/50 text-sm">Logo 3</span>
              </div>
              <div className="w-full h-20 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <span className="text-white/50 text-sm">Logo 4</span>
              </div>
            </div>

            <p className="text-sm text-white/70 mt-6">
              ¿Tu institución quiere colaborar? <a href="mailto:contacto@klinik-mat.cl" className="underline hover:text-white transition-colors">Contáctanos</a>
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}