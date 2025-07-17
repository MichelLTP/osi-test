import { vitePlugin as remix } from "@remix-run/dev"
import { installGlobals } from "@remix-run/node"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import path from "path"

installGlobals()

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
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
