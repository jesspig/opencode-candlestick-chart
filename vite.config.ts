import { resolve } from "path"
import { defineConfig } from "electron-vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  main: {
    build: {
      outDir: "out/main",
      rollupOptions: {
        external: ["electron"],
      },
    },
  },
  preload: {
    build: {
      outDir: "out/preload",
      rollupOptions: {
        external: ["electron"],
      },
    },
  },
  renderer: {
    plugins: [react()],
    build: {
      outDir: "out/renderer",
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/renderer/index.html"),
        },
      },
    },
    css: {
      postcss: "./postcss.config.js",
    },
  },
})
