/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores principais (roxo)
        primary: {
          DEFAULT: '#7101B1',    // tech-primary
          hover: '#7101B1',      // tech-primary-hover
          medium: '#AF4DE7',     // tech-primary-medium
          light: '#D199F1',      // tech-primary-light
        },
        
        // Cores secundárias (azul)
        secondary: {
          DEFAULT: '#4E8BFE',    // tech-secondary
          hover: '#3E6FCB',      // tech-secondary-hover
          medium: '#83AEFE',     // tech-secondary-medium
          light: '#B8D1FF',      // tech-secondary-light
        },
        
        // Cores neutras escuras
        black: {
          DEFAULT: '#2A0042',    // tech-black
          medium: '#550185',     // tech-black-medium
          light: '#D4CCD9',      // tech-black-light
        },
        
        // Cores neutras claras
        white: {
          DEFAULT: '#FFFFFF',    // tech-white
          medium: '#F4EBF8',     // tech-white-medium
          light: '#DCE8FF',      // tech-white-light
        },
        
        // Cores de estado (mantendo as existentes)
        success: '#3BD98D',
        warning: '#f59e0b',
        error: '#EB3F68',
      },
      fontFamily: {
        nunito: ['Nunito', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '4xl': ['3.5rem', { lineHeight: '1.2', fontWeight: '700' }], // h1
        '3xl': ['3rem', { lineHeight: '1.3', fontWeight: '700' }],   // h2
        '2xl': ['2.5rem', { lineHeight: '1.4', fontWeight: '700' }], // h3
        'xl': ['2rem', { lineHeight: '1.5' }],                       // lg
        'lg': ['1.5rem', { lineHeight: '1.6' }],                     // md
        'base': ['1rem', { lineHeight: '1.6' }],                     // sm
      }
    },
  },
  plugins: [],
}