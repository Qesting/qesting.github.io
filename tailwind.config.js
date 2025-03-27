/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        accent: "oklch(0.457 0.24 277.023)",
        accentDark: "oklch(0.5524 0.2386 277.117)"
      }
    },
  },
  plugins: []
}

