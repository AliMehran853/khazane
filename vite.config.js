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

      devOptions: {
        enabled: false,
      },

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

        // ⭐ مهم برای Chrome جدید: پیشنهاد نصب اپ native نده
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
          // ⭐ یک entry برای هر دو purpose (روش استاندارد)
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

        // ⭐ اجازه بده صفحه اصلی کش بشه
        navigateFallback: '/index.html',
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