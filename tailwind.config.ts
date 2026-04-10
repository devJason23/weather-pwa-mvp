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
        accent: "#0f766e",
        "brand-green": "var(--brand-green)",
        "brand-green-deep": "var(--brand-green-deep)",
        "brand-green-soft": "var(--brand-green-soft)",
        "brand-ink": "var(--brand-ink)",
        "brand-ink-soft": "var(--brand-ink-soft)",
        "brand-muted": "var(--brand-muted)",
        "brand-line": "var(--brand-line)",
        "brand-surface": "var(--brand-surface)",
        "brand-surface-soft": "var(--brand-surface-soft)",
        "brand-page": "var(--brand-page)",
        "brand-silver": "var(--brand-silver)"
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
        soft: "var(--shadow-soft)"
      }
    }
  },
  plugins: []
};

export default config;
