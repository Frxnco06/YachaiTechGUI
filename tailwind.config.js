/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#000613",
        "primary-container": "#001f3f",
        "secondary": "#006a6a",
        "surface": "#f8f9fa",
        "on-surface": "#191c1d",
        "on-surface-variant": "#40484a",
        "outline": "#6f797a",
        "outline-variant": "#bfc8ca",
        "surface-container-lowest": "#ffffff",
      }
    },
  },
  plugins: [],
}