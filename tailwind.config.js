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
        // 🔴 KLINIK-MAT: Identidad Obstetricia Chilena - Rojo + Útero
        km: {
          // Primarios - Rojo médico profesional
          crimson: '#C41E3A',    // Rojo sangre/útero - Principal
          cardinal: '#8B0000',   // Rojo oscuro - Títulos y énfasis
          rose: '#E63946',       // Rojo vibrante - CTAs y acciones
          // Secundarios - Tonos orgánicos/cálidos
          terracotta: '#D4756F', // Terracota suave - Acentos
          blush: '#FFE5E5',      // Rosa pálido - Fondos suaves
          cream: '#FFF8F5',      // Crema cálido - Fondo principal
          // Acentos clínicos
          teal: '#0D9488',       // Verde azulado médico - Info/success
          navy: '#1E3A5F',       // Azul marino - Texto oscuro profesional
          // Texto
          'text-900': '#1A1A1A', // Negro suave - Texto principal
          'text-700': '#4A5568', // Gris medio - Texto secundario
          'text-500': '#718096', // Gris claro - Texto terciario
          // Superficies
          'surface-1': '#FFFFFF',  // Blanco puro - Cards
          'surface-2': '#FFF8F5',  // Crema - Fondo página
          'surface-3': '#FFE5E5',  // Rosa pálido - Destacados
        },

        neutral: colors.slate,
        success: colors.emerald,
        danger: colors.red,
        warning: colors.amber,
      },

      boxShadow: {
        'km-sm': '0 2px 8px rgba(196, 30, 58, 0.08)',
        'km-md': '0 4px 16px rgba(196, 30, 58, 0.12)',
        'km-lg': '0 12px 32px rgba(196, 30, 58, 0.16)',
        'km-xl': '0 20px 48px rgba(196, 30, 58, 0.2)',
        card: '0 1px 2px rgba(16,24,40,.05), 0 6px 20px -8px rgba(16,24,40,.12)',
        soft: '0 10px 40px -10px rgba(2,6,23,.15)',
      },

      backgroundImage: {
        'gradient-km-primary': 'linear-gradient(135deg, #C41E3A 0%, #E63946 100%)',
        'gradient-km-warm': 'linear-gradient(135deg, #D4756F 0%, #FFE5E5 100%)',
        'gradient-km-hero': 'linear-gradient(135deg, rgba(196,30,58,0.95) 0%, rgba(139,0,0,0.85) 100%)',
      },

      ringColor: {
        DEFAULT: '#C41E3A', // Rojo crimson para anillos de foco
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        skeleton: {
          '0%,100%': { backgroundColor: '#FFE5E5' },
          '50%': { backgroundColor: '#FFF8F5' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        skeleton: 'skeleton 1.2s ease-in-out infinite',
      },
    },
  },
  
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
