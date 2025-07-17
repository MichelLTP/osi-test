import type { Config } from "tailwindcss"

const defaultTheme = require("tailwindcss/defaultTheme")
const plugin = require("tailwindcss/plugin")

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    fontFamily: {
      sans: ["Inter var", "sans-serif"],
      body: ["Inter var", "sans-serif"],
      orbitron: ["Orbitron", "sans-serif"],
    },

    fontSize: {
      xxs: ["0.714rem", { fontWeight: "400" }], // 10px
      xxsbold: ["0.714rem", { fontWeight: "700" }], // 10px
      xs: ["0.786rem", { fontWeight: "400" }], // 11px
      xsbold: ["0.786rem", { fontWeight: "700" }], // 11px
      sm: ["0.929rem", { fontWeight: "400" }], // 13px
      smbold: ["0.929rem", { fontWeight: "700" }], // 13px
      base: ["1rem", { fontWeight: "400", lineHeight: "1.5rem" }], // 14px
      basebold: ["1rem", { fontWeight: "700", lineHeight: "1.5rem" }], // 14px
      basesemibold: ["1rem", { fontWeight: "600", lineHeight: "1.5rem" }], // 14px
      xl: ["1.143rem", { fontWeight: "400" }], // 16px
      xlbold: ["1.143rem", { fontWeight: "700" }], // 16px
      "2xl": ["1.429rem", { fontWeight: "400" }], // 20px
      "2xlbold": ["1.429rem", { fontWeight: "700" }], // 20px
      "3xl": ["1.857rem", { fontWeight: "400" }], // 26px
      "3xlbold": ["1.857rem", { fontWeight: "700" }], // 26px
      "4xl": ["2.286rem", { fontWeight: "400" }], // 32px
      "4xlbold": ["2.286rem", { fontWeight: "700" }], // 32px
      "5xl": ["3.429rem", { fontWeight: "400" }], // 48px
      "5xlbold": ["3.429rem", { fontWeight: "700" }], // 48px
    },
    container: {
      center: true,
      padding: "2.143rem",
      screens: {
        "2xl": "1150px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#6785FB",
        },
        secondary: {
          DEFAULT: "#1F3044",
        },
        third: {
          DEFAULT: "#F4F5FB",
        },
        fourth: {
          DEFAULT: "#0E2038",
        },
        "primary-dark": {
          DEFAULT: "#343541",
        },
        "secondary-dark": {
          DEFAULT: "#3E3F4B",
        },
        "third-dark": {
          DEFAULT: "#545454",
        },
        error: {
          DEFAULT: "#DE574D",
        },
        success: {
          DEFAULT: "#00AF86",
        },
        warning: {
          DEFAULT: "#F5AF00",
        },
      },
      textUnderlineOffset: {
        5: "5px",
        6: "6px",
        7: "7px",
      },
      borderRadius: {
        lg: "2.143rem", // 30px
        md: "1.429rem", // 20px
        sm: "1.071rem", // 15px
        xs: "0.714rem", // 10px
        xxs: "0.357rem", // 5px
      },
      padding: {
        sidebarOpen: "290px",
        sidebarClosed: "97px",
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
        typing: {
          from: { width: "0%" },
          to: { width: "100%" },
        },
        cursor: {
          "0%, 100%": { "border-color": "transparent" },
          "50%": { "border-color": "currentColor" },
        },
        blink: {
          "50%": {
            borderColor: "transparent",
          },
          "100%": {
            borderColor: "white",
          },
        },
        "size-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        typing: "typing 1.5s steps(40, end), blink .7s",
        cursor: "cursor 0.75s step-end infinite",
        "size-pulse": "size-pulse 2s ease-in-out infinite",
      },
      screens: {
        "custom-height-sm": { raw: "(min-height: 750px)" },
        "custom-height-mq": { raw: "(min-height: 860px)" },
        xs: "420px",
      },
      typography: {
        default: {
          css: {
            pre: false,
            code: false,
            "pre code": false,
            "code::before": false,
            "code::after": false,
          },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        html: { fontSize: "14px" },
      })
    }),
    require("@tailwindcss/container-queries"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config

export default config
