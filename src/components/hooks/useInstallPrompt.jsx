import { useEffect, useState } from 'react';

import { STORAGE_KEYS } from '../utils/constants';

const DISMISS_KEY = STORAGE_KEYS.installDismissed;
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
  const [promptTimedOut, setPromptTimedOut] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const nav = window.navigator || {};

    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isIPadOS =
      navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    const isAndroid = /Android/i.test(ua);

    if (isIOS || isIPadOS) setPlatform('ios');
    else if (isAndroid) setPlatform('android');
    else setPlatform('desktop');

    const chromeGoRegex = /Chrome\/[\d.]+ Mobile/;
    const androidGoRegex = /Android [\d.]+.*\bGo\b/;
    const isChromeGoUA =
      chromeGoRegex.test(ua) && (ua.includes('Go') || androidGoRegex.test(ua));

    if (isChromeGoUA) setIsChromeGo(true);

    const inAppRegex =
      /FBAN|FBAV|FB_IAB|Instagram|Twitter|Line\/|WhatsApp|Telegram|MicroMessenger|LinkedInApp|Pinterest/i;
    setIsInApp(inAppRegex.test(ua));

    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.matchMedia?.('(display-mode: fullscreen)').matches ||
      window.matchMedia?.('(display-mode: minimal-ui)').matches ||
      nav.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    try {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const daysSince =
          (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
        if (daysSince < DISMISS_DAYS) setDismissed(true);
        else localStorage.removeItem(DISMISS_KEY);
      }
    } catch {
      /* ignore */
    }

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

    const timer = setTimeout(() => {
      setPromptTimedOut((prev) => prev || true);
    }, PROMPT_TIMEOUT);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (canInstall) setPromptTimedOut(false);
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

  const showManualGuide =
    !isInstalled && !dismissed && !canInstall && !isInApp && promptTimedOut;

  return {
    canInstall,
    isInstalled,
    platform,
    isInApp,
    isChromeGo,
    dismissed,
    showManualGuide,
    promptInstall,
  };
}