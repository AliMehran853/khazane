import { useEffect, useState } from 'react';

const DISMISS_KEY = 'khazane_install_dismissed_at';
const DISMISS_DAYS = 7;
const PROMPT_TIMEOUT = 2500;

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState('unknown');
  const [isInApp, setIsInApp] = useState(false);
  const [isChromeGo, setIsChromeGo] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // ⭐ بعد از تایم‌اوت: یعنی beforeinstallprompt نیامده
  const [promptTimedOut, setPromptTimedOut] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const nav = window.navigator || {};

    // ---------- ۱. تشخیص پلتفرم ----------
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isIPadOS =
      navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    const isAndroid = /Android/i.test(ua);

    if (isIOS || isIPadOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // ---------- ۲. تشخیص Chrome Go ----------
    // Chrome Go نسخه‌ی سبک Chrome برای دستگاه‌های Android Go است
    // که از PWA Install پشتیبانی نمی‌کند
    const chromeGoRegex = /Chrome\/[\d.]+ Mobile/;
    const androidGoRegex = /Android [\d.]+.*\bGo\b/;
    const isChromeGoUA =
      chromeGoRegex.test(ua) &&
      // اگر بعد از Chrome، "Go" یا "Android Go" باشه
      (ua.includes('Go') || androidGoRegex.test(ua));

    // راه دقیق‌تر: چک پشتیبانی PWA از قبل
    // Chrome Go معمولاً قبل از register شدن SW خطا می‌ده
    if (isChromeGoUA) {
      setIsChromeGo(true);
    }

    // ---------- ۳. تشخیص in-app browser ----------
    const inAppRegex =
      /FBAN|FBAV|FB_IAB|Instagram|Twitter|Line\/|WhatsApp|Telegram|MicroMessenger|LinkedInApp|Pinterest/i;
    setIsInApp(inAppRegex.test(ua));

    // ---------- ۴. چک نصب بودن ----------
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.matchMedia?.('(display-mode: fullscreen)').matches ||
      window.matchMedia?.('(display-mode: minimal-ui)').matches ||
      nav.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // ---------- ۵. dismiss قبلی ----------
    try {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const daysSince =
          (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
        if (daysSince < DISMISS_DAYS) {
          setDismissed(true);
        } else {
          localStorage.removeItem(DISMISS_KEY);
        }
      }
    } catch {
      /* ignore */
    }

    // ---------- ۶. beforeinstallprompt ----------
    function onBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
      setPromptTimedOut(false);
    }

    function onInstalled() {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setCanInstall(false);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    // ⭐ timeout: اگر بعد از ۲.۵ ثانیه پیام نیامد، راهنمای دستی نشون بده
    const timer = setTimeout(() => {
      // فقط اگر هنوز beforeinstallprompt نیامده
      setPromptTimedOut((prev) => prev || true);
    }, PROMPT_TIMEOUT);

    // چک نهایی: اگر canInstall بعد از timeout صدا زده شد، reset کن
    // (این خط را نگه داریم چون setTimeout مقداری closure قدیمی می‌گیره)
    const checkTimer = setTimeout(() => {
      // no-op placeholder
    }, 0);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(timer);
      clearTimeout(checkTimer);
    };
  }, []);

  // هر بار canInstall عوض می‌شه، promptTimedOut رو ریست کن
  useEffect(() => {
    if (canInstall) {
      setPromptTimedOut(false);
    }
  }, [canInstall]);

  async function promptInstall() {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;

      if (result.outcome === 'accepted') {
        setDeferredPrompt(null);
        setCanInstall(false);
        return true;
      } else {
        try {
          localStorage.setItem(DISMISS_KEY, String(Date.now()));
        } catch {
          /* ignore */
        }
        setDismissed(true);
        return false;
      }
    } catch (err) {
      console.error('Install prompt failed:', err);
      return false;
    }
  }

  // آیا باید راهنمای دستی نشون بدیم؟
  const showManualGuide =
    !isInstalled &&
    !dismissed &&
    !canInstall &&
    !isInApp &&
    promptTimedOut;

  return {
    // وضعیت‌ها
    canInstall,
    isInstalled,
    platform,
    isInApp,
    isChromeGo,
    dismissed,
    showManualGuide,
    // اکشن
    promptInstall,
  };
}