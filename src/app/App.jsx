import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';

import router from './router';
import { seedDatabase } from '../components/db/seed';
import { useAppStore } from '../components/store/appStore';
import { applyRegion } from '../services/regionService';

function App() {
  const theme = useAppStore((s) => s.theme);
  const [ready, setReady] = useState(false);

  // راه‌اندازی اولیه: دیتابیس + اعمال منطقه ذخیره‌شده
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await seedDatabase();
        await applyRegion();
      } catch (error) {
        console.error('Failed to initialize Khazane:', error);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  // اعمال تم
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // ⭐ App دیگر useTranslation ندارد
  // ⭐ App دیگر useEffect روی i18n.language ندارد
  // تغییر dir و lang فقط از طریق i18n/index.js → applyDirection انجام می‌شود

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="kh-bg-layer" data-theme={theme} aria-hidden="true">
        <div className="kh-bg-img" />
        <div className="kh-bg-overlay" />
      </div>

      <RouterProvider router={router} />
    </>
  );
}

export default App;