import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allow the sandboxed preview proxy hosts to reach the dev server.
    allowedHosts: ['.e2b.app'],
  },
  preview: {
    allowedHosts: ['.e2b.app'],
  },
})
