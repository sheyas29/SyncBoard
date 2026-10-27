/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          ground: '#f1f2fa',
          ink: '#383139',
          'ink-secondary': '#48404b',
          pink: '#f6a3ca',
          mint: '#c0efdc',
          lavender: '#ded0f9',
          yellow: '#f9e7a8',
          blue: '#c5e5fb',
          cream: '#fffdf7',
        },
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'sans-serif'],
      },
      borderRadius: {
        cushion: '38px',
        tray: '48px',
        disclosure: '25px',
      },
    },
  },
  plugins: [],
}
