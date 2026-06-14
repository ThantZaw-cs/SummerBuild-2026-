import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm civic accent (was hsl(23 70% 45%))
        primary: {
          DEFAULT: "#C36022",
          dark: "#A6501B",
          soft: "#F9ECE3",
        },
        // Deep navy ink (headings / dark surfaces)
        ink: "#0A2A4F",
        accent: "#2E9486", // teal
        canvas: "#F7F9FB", // app background
        line: "#E6EAF0", // hairline borders
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      keyframes: {
        pulseSoft: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
