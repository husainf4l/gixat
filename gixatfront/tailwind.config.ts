import type { Config } from "tailwindcss";

const config: Config = {
  // Always use dark mode by default
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2B5B63", // Deep Teal Blue
        secondary: "#E5A940", // Warm Mustard Yellow
        black: "#000000", // Matte Black
        background: "#0F172A", // Dark background instead of light off-white
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;