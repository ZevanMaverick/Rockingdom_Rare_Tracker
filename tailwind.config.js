/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFF9F0',
          100: '#FFF3E0',
          200: '#FFE4C4',
          300: '#FFD8A8',
        },
        medal: {
          gold: '#FFD700',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [],
}