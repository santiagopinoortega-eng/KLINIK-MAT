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
        // 🔴 KLINIK-MAT 4.0: Enhanced Medical Palette
        // Red-centric design honoring Chilean obstetrics tradition
        // Inspired by Osmosis, Medscape, and modern medical platforms
        
        km: {
          // Primary Red Scale (Obstetrics Heritage)
          'red-950': '#450A0A',
          'red-900': '#7F1D1D',
          'red-800': '#991B1B',
          'red-700': '#B91C1C',
          'red-600': '#DC2626',
          'red-500': '#EF4444',
          'red-400': '#F87171',
          'red-300': '#FCA5A5',
          'red-200': '#FECACA',
          'red-100': '#FEE2E2',
          'red-50': '#FEF2F2',
          
          // Secondary Navy Scale (Medical Authority)
          'navy-900': '#0C1E33',
          'navy-800': '#1E293B',
          'navy-700': '#334155',
          'navy-600': '#475569',
          'navy-500': '#64748B',
          'navy-400': '#94A3B8',
          'navy-300': '#CBD5E1',
          'navy-200': '#E2E8F0',
          'navy-100': '#F1F5F9',
          'navy-50': '#F8FAFC',
          
          // Accent Teal (Medical/Clinical)
          'teal-600': '#0D9488',
          'teal-500': '#14B8A6',
          'teal-400': '#2DD4BF',
          'teal-100': '#CCFBF1',
          'teal-50': '#F0FDFA',
          
          // Warm Orange (Human Touch)
          'warm-600': '#C2410C',
          'warm-500': '#EA580C',
          'warm-400': '#FB923C',
          'warm-200': '#FED7AA',
          'warm-100': '#FFEDD5',
          'warm-50': '#FFF7ED',
          
          // Legacy aliases for compatibility
          crimson: '#DC2626',
          cardinal: '#B91C1C',
          rose: '#EF4444',
          terracotta: '#EA580C',
          blush: '#FEE2E2',
          cream: '#FFF7ED',
          teal: '#0D9488',
          navy: '#334155',
        },

        neutral: colors.slate,
        success: colors.emerald,
        danger: colors.red,
        warning: colors.amber,
        info: colors.blue,
      },

      boxShadow: {
        'km-xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'km-sm': '0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'km-md': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'km-lg': '0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'km-xl': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
        'km-2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
        // Red-tinted shadows
        'km-red-sm': '0 2px 8px rgba(220, 38, 38, 0.1)',
        'km-red-md': '0 4px 16px rgba(220, 38, 38, 0.15)',
        'km-red-lg': '0 12px 24px rgba(220, 38, 38, 0.2)',
        'km-red-xl': '0 20px 40px rgba(220, 38, 38, 0.25)',
        // Glass effect
        'glass': '0 8px 32px rgba(31, 38, 135, 0.15)',
        // Legacy
        card: '0 1px 2px rgba(16,24,40,.05), 0 6px 20px -8px rgba(16,24,40,.12)',
        soft: '0 10px 40px -10px rgba(2,6,23,.15)',
      },

      backgroundImage: {
        'gradient-km-primary': 'linear-gradient(135deg, #B91C1C 0%, #DC2626 50%, #EF4444 100%)',
        'gradient-km-primary-hover': 'linear-gradient(135deg, #991B1B 0%, #B91C1C 50%, #DC2626 100%)',
        'gradient-km-secondary': 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
        'gradient-km-hero': 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 60%, #EF4444 100%)',
        'gradient-km-warm': 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%)',
        'gradient-km-subtle': 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%)',
        'gradient-km-success': 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
        'gradient-km-glass': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        // Mesh gradients
        'mesh-primary': 'radial-gradient(at 0% 0%, #FEE2E2 0%, transparent 50%), radial-gradient(at 100% 0%, #DBEAFE 0%, transparent 50%), radial-gradient(at 100% 100%, #FFEDD5 0%, transparent 50%), radial-gradient(at 0% 100%, #F0FDFA 0%, transparent 50%)',
      },

      ringColor: {
        DEFAULT: '#DC2626', // Red for focus rings
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(220, 38, 38, 0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'skeleton': {
          '0%,100%': { backgroundColor: '#F1F5F9' },
          '50%': { backgroundColor: '#E2E8F0' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'pulse-red': 'pulse-red 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'gradient': 'gradient 3s ease infinite',
        'skeleton': 'skeleton 1.2s ease-in-out infinite',
      },
    },
  },
  
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
