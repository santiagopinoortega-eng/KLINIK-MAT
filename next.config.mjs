// next.config.mjs
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// Si ya tienes dominio propio, ponlo aquí (sin la barra final)
const PROD_ORIGIN = process.env.PROD_ORIGIN || 'https://tu-dominio.cl';

// Dominios externos que realmente usas (ajusta si agregas otros)
const CONNECT_SRC = [
  "'self'",
  'https:',           // permite APIs externas sobre HTTPS (p. ej. Neon)
  'wss:',             // websockets si los usas
  'https://*.clerk.accounts.dev', // Clerk
].join(' ');

const IMG_SRC = [
  "'self'",
  'data:',
  'blob:',
  'https:',
  'https://*.clerk.accounts.dev', // Clerk avatars
].join(' ');

const FONT_SRC = ["'self'", 'https:', 'data:'].join(' ');

// --- CAMBIO CLAVE: Solución al error 'unsafe-eval' ---
// En desarrollo, Next.js necesita 'unsafe-eval' para el Fast Refresh.
// Lo permitimos solo si NO estamos en producción.
const SCRIPT_SRC_BASE = ["'self'", "'unsafe-inline'", 'https://*.clerk.accounts.dev'];
if (!isProd) {
  SCRIPT_SRC_BASE.push("'unsafe-eval'");
}
const SCRIPT_SRC = SCRIPT_SRC_BASE.join(' ');
// --- FIN DEL CAMBIO ---

const STYLE_SRC  = ["'self'", "'unsafe-inline'", 'https://*.clerk.accounts.dev'].join(' ');
const FRAME_SRC  = ["'self'", 'https://*.clerk.accounts.dev'].join(' ');

// Construimos la CSP en una sola línea (evita saltos que algunos navegadores no aman)
const CSP = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `frame-ancestors 'none'`,
  `img-src ${IMG_SRC}`,
  `font-src ${FONT_SRC}`,
  `script-src ${SCRIPT_SRC}`, // <- Esta línea ahora usa la variable corregida
  `style-src ${STYLE_SRC}`,
  `connect-src ${CONNECT_SRC}`,
  `frame-src ${FRAME_SRC}`,
  `object-src 'none'`,
  `form-action 'self'`,
  `upgrade-insecure-requests`, // seguro en prod; ignoran en dev http
].join('; ');

const securityHeaders = [
  // Política de contenido (XSS, inyecciones, etc.)
  { key: 'Content-Security-Policy', value: CSP },

  // No adivines tipos MIME
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // Anti-clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },

  // Política de permisos (apaga cosas por defecto)
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },

  // Referer prudente
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // Aislamiento
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

// HSTS solo en producción y bajo HTTPS real
if (isProd) {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  });
}

const nextConfig = {
  reactStrictMode: true,

  // Permitir Server Actions en GitHub Codespaces
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.app.github.dev', // GitHub Codespaces
      ],
    },
  },

  async headers() {
    return [
      // 1) Seguridad para todo
      { source: '/:path*', headers: securityHeaders },

      // 2) CORS SOLO para tu API pública (GET/OPTIONS)
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: isProd ? PROD_ORIGIN : '*',
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Max-Age', value: '600' },
        ],
      },
    ];
  },
};

export default nextConfig;
