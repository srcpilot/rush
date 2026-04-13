/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#141414',
        elevated: '#1a1a1a',
        border: '#262626',
        text: '#fafaf5',
        muted: '#a3a3a0',
        gold: '#d4a853',
        cream: '#f5f0e8',
      },
    },
  },
  plugins: [],
}
