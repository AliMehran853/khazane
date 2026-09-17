import { useEffect, useState } from 'react';

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // بررسی نصب بودن
    if (
      window.matchMedia &&
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      setIsInstalled(true);
    }

    if (window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    function onBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    }

    function onInstalled() {
      setDeferredPrompt(null);
      setCanInstall(false);
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setDeferredPrompt(null);
        setCanInstall(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Install prompt failed:', err);
      return false;
    }
  }

  return { canInstall, isInstalled, promptInstall };
}