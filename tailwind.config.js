/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // Apple-leaning neutral surfaces
        surface: {
          1: 'rgb(var(--surface-1) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
          3: 'rgb(var(--surface-3) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted:   'rgb(var(--ink-muted) / <alpha-value>)',
          subtle:  'rgb(var(--ink-subtle) / <alpha-value>)',
        },
        line: 'rgb(var(--line) / <alpha-value>)',
        ocean: {
          DEFAULT: 'rgb(var(--ocean) / <alpha-value>)',
          deep:    'rgb(var(--ocean-deep) / <alpha-value>)',
        },
        // Yield + functional accents (constant across light/dark — they encode info)
        yield: {
          gold:       '#d4a017',
          science:    '#3aa6d0',
          culture:    '#a86bd1',
          production: '#b97a3a',
          food:       '#7cb342',
          faith:      '#c9a14a',
          amenity:    '#e8b34d',
          military:   '#c8423c',
        },
        // Civ accent (used sparingly — only for Civ Score callout + era badge)
        civgold: {
          DEFAULT: '#d4a017',
          bg: 'rgb(var(--civgold-bg) / <alpha-value>)',
          ring: 'rgb(var(--civgold-ring) / <alpha-value>)',
        },
        // Ideology zone tints (used in PoliticalCompass)
        zone: {
          freedom:   '#3a8ed1',
          order:     '#a86bd1',
          autocracy: '#c0392b',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro Display',
          'Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif',
        ],
      },
      boxShadow: {
        // Apple-style layered, soft shadows
        card:   '0 0 0 1px rgb(var(--line) / 0.5), 0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -8px rgb(0 0 0 / 0.12)',
        cardLg: '0 0 0 1px rgb(var(--line) / 0.5), 0 4px 8px rgb(0 0 0 / 0.05), 0 24px 48px -12px rgb(0 0 0 / 0.18)',
        pop:    '0 0 0 1px rgb(var(--line) / 0.7), 0 4px 16px rgb(0 0 0 / 0.10), 0 16px 48px -8px rgb(0 0 0 / 0.20)',
        glow:   '0 0 0 4px rgb(212 160 23 / 0.18)',
      },
      backdropBlur: {
        glass: '20px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
}
