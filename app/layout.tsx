// app/layout.tsx
import './globals.css'; // Lee los estilos base (fondo coral, etc.)
import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';

// Importa tu Header (la ruta ./ es correcta)
const Header = dynamic(() => import('./components/Header'), { ssr: true });
const Footer = dynamic(() => import('./components/Footer'), { ssr: true });

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Tu objeto Metadata (asegúrate de que el tipo 'Metadata' esté importado)
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://klinik-mat.example'),
  title: 'KLINIK-MAT — Casos Clínicos',
  description: 'Simulador de razonamiento clínico en Obstetricia...',
  keywords: ['obstetricia','casos clínicos','MINSAL','ITS','anticoncepción'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'KLINIK-MAT — Casos Clínicos',
    description: 'Entrena tu razonamiento clínico en Obstetricia.',
    images: ['/og.png'],
  },
  twitter: { card: 'summary_large_image' },
};

// Tu componente Layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es" className={`${inter.variable} scroll-smooth`}>
        {/* El body ya recibe estilos (fondo/color) desde globals.css */}
        <body className="bg-gradient-to-br from-[rgba(107,15,15,0.04)] to-[rgba(255,182,166,0.04)] bg-[var(--km-blush)]">
        
        {/* Skip link accesible (color brand) */}
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 z-50 rounded-lg px-3 py-2 text-sm font-medium text-white shadow-focus"
          style={{ background: 'var(--km-primary)' }}
        >
          Ir al contenido
        </a>

        {/* Header (estilo vidrio) */}
        <div className="sticky top-0 z-40 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 border-b border-white/80 shadow-sm">
          <Header />
        </div>

        {/* Contenido (clase .container-app) */}
        <main id="contenido" className="min-h-[70vh] animate-fade-in">
          {children}
        </main>

        {/* Footer con nuevo componente */}
        <Footer />
      </body>
      </html>
    </ClerkProvider>
  );
}
