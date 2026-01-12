/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
        'main': '#FFE6E6',
        'sub': '#FFCCCC'
        },
    },
  },
  plugins: [],
}