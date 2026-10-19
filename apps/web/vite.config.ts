import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { seoBuild } from "./seo-build.ts"
import { assertPublicEnv } from "./server/assert-public-env.ts"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  assertPublicEnv({ ...loadEnv(mode, process.cwd(), "VITE_"), ...process.env })
  return {
    plugins: [react(), tailwindcss(), seoBuild()],
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "./src"),
      },
    },
  }
})
