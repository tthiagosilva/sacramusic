import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa' // DESCOMENTE APÓS INSTALAR: npm install -D vite-plugin-pwa

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    /* DESCOMENTE ABAIXO PARA ATIVAR PWA APÓS INSTALAR O PLUGIN
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'SacraMusic',
        short_name: 'SacraMusic',
        description: 'Gerenciador de repertório para ministério de música',
        theme_color: '#0d9488',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
    */
  ],
})
