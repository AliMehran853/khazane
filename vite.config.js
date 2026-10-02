import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',

      // ⭐ در حالت dev کاملاً غیرفعال است — هیچ SW register نمی‌شود
      devOptions: {
        enabled: false,
      },

      // ⭐ لینک manifest به صورت خودکار در build تزریق می‌شود
      injectRegister: 'auto',

      includeAssets: ['192.png', '512.png', 'fonts/*.ttf'],

      manifest: {
        id: '/',
        name: 'خزانه — مدیریت مصارف شخصی',
        short_name: 'خزانه',
        description:
          'اپلیکیشن مدیریت درآمد و مصارف شخصی، ساده، دقیق و کاملاً آفلاین',

        lang: 'fa',
        dir: 'rtl',

        start_url: '/',
        scope: '/',

        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',

        theme_color: '#0A1614',
        background_color: '#0A1614',

        categories: ['finance', 'productivity'],

        prefer_related_applications: false,

        icons: [
          {
            src: '/192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf}',
        ],

        navigateFallbackDenylist: [/^\/api/, /\.pdf$/],

        navigateFallback: '/index.html',

        // ⭐ در حالت dev این logها را خاموش می‌کند
        cleanupOutdatedCaches: true,
      },
    }),
  ],

  server: {
    host: true,
  },

  preview: {
    host: true,
  },
});