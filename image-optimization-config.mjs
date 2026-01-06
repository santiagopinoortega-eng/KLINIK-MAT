// next.config.mjs - AGREGAR CONFIGURACIÓN DE IMÁGENES

/**
 * 🔥 CONFIGURACIÓN DE OPTIMIZACIÓN DE IMÁGENES
 * 
 * Agregar al archivo next.config.mjs existente:
 */

export const imageOptimizationConfig = {
  images: {
    // Dominios permitidos para imágenes externas
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com', // Si usas Vercel Blob
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com', // Si usas Cloudinary
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Si usas Supabase Storage
      },
      {
        protocol: 'https',
        hostname: 'klinikmat.cl', // Tu dominio
      },
      {
        protocol: 'https',
        hostname: '**.klinikmat.cl', // Subdominios
      },
    ],
    
    // 🔥 Formatos de imagen optimizados
    formats: ['image/webp', 'image/avif'], // WebP y AVIF (mejor compresión)
    
    // 🔥 Tamaños de dispositivo para responsive
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // 🔥 Minimizar imágenes para PWA
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 días de caché
    
    // 🔥 Desactivar optimización en desarrollo (más rápido)
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

/**
 * INSTRUCCIONES DE USO:
 * 
 * 1. Agregar esta config a tu next.config.mjs existente:
 * 
 * import { imageOptimizationConfig } from './image-optimization-config.mjs';
 * 
 * const nextConfig = {
 *   ...existingConfig,
 *   ...imageOptimizationConfig,
 * };
 * 
 * 2. Reemplazar todos los <img> por <OptimizedImage>:
 * 
 * ANTES:
 * <img src={caso.imagenes[0].url} alt="..." />
 * 
 * DESPUÉS:
 * import { CaseImage } from '@/app/components/OptimizedImage';
 * <CaseImage src={caso.imagenes[0].url} alt="..." />
 * 
 * 3. Beneficios inmediatos:
 * - 80-85% reducción de tamaño (500KB → 80KB)
 * - Lazy loading automático
 * - WebP/AVIF automático
 * - Blur placeholder
 */
