import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    },
    middlewareMode: false,
    hmr: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  optimizeDeps: {
    include: ['survey-core', 'survey-creator-core', 'survey-creator-js']
  },
  build: {
    rollupOptions: {
      external: [
        'survey-core/survey-core.fontless.min.css',
        'survey-creator-core/survey-creator-core.fontless.min.css',
        'survey-js-ui'
      ]
    }
  }
})