import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/chat': 'http://localhost:4000',
      '/proactive': 'http://localhost:4000',
      '/mark-read': 'http://localhost:4000',
    },
  },
})
