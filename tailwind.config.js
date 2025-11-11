// tailwind.config.js
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx,mdx}',
    './pages/**/*.{ts,tsx,js,jsx,mdx}',
    './lib/**/*.{ts,tsx,js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Apple Color Emoji', 'Segoe UI ' ,'Emoji'],
      },

      colors: {
        // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
        brand: colors.rose,     // <-- CAMBIADO DE 'blue' A 'rose' (coral/rosa)
        neutral: colors.slate,
        
        // Colores Semánticos
        success: colors.emerald,
        danger: colors.red,     // Usamos 'red' para que se distinga de 'rose'
        warning: colors.amber,

        surface: {
          0: '#ffffff',
          50: '#f8fafc',
        },
      },

      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.05), 0 6px 20px -8px rgba(16,24,40,.12)',
        soft: '0 10px 40px -10px rgba(2,6,23,.15)',
      },

      ringColor: {
        // --- ¡CORRECCIÓN #2! ---
        DEFAULT: colors.rose[300], // <-- CAMBIADO DE 'blue' A 'rose'
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        skeleton: {
          '0%,100%': { backgroundColor: '#eef2f7' },
          '50%': { backgroundColor: '#e6ebf3' },
        },
      },

      animation: {
        'fade-in': 'fade-in .35s ease-out both',
        skeleton: 'skeleton 1.2s ease-in-out infinite',
      },
    },
  },
  
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
