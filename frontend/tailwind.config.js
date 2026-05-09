/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6C63FF', dark: '#5A52D5', light: '#8B84FF' },
        accent: '#FF6584',
        dark: { DEFAULT: '#1A1A2E', 800: '#16213E', 700: '#0F3460' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
