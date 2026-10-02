import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fa from './locales/fa.json';
import en from './locales/en.json';

const STORAGE_KEY = 'khazane_language';

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'fa' || saved === 'en') return saved;
  } catch {
    /* ignore */
  }
  return 'fa';
}

const initialLang = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    fa: { translation: fa },
    en: { translation: en },
  },
  lng: initialLang,
  fallbackLng: 'fa',
  interpolation: { escapeValue: false },
  returnNull: false,
  // ⭐ حیاتی برای موبایل: همگام‌سازی کامل بدون Promise/Suspense
  initImmediate: false,
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
    transEmptyNodeValue: '',
  },
});

// اعمال dir و lang پیش از mount
(function applyInitialDirection() {
  if (typeof document === 'undefined') return;
  const dir = initialLang === 'fa' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', initialLang);
})();

/**
 * تغییر زبان — کاملاً synchronous + جلوگیری از سفیدی روی موبایل.
 *
 * ترتیب دقیق:
 *   ۱. کلاس lang-switch اضافه می‌شود (transition/animation خاموش)
 *   ۲. زبان i18n عوض می‌شود (React re-render شروع می‌شود)
 *   ۳. dir و lang در همان tick عوض می‌شوند
 *   ۴. در دو requestAnimationFrame بعدی، کلاس برداشته می‌شود
 */
export function changeLanguage(lang) {
  if (lang !== 'fa' && lang !== 'en') return;
  if (i18n.language === lang) return;

  if (typeof document === 'undefined') return;
  const html = document.documentElement;

  // ۱. خاموش کردن انیمیشن‌ها و transitions قبل از تغییر
  html.classList.add('lang-switch');

  // ۲. تغییر زبان i18n
  i18n.changeLanguage(lang);

  // ۳. تغییر dir و lang در همان tick (بدون صبر)
  const dir = lang === 'fa' ? 'rtl' : 'ltr';
  if (html.getAttribute('dir') !== dir) html.setAttribute('dir', dir);
  if (html.getAttribute('lang') !== lang) html.setAttribute('lang', lang);

  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }

  // ۴. حذف کلاس بعد از اینکه دو paint کامل شد
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      html.classList.remove('lang-switch');
    });
  });
}

export default i18n;