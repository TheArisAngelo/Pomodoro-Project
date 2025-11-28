/** @type {import('tailwindcss').Config} */
const data = "red"

module.exports = {
  darkMode: "class",
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        arialRounded: ["ArialRounded", "sans-serif"],
      },
      colors: {
        lightSoftTomato: "#f48167",
        softTomato: "#f26c4d",
        darkTomato: "#f05734",
        tomato: "#ff6347",
        bisque: "#ea4126",
        textColor: "hsl(357, 12%, 42%)",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
      },
    },
  },
  plugins: [],
}
