/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Manrope', 'sans-serif'], arabic: ['Noto Naskh Arabic', 'serif'] },
      colors: { ink: '#222222', forest: '#0F5132', gold: '#C9A227', parchment: '#F7F7F5' },
    },
  },
  plugins: [],
}
