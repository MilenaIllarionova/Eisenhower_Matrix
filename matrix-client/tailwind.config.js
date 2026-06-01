/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#1f2326',
          panel: '#2a2f33',
          card: '#34393d',
        },
        accent: {
          DEFAULT: '#7df0e2',
          dark: '#3fb8ad',
        },
        brand: {
          mintFrom: '#c5f0a4',
          mintTo: '#79e0c8',
        },
        quadrant: {
          urgentImportant: '#f7c1c5',
          importantNotUrgent: '#fbeaa4',
          urgentNotImportant: '#b9c8f1',
          notUrgent: '#bee8b5',
        },
      },
      fontFamily: {
        brand: ['"Pacifico"', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(155deg, #c5f0a4 0%, #79e0c8 100%)',
      },
    },
  },
  plugins: [],
};
