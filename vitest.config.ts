import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "build", ".remix"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app"),
      "~": path.resolve(__dirname, "./app"),
    },
  },
})
