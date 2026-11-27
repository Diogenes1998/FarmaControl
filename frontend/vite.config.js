import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Las peticiones a /api se reenvían al servidor Express (Etapa 10)
const proxyApi = {
  '/api': 'http://localhost:3000',
}

// https://vite.dev/config/
export default defineConfig({
  // Rutas relativas: la app funciona en la raíz de un dominio o en una subcarpeta
  base: './',
  plugins: [react(), tailwindcss()],
  server: { proxy: proxyApi }, // npm run dev
  preview: { proxy: proxyApi }, // npm run preview
})
