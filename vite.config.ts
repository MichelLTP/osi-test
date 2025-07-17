import { vitePlugin as remix } from "@remix-run/dev"
import { installGlobals } from "@remix-run/node"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import path from "path"
import { remixPWA } from "@remix-pwa/dev"

installGlobals()

export default defineConfig({
  plugins: [remix(), tsconfigPaths(), remixPWA()],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "app") }],
  },
  server: {
    host: true,
    port: 8000,
  },
  ssr: {
    noExternal: ["primereact"],
  },
})
