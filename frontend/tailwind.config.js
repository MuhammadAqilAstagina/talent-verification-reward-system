/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sleek modern color palette (vibrant blue & indigo)
        primary: {
          50: '#f0f3ff',
          100: '#e1e7ff',
          200: '#c8d3ff',
          300: '#a3b4ff',
          400: '#798dff',
          500: '#4f5eff', // primary brand color
          600: '#383fff',
          700: '#2629e6',
          800: '#2022bd',
          900: '#1e2197',
        },
      },
    },
  },
  plugins: [],
}
