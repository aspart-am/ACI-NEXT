import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Palette de couleurs inspirée de Doctolib et de l'image MSP Gestion
        primary: {
          DEFAULT: "#0072CE", // Bleu Doctolib principal
          foreground: "#FFFFFF",
          50: "#E6F3FB",
          100: "#CCE7F7",
          200: "#99CFEF",
          300: "#66B7E7",
          400: "#339FDF",
          500: "#0072CE", // Base
          600: "#005BA5",
          700: "#00447C",
          800: "#002D52",
          900: "#001629",
        },
        secondary: {
          DEFAULT: "#EAF6FC", // Bleu très clair pour fond secondaire
          foreground: "#0072CE",
        },
        sidebar: {
          DEFAULT: "#005BA5", // Bleu foncé pour la barre latérale
          foreground: "#FFFFFF",
          accent: "#0072CE",
          border: "rgba(255, 255, 255, 0.1)",
        },
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "rgba(0, 114, 206, 0.3)",
        background: "#FFFFFF",
        foreground: "#000000",
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F9FAFB",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#F9FAFB",
          foreground: "#0072CE",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        // Couleurs pour graphiques
        chart: {
          1: "#0072CE",
          2: "#339FDF",
          3: "#66B7E7",
          4: "#99CFEF",
          5: "#CCE7F7",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config; 