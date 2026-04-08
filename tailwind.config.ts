import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        slate: "#1f2937",
        mist: "#f3f4f6",
        line: "#d1d5db",
        success: "#166534",
        warning: "#92400e",
        danger: "#991b1b",
        accent: "#0f766e"
      },
      boxShadow: {
        panel: "0 20px 60px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
