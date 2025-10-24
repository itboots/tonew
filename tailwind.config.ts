import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          primary: "#00f0ff",
          secondary: "#ff00ff",
          accent: "#7b2cbf",
          dark: "#0a0e27",
          card: "#1a1f3a",
          text: "#e0e0e0",
        },
      },
      fontFamily: {
        cyber: ["Orbitron", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
