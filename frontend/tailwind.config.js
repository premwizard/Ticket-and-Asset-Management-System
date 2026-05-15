// tailwind.config.js
// Tailwind CSS configuration.
// Defines content paths so Tailwind can purge unused styles in production.
// Also sets up a custom design system: colors, fonts, and spacing tokens.

/** @type {import('tailwindcss').Config} */
export default {
  // Scan these files for Tailwind class usage
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  // Enable dark mode via a CSS class on <html>
  darkMode: 'class',

  theme: {
    extend: {
      // ── Custom color palette ──────────────────────────────────────────────
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',  // primary action
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0f172a',
          subtle: '#f8fafc',
          'dark-subtle': '#1e293b',
        },
        border: {
          DEFAULT: '#e2e8f0',
          dark: '#334155',
        },
      },

      // ── Font stack ────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // ── Border radius ─────────────────────────────────────────────────────
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },

      // ── Box shadows ───────────────────────────────────────────────────────
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        panel: '0 10px 40px -10px rgb(0 0 0 / 0.15)',
      },
    },
  },

  plugins: [],
};
