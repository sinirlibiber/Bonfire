/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bonfire: {
          happy: "#FFD700",
          sad: "#4169E1",
          angry: "#DC143C",
          fear: "#800080",
          mixed: "#FF8C00",
          dark: "#0a0a0a",
          ember: "#FF4500",
        },
      },
      animation: {
        "flicker": "flicker 0.15s ease-in-out infinite alternate",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        flicker: {
          "0%": { transform: "scaleX(1) scaleY(1)", opacity: "0.9" },
          "100%": { transform: "scaleX(1.03) scaleY(1.05)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
