import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10222d",
        mist: "#f6f5ef",
        tide: "#dbe8ea",
        ember: "#d56b3d",
        moss: "#4c7b6d",
        gold: "#d7aa2f"
      },
      boxShadow: {
        panel: "0 20px 40px rgba(16, 34, 45, 0.12)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
