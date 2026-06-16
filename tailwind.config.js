/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        night: {
          DEFAULT: '#1a1a3e',
          deep: '#0a0a2e',
          mid: '#0d0d35',
        },
        star: '#ffd97d',
        cloud: '#c4b5fd',
        seaside: '#7dd3fc',
        forest: '#86efac',
      },
      fontFamily: {
        caveat: ['Caveat', 'cursive'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
