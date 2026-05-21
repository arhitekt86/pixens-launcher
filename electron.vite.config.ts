import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Renderer = the Claude Design React+Vite+TS+Tailwind app (dropped into
// src/renderer later). Until then a placeholder renderer runs so the
// Electron shell is verifiable end-to-end.
export default defineConfig({
  main: {
    build: { outDir: 'out/main', lib: { entry: 'src/main/index.ts' } }
  },
  preload: {
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'),
          game: resolve(__dirname, 'src/preload/game.ts')
        },
        output: { entryFileNames: '[name].js', format: 'cjs' }
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    // relative base so the built assets resolve under Electron file://
    base: './',
    resolve: { alias: { '@': resolve(__dirname, 'src/renderer/src') } },
    plugins: [react()],
    build: {
      outDir: 'out/renderer',
      rollupOptions: { input: resolve(__dirname, 'src/renderer/index.html') }
    }
  }
})
