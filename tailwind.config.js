/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        "draft-blue": {
          900: "#0A1628",
          700: "#1E3A5F", // Primary brand
          500: "#2E5A8F",
          300: "#5B8BC4",
          100: "#B8D4F0",
        },
        "track-orange": {
          900: "#CC3300",
          700: "#FF6B35", // Primary brand
          500: "#FF8555",
          300: "#FFB399",
          100: "#FFE5DB",
        },

        // UI Surface Colors
        surface: {
          0: "#0F172A", // Main background
          1: "#1E293B", // Panels, cards
          2: "#334155", // Elevated elements
          3: "#475569", // Modals, popovers
        },

        // Text Colors
        text: {
          primary: "#F8FAFC",
          secondary: "#CBD5E1",
          tertiary: "#94A3B8",
          disabled: "#64748B",
        },

        // Section Colors (song structure)
        section: {
          verse: "#000000",
          chorus: "#FFD700",
          bridge: "#8B5CF6",
          intro: "#6B7280",
          outro: "#4B5563",
        },

        // Legacy support (will phase out)
        "dark-bg": "#0F172A",
        "dark-surface": "#1E293B",
        "dark-elevated": "#334155",
        accent: "#FF6B35", // track-orange-700
        "accent-hover": "#FF8555", // track-orange-500
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Monaco", "monospace"],
      },
      spacing: {
        // 8px base grid system
        18: "4.5rem", // 72px
        22: "5.5rem", // 88px
      },
    },
  },
  plugins: [],
};
