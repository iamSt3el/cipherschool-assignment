/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EA580C', // orange-500
          dark: '#C2410C',    // orange-700
          light: '#FB923C',   // orange-400
        },
      },
    },
  },
  plugins: [],
}
