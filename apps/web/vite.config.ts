import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { seoBuild } from "./seo-build.ts"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seoBuild()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
})
