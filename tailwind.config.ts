import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Keep these roles aligned with DESIGN.md before adding new UI colors.
      colors: {
        bg: "#F3F6FB",
        surface: "#FFFFFF",
        card: "#F9FBFF",
        "card-h": "#EAF1FA",
        accent: "#244D7A",
        "accent-d": "#E4EDF8",
        pink: "#8D3D50",
        "pink-d": "#F3E3EA",
        mint: "#3C609C",
        "mint-d": "#E8F0FF",
        gold: "#74644F",
        "gold-d": "#EFE8DC",
        t1: "#111827",
        t2: "#43516A",
        t3: "#7D8BA4",
        border: "rgba(24, 48, 84, 0.13)",
        "border-s": "rgba(24, 48, 84, 0.24)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Manrope", "sans-serif"],
        display: ["var(--font-display)", "Space Grotesk", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
