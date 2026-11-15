/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d9f0ff',
          200: '#bce5ff',
          300: '#8ed5ff',
          400: '#59bbff',
          500: '#329aff',
          600: '#1b7af5',
          700: '#1463e1',
          800: '#1751b6',
          900: '#19478f',
          950: '#142c57',
        },
        accent: {
          50: '#fffbeb',
          100: '#fff3c7',
          200: '#ffe589',
          300: '#ffd24d',
          400: '#ffbb22',
          500: '#f9990a',
          600: '#dd7306',
          700: '#b75007',
          800: '#943e0c',
          900: '#7a330d',
          950: '#461902',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae3',
          300: '#b0b9ca',
          400: '#8493ab',
          500: '#647591',
          600: '#4f5d77',
          700: '#404b61',
          800: '#374052',
          900: '#0f172a',
          950: '#0a0f1c',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'star-pop': 'starPop 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        starPop: {
          '0%': { transform: 'scale(0.8)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
