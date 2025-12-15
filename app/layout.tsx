// app/layout.tsx
import './globals.css'; // Lee los estilos base (fondo coral, etc.)
import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, Poppins } from 'next/font/google';
import dynamic from 'next/dynamic';
import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Importa tu Header (la ruta ./ es correcta)
const Header = dynamic(() => import('./components/Header'), { ssr: true });
const Footer = dynamic(() => import('./components/Footer'), { ssr: true });
const CsrfInitializer = dynamic(() => import('./components/CsrfInitializer'), { ssr: false });
const SidebarWrapper = dynamic(() => import('./components/SidebarWrapper'), { ssr: false });
const CookieBanner = dynamic(() => import('./components/CookieBanner'), { ssr: false });

import { WebsiteStructuredData, OrganizationStructuredData, EducationalOrganizationStructuredData } from './components/StructuredData';
import { FavoritesProvider } from './context/FavoritesContext';
import { SidebarProvider } from './context/SidebarContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

// Metadata optimizado para SEO
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://klinik-mat.vercel.app'),
  
  // Título y descripción optimizados
  title: {
    default: 'KLINIK-MAT — Plataforma de Casos Clínicos de Obstetricia y Neonatología',
    template: '%s | KLINIK-MAT',
  },
  description: 'Plataforma educativa con casos clínicos interactivos para estudiantes de Obstetricia. Practica razonamiento clínico en ITS, anticoncepción, embarazo, parto y neonatología. Basado en protocolos MINSAL.',
  
  // Keywords SEO
  keywords: [
    'casos clínicos obstetricia',
    'casos clínicos matrona',
    'educación obstetricia',
    'razonamiento clínico',
    'simulación clínica',
    'MINSAL',
    'ITS',
    'anticoncepción',
    'embarazo',
    'parto',
    'neonatología',
    'estudiantes obstetricia',
    'matrona chile',
    'casos clínicos interactivos',
  ],
  
  // Autores y creadores
  authors: [{ name: 'KLINIK-MAT' }],
  creator: 'KLINIK-MAT',
  publisher: 'KLINIK-MAT',
  
  // Configuración de robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Canonical URLs
  alternates: {
    canonical: '/',
  },
  
  // Open Graph optimizado
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: '/',
    siteName: 'KLINIK-MAT',
    title: 'KLINIK-MAT — Casos Clínicos de Obstetricia',
    description: 'Plataforma educativa con casos clínicos interactivos para estudiantes de Obstetricia. Practica razonamiento clínico basado en protocolos MINSAL.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KLINIK-MAT - Casos Clínicos de Obstetricia',
      },
    ],
  },
  
  // Twitter Card optimizado
  twitter: {
    card: 'summary_large_image',
    title: 'KLINIK-MAT — Casos Clínicos de Obstetricia',
    description: 'Plataforma educativa con casos clínicos interactivos para estudiantes de Obstetricia.',
    images: ['/og-image.png'],
    creator: '@klinikmat',
  },
  
  // Verificación de propietarios
  verification: {
    // google: 'tu-codigo-google-search-console',
    // yandex: 'tu-codigo-yandex',
  },
  
  // Categoría
  category: 'education',
};

// Tu componente Layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider 
      localization={esES}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="es" className={`${inter.variable} ${poppins.variable} scroll-smooth`}>
        <head>
          {/* Structured Data para SEO */}
          <WebsiteStructuredData />
          <OrganizationStructuredData />
          <EducationalOrganizationStructuredData />
        </head>
        
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

        {/* Header - Minimal */}
        <Header />

        {/* Sidebar - Contextual */}
        <SidebarProvider>
          <SidebarWrapper />

          {/* Contenido - Adjusted for sidebar */}
          <FavoritesProvider>
            <main id="contenido" className="min-h-[70vh] animate-fade-in transition-all duration-300" style={{ marginLeft: 'var(--sidebar-width, 0px)' }}>
              {children}
            </main>
          </FavoritesProvider>
        </SidebarProvider>

        {/* Footer con nuevo componente */}
        <Footer />

        {/* Cookie Banner */}
        <CookieBanner />

        {/* CSRF Token Initialization */}
        <CsrfInitializer />

        {/* Analytics */}
        <Analytics />
        <SpeedInsights />
      </body>
      </html>
    </ClerkProvider>
  );
}
