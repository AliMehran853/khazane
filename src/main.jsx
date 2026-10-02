import ReactDOM from 'react-dom/client';

import './i18n';
import './index.css';

import App from './app/App';

/* ============================================================
   در حالت dev، Service Worker و تمام cacheهای آن را به صورت
   اجباری پاک کن. یک بار reload می‌کند تا SW کاملاً از بین برود.
   ============================================================ */
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  const CLEAN_KEY = 'khazane_sw_cleaned_v2';
  const alreadyCleaned = sessionStorage.getItem(CLEAN_KEY);

  if (!alreadyCleaned) {
    const tasks = [];

    // ۱. Unregister همه‌ی Service Workerها
    tasks.push(
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          if (registrations.length === 0) return 0;
          return Promise.all(
            registrations.map((r) => r.unregister()),
          ).then(() => registrations.length);
        })
        .catch(() => 0),
    );

    // ۲. پاک کردن همه‌ی cacheها
    if ('caches' in window) {
      tasks.push(
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
          .then(() => true)
          .catch(() => false),
      );
    }

    Promise.all(tasks).then(([count]) => {
      sessionStorage.setItem(CLEAN_KEY, '1');
      // فقط اگر واقعاً SW فعال بود، یک بار reload کن
      if (count && count > 0) {
        window.location.reload();
      }
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);