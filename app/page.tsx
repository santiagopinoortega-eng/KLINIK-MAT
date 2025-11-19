// app/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { auth } from '@clerk/nextjs/server';

export default async function HomePage() {
  const { userId } = auth();
  const forceRedirect = process.env.NODE_ENV === 'production' || process.env.FORCE_REDIRECT_TO_CASOS === 'true';
  if (forceRedirect && userId) redirect('/casos');

  // Hero image - use public asset. If you have a specific hero file, replace the path.
  const heroSrc = '/brand/logo-centro.png';

  return (
    <main className="min-h-screen bg-[var(--km-surface-2)]">
      {/* Container: centers content and defines max width */}
      <div className="container-app py-12 grid gap-16">

              {/* 1) HERO - compacto y con tarjeta derecha */}
              <section className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 md:gap-10 py-6">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-extrabold leading-tight" style={{ color: 'var(--km-deep)' }}>
                    KLINIK-MAT
                  </h1>
                  <p className="text-lg text-[var(--km-text-700)] max-w-prose">Simulador de casos clínicos para estudiantes de Obstetricia. Practica con escenarios reales, recibe feedback docente y prepárate para evaluaciones.</p>

                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <a href="/casos" className="btn btn-primary btn-lg">Comenzar ahora</a>
                    <a href="/recursos" className="btn btn-secondary">Recursos</a>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-full max-w-md p-6 rounded-[var(--km-radius)] card">
                    <div className="relative w-full h-40 md:h-44">
                      <Image src={heroSrc} alt="KLINIK-MAT" fill style={{ objectFit: 'contain' }} priority />
                    </div>
                    <div className="mt-4 text-sm text-[var(--km-text-700)]">Accede a casos interactivos, guías rápidas y feedback estructurado para mejorar tu toma de decisiones clínicas.</div>
                  </div>
                </div>
              </section>

        {/* 2) ABOUT / What is KLINIK-MAT */}
        <section className="bg-[var(--km-surface-1)] rounded-[var(--km-radius)] p-6 shadow-sm">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--km-text-900)' }}>¿Qué es KLINIK‑MAT?</h2>
          <p className="text-[var(--km-text-700)] mt-3 max-w-3xl">KLINIK‑MAT es una plataforma diseñada para que estudiantes practiquen casos clínicos reales de Obstetricia con feedback inmediato y recursos relacionados. Cada caso está pensado para entrenar toma de decisiones, priorización y manejo clínico.</p>
        </section>

        {/* 3) ¿Qué puedes hacer en KLINIK‑MAT? (reemplaza 'Casos destacados') */}
        <section className="mt-2">
          <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--km-deep)' }}>¿Qué puedes hacer en KLINIK‑MAT?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 card">
              <div className="flex items-start gap-3">
                <div className="text-[var(--km-deep)] text-2xl">🩺</div>
                <div>
                  <h4 className="font-semibold">Practicar casos clínicos</h4>
                  <p className="text-sm text-[var(--km-text-700)] mt-1">Simula la atención con decisiones interactivas y escenarios reales.</p>
                </div>
              </div>
            </div>

            <div className="p-4 card">
              <div className="flex items-start gap-3">
                <div className="text-[var(--km-deep)] text-2xl">💬</div>
                <div>
                  <h4 className="font-semibold">Recibir feedback inmediato</h4>
                  <p className="text-sm text-[var(--km-text-700)] mt-1">Explicaciones docentes para cada decisión tomada durante el caso.</p>
                </div>
              </div>
            </div>

            <div className="p-4 card">
              <div className="flex items-start gap-3">
                <div className="text-[var(--km-deep)] text-2xl">📚</div>
                <div>
                  <h4 className="font-semibold">Preparar tus evaluaciones</h4>
                  <p className="text-sm text-[var(--km-text-700)] mt-1">Rutas de práctica diseñadas para reforzar conocimientos clave para exámenes.</p>
                </div>
              </div>
            </div>

            <div className="p-4 card">
              <div className="flex items-start gap-3">
                <div className="text-[var(--km-deep)] text-2xl">🔎</div>
                <div>
                  <h4 className="font-semibold">Analizar decisiones</h4>
                  <p className="text-sm text-[var(--km-text-700)] mt-1">Revisa por qué una opción es la mejor y aprende el razonamiento detrás.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4) (Removido por preferencia del diseño) */}

        {/* 5) Final CTA */}
        <section className="bg-[var(--km-petrol)]/6 rounded-[var(--km-radius)] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--km-text-900)' }}>Listo para comenzar?</h3>
            <p className="text-sm text-[var(--km-text-700)] mt-1">Regístrate o inicia sesión y comienza a practicar casos hoy mismo.</p>
          </div>
          <div className="flex gap-3">
            <a href="/casos" className="btn btn-primary">Comenzar ahora</a>
            <a href="/casos" className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm border" style={{ borderColor: 'rgba(14,107,103,0.12)', color: 'var(--km-petrol)' }}>Ver casos</a>
          </div>
        </section>

      </div>
    </main>
  );
}