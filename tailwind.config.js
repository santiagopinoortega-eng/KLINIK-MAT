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
        // KLINIK-MAT (Red-first) palette tokens
        km: {
          deep: '#6B0F0F',        // Deep red (titles, strong accents)
          primary: '#B72B2B',     // Primary red (buttons, accents)
          terracotta: '#C86A55',  // Mid terracotta
          coral: '#FFB6A6',       // Coral light for accents/background
          blue: '#0E6BB7',       // Clinical blue accent (logo-inspired)
          blush: '#FFF2F1',       // Very soft blush for large backgrounds
          'text-900': '#0F1724',  // dark text
          'text-700': '#4B5563',  // muted text
          'surface-1': '#FFFFFF',
          'surface-2': '#FBF7F6',
        },

        neutral: colors.slate,
        success: colors.emerald,
        danger: colors.red,
        warning: colors.amber,
      },

      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.05), 0 6px 20px -8px rgba(16,24,40,.12)',
        soft: '0 10px 40px -10px rgba(2,6,23,.15)',
      },

      ringColor: {
        DEFAULT: '#FFB6A6', // soft coral ring by default
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
