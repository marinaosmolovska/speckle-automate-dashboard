import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './', // ← CRITICAL for Speckle embedding
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Inline small assets for better compatibility
    assetsInlineLimit: 4096
  },
  server: {
    port: 5173,
    strictPort: false
  }
})
