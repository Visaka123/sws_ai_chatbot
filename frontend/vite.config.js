import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Ensure export default explicitly returns the configuration object
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ]
})