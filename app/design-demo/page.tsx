// Demo component showcasing the new design system
// Access at /design-demo

'use client';

import React from 'react';

export default function DesignSystemDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-km-navy-50 via-white to-km-red-50 py-12">
      <div className="container-app space-y-12">
        {/* Header */}
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient-red">
            KLINIK-MAT Design System 4.0
          </h1>
          <p className="text-lg text-km-navy-600 max-w-2xl mx-auto">
            Medical excellence palette inspired by modern educational platforms
          </p>
        </div>

        {/* Color Palette */}
        <section className="card-glass animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <h2 className="text-2xl font-bold mb-6 text-km-red-700">Color Palette</h2>
          
          {/* Red Scale */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-km-navy-600 mb-3">Primary Red (Obstetrics Heritage)</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
                <div key={weight} className="text-center">
                  <div 
                    className={`h-16 rounded-lg shadow-md mb-2 bg-km-red-${weight}`}
                    style={{backgroundColor: `var(--km-red-${weight})`}}
                  />
                  <span className="text-xs text-km-navy-500">{weight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navy Scale */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-km-navy-600 mb-3">Secondary Navy (Medical Authority)</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
                <div key={weight} className="text-center">
                  <div 
                    className={`h-16 rounded-lg shadow-md mb-2`}
                    style={{backgroundColor: `var(--km-navy-${weight})`}}
                  />
                  <span className="text-xs text-km-navy-500">{weight}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="card animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <h2 className="text-2xl font-bold mb-6 text-km-red-700">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn btn-primary">
              Primary Button
            </button>
            <button className="btn btn-secondary">
              Secondary Button
            </button>
            <button className="btn btn-primary btn-lg">
              Large Primary
            </button>
            <button className="btn btn-primary" disabled>
              Disabled
            </button>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <h2 className="text-2xl font-bold text-km-red-700">Cards & Effects</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card hover-lift">
              <h3 className="text-xl font-bold text-km-navy-800 mb-2">Standard Card</h3>
              <p className="text-km-navy-600">
                Hover me to see elevation effect with top accent bar
              </p>
            </div>

            <div className="card-glass hover-lift">
              <h3 className="text-xl font-bold text-km-navy-800 mb-2">Glass Card</h3>
              <p className="text-km-navy-600">
                Glassmorphism effect with backdrop blur
              </p>
            </div>

            <div className="card animate-pulse-red">
              <h3 className="text-xl font-bold text-km-red-700 mb-2">Pulsing Card</h3>
              <p className="text-km-navy-600">
                Red pulse animation for attention
              </p>
            </div>
          </div>
        </section>

        {/* Chips/Badges */}
        <section className="card animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <h2 className="text-2xl font-bold mb-6 text-km-red-700">Difficulty Chips</h2>
          <div className="flex flex-wrap gap-3">
            <span className="chip chip-diff-1">Baja dificultad</span>
            <span className="chip chip-diff-2">Dificultad media</span>
            <span className="chip chip-diff-3">Alta dificultad</span>
          </div>
        </section>

        {/* Gradients */}
        <section className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          <h2 className="text-2xl font-bold text-km-red-700">Gradients</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-32 rounded-xl bg-gradient-km-primary flex items-center justify-center text-white font-bold shadow-km-red-lg">
              Primary Gradient
            </div>
            <div className="h-32 rounded-xl bg-gradient-km-hero flex items-center justify-center text-white font-bold shadow-km-red-lg">
              Hero Gradient
            </div>
            <div className="h-32 rounded-xl bg-gradient-km-success flex items-center justify-center text-white font-bold shadow-km-lg">
              Success Gradient
            </div>
          </div>
        </section>

        {/* Shadows */}
        <section className="card animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <h2 className="text-2xl font-bold mb-6 text-km-red-700">Shadow System</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-km-sm text-center">
              <span className="text-sm font-semibold text-km-navy-600">SM</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-km-md text-center">
              <span className="text-sm font-semibold text-km-navy-600">MD</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-km-lg text-center">
              <span className="text-sm font-semibold text-km-navy-600">LG</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-km-xl text-center">
              <span className="text-sm font-semibold text-km-navy-600">XL</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-km-navy-600 mb-3">Red-Tinted Shadows</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-km-red-sm text-center">
                <span className="text-sm font-semibold text-km-red-600">SM</span>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-km-red-md text-center">
                <span className="text-sm font-semibold text-km-red-600">MD</span>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-km-red-lg text-center">
                <span className="text-sm font-semibold text-km-red-600">LG</span>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-km-red-xl text-center">
                <span className="text-sm font-semibold text-km-red-600">XL</span>
              </div>
            </div>
          </div>
        </section>

        {/* Animations */}
        <section className="card animate-fade-in-up" style={{animationDelay: '0.7s'}}>
          <h2 className="text-2xl font-bold mb-6 text-km-red-700">Animations</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-km-red-50 rounded-lg animate-fade-in text-center">
              <span className="text-sm font-semibold text-km-navy-600">Fade In</span>
            </div>
            <div className="p-4 bg-km-red-50 rounded-lg animate-fade-in-up text-center">
              <span className="text-sm font-semibold text-km-navy-600">Fade In Up</span>
            </div>
            <div className="p-4 bg-km-red-50 rounded-lg animate-scale-in text-center">
              <span className="text-sm font-semibold text-km-navy-600">Scale In</span>
            </div>
            <div className="p-4 bg-km-red-50 rounded-lg animate-pulse-soft text-center">
              <span className="text-sm font-semibold text-km-navy-600">Pulse Soft</span>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="card animate-fade-in-up" style={{animationDelay: '0.8s'}}>
          <h2 className="text-2xl font-bold mb-6 text-km-red-700">Typography</h2>
          <div className="space-y-4">
            <h1 className="text-km-navy-800">H1: Main Heading (Navy 800)</h1>
            <h2 className="text-km-red-700">H2: Section Heading (Red 700)</h2>
            <h3 className="text-km-navy-700">H3: Subsection Heading (Navy 700)</h3>
            <p className="text-km-navy-700">
              Paragraph: Default body text with comfortable line height and navy color for readability.
            </p>
            <p className="text-km-navy-600">
              Secondary text: Slightly lighter for less important content.
            </p>
            <p className="text-km-navy-500">
              Tertiary text: Even lighter for captions and metadata.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
