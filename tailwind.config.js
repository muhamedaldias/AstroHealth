/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF7F7',
          100: '#DCEDEE',
          200: '#C2E0E1',
          300: '#8CC0C2',
          400: '#2D7D82',
          500: '#236A6F',
          600: '#174A55',
          700: '#0D223A',
          800: '#081726',
        },
        accent: {
          light: '#C2E0E1',
          DEFAULT: '#2D7D82',
          deep: '#236A6F',
          navy: '#0D223A',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(13, 34, 58, 0.06), 0 1px 3px -1px rgba(13, 34, 58, 0.04)',
        'soft-md': '0 6px 20px -4px rgba(13, 34, 58, 0.10), 0 2px 6px -2px rgba(13, 34, 58, 0.05)',
        'soft-lg': '0 12px 30px -6px rgba(13, 34, 58, 0.12), 0 4px 10px -3px rgba(13, 34, 58, 0.06)',
        'teal-glow': '0 0 18px -2px rgba(45, 125, 130, 0.35)',
      },
      keyframes: {
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 14s linear infinite',
      },
    },
  },
  plugins: [],
};
