/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Civ VI-inspired palette
        civ: {
          parchment: '#f4e9c8',
          paper: '#fbf5e2',
          ink: '#1b1a17',
          ocean: '#1f4d6b',
          oceanDeep: '#15334a',
          gold: '#e0a82e',
          goldDark: '#b88820',
          science: '#3aa6d0',
          culture: '#a86bd1',
          production: '#b97a3a',
          food: '#7cb342',
          faith: '#e6d9b8',
          amenity: '#e8b34d',
          military: '#c8423c',
          freedom: '#3a8ed1',
          order: '#c0392b',
          autocracy: '#6b4a8c',
          land: '#d9c79a',
          landAlt: '#cbb685',
          border: '#3b2a14',
        },
      },
      fontFamily: {
        display: ['"Trajan Pro"', 'Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        civ: '0 4px 0 0 rgba(0,0,0,0.35), 0 10px 20px -8px rgba(0,0,0,0.5)',
        civInset: 'inset 0 2px 8px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        hex: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 100'><polygon points='28,2 54,17 54,49 28,64 2,49 2,17' fill='none' stroke='rgba(27,26,23,0.12)' stroke-width='1.5'/></svg>\")",
      },
    },
  },
  plugins: [],
}
