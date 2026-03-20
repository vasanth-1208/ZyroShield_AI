import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        destructive: "hsl(var(--destructive))"
      },
      borderRadius: {
        xl: "1rem",
        lg: "0.75rem",
        md: "0.5rem"
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-grotesk)", "ui-sans-serif", "system-ui"]
      },
      keyframes: {
        "pulse-success": {
          "0%,100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.04)", opacity: "0.86" }
        }
      },
      animation: {
        "pulse-success": "pulse-success 1.4s ease-in-out infinite"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.18), 0 24px 40px rgba(0,0,0,0.35)"
      },
      backgroundImage: {
        "mesh-light": "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.22), transparent 35%), radial-gradient(circle at 80% 10%, rgba(16,185,129,0.2), transparent 40%), radial-gradient(circle at 50% 90%, rgba(249,115,22,0.16), transparent 40%)",
        "mesh-dark": "radial-gradient(circle at 15% 20%, rgba(6,182,212,0.22), transparent 30%), radial-gradient(circle at 80% 20%, rgba(34,197,94,0.18), transparent 35%), radial-gradient(circle at 40% 80%, rgba(234,88,12,0.2), transparent 35%)"
      }
    }
  },
  plugins: []
};

export default config;
