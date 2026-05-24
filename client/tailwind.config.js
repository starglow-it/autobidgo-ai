/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f6f8ff',
          100: '#eef2ff',
          200: '#dfe7ff',
          300: '#c5d3ff',
          400: '#9ab2ff',
          500: '#6b87ff',
          600: '#4c63f0',
          700: '#3b4ad1',
          800: '#303ea8',
          900: '#2b3686'
        }
      }
    }
  },
  plugins: []
};
