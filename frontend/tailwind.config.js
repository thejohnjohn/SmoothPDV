/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Roxo institucional — âncoras do Style Guide: 600 (#7101B1), 400 (#AF4DE7), 300 (#D199F1).
        // Tons 50–200 e 500/700–900 derivados por interpolação a partir das âncoras.
        primary: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D199F1',
          400: '#AF4DE7',
          500: '#9418CC',
          600: '#7101B1',
          700: '#5B0190',
          800: '#43006B',
          900: '#2A0042',
        },

        // Azul secundário — âncoras: 500 (#4E8BFE), 400 (#83AEFE), 300 (#B8D1FF), 600 (#3E6FCB).
        secondary: {
          50: '#F1F6FF',
          100: '#E3EDFF',
          200: '#D0E0FF',
          300: '#B8D1FF',
          400: '#83AEFE',
          500: '#4E8BFE',
          600: '#3E6FCB',
          700: '#2F569E',
        },

        // Estados semânticos — 500 preserva os valores atuais; 600/700 são variantes de texto/ênfase.
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          300: '#6EE7B7',
          500: '#3BD98D',
          600: '#1FA66A',
          700: '#157F52',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          50: '#FDF2F5',
          100: '#FCE7EC',
          300: '#F5A3B7',
          500: '#EB3F68',
          600: '#C42A50',
          700: '#9E1F3F',
        },

        // Superfícies e estrutura.
        canvas: '#F7F5F9',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#FAF9FB',
        },
        ink: {
          DEFAULT: '#2A0042',
          muted: '#6E6478',
        },
        line: {
          DEFAULT: '#E7E2EB',
          strong: '#D4CCD9',
        },
      },
      fontFamily: {
        nunito: ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(42 0 66 / 0.04), 0 1px 3px 0 rgb(42 0 66 / 0.08)',
        dropdown: '0 4px 12px rgb(42 0 66 / 0.12)',
        modal: '0 24px 48px rgb(42 0 66 / 0.24)',
      },
    },
  },
  plugins: [],
}
