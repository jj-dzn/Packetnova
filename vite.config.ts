import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.svg'],
      manifest: {
        name: 'PacketNova',
        short_name: 'PacketNova',
        description:
          'Free, client-side networking toolkit: calculators, protocol explorers, and interactive visualizers.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0a0a12',
        theme_color: '#0a0a12',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Every build's content-hashed JS/CSS chunk, precached so the app
        // shell and every tool a visitor has already downloaded once keep
        // working offline -- the manifest itself is regenerated fresh on
        // every build, so a new deploy's old chunks are cleaned up
        // automatically instead of a hand-rolled cache silently going stale.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
